import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import ReadingForm from '@/components/ReadingForm';
import { calculateAge, formatBirthDate, patientProfile } from '@/lib/patient';
import { toReadingFormDefaults, validateReadingFormData } from '@/lib/reading-form';
import { formatDateForDisplay } from '@/lib/reading-format';
import { appendReading, getSheetReadings, updateReading } from '@/lib/sheets';
import type { SheetReading } from '@/lib/types';

export const dynamic = 'force-dynamic';

const readQueryValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';

const buildPatientPath = (token: string, params?: Record<string, string | undefined>) => {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const search = query.toString();
  return search ? `/patient/${token}?${search}` : `/patient/${token}`;
};

const matchesSearch = (reading: SheetReading, query: string) => {
  const haystack = [
    reading.date,
    formatDateForDisplay(reading.date),
    reading.beforeBreakfastTime,
    reading.fastingSugar === null ? '' : String(reading.fastingSugar),
    reading.breakfastInsulin === null ? '' : String(reading.breakfastInsulin),
    reading.breakfastInsulinTime,
    reading.postBreakfastTime,
    reading.postBreakfastSugar === null ? '' : String(reading.postBreakfastSugar),
    reading.dinnerInsulin === null ? '' : String(reading.dinnerInsulin),
    reading.dinnerInsulinTime,
    reading.nightTestTime,
    reading.nightSugar === null ? '' : String(reading.nightSugar),
    reading.notes
  ].join(' ').toLowerCase();

  return haystack.includes(query.toLowerCase());
};

const noticeContent: Record<string, { tone: 'success' | 'warn'; text: string }> = {
  added: {
    tone: 'success',
    text: 'Reading added to Google Sheets.'
  },
  invalid: {
    tone: 'warn',
    text: 'Please check the form fields and try again.'
  },
  updated: {
    tone: 'success',
    text: 'Reading updated in Google Sheets.'
  }
};

export default async function PatientPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ q?: string | string[]; edit?: string | string[]; notice?: string | string[] }>;
}) {
  const { token } = await params;
  if (!process.env.PATIENT_ACCESS_TOKEN || token !== process.env.PATIENT_ACCESS_TOKEN) notFound();

  const currentSearchParams = await searchParams;
  const query = readQueryValue(currentSearchParams.q).trim();
  const editParam = readQueryValue(currentSearchParams.edit).trim();
  const notice = noticeContent[readQueryValue(currentSearchParams.notice).trim()] ?? null;

  const readings = await getSheetReadings();
  const filteredReadings = query ? readings.filter((reading) => matchesSearch(reading, query)) : readings;
  const sortedReadings = [...filteredReadings].sort((left, right) => right.rowNumber - left.rowNumber);
  const editRowNumber = Number(editParam);
  const editReading = Number.isInteger(editRowNumber) ? readings.find((reading) => reading.rowNumber === editRowNumber) : undefined;
  const latestReading = readings.at(-1);
  const patientAge = calculateAge(patientProfile.birthDate);
  const basePath = buildPatientPath(token);
  const clearEditPath = buildPatientPath(token, { q: query || undefined });

  async function addReadingAction(formData: FormData) {
    'use server';

    const validated = validateReadingFormData(formData);
    if (!validated.success) {
      redirect(buildPatientPath(token, { notice: 'invalid' }));
    }

    await appendReading(validated.data);
    revalidatePath(buildPatientPath(token));

    if (process.env.DOCTOR_ACCESS_TOKEN) {
      revalidatePath(`/doctor/${process.env.DOCTOR_ACCESS_TOKEN}`);
    }

    redirect(buildPatientPath(token, { notice: 'added' }));
  }

  async function updateReadingAction(formData: FormData) {
    'use server';

    const rowNumber = Number(formData.get('rowNumber'));
    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      redirect(buildPatientPath(token, { q: query || undefined, notice: 'invalid' }));
    }

    const validated = validateReadingFormData(formData);
    if (!validated.success) {
      redirect(buildPatientPath(token, {
        edit: String(rowNumber),
        notice: 'invalid',
        q: query || undefined
      }));
    }

    await updateReading(rowNumber, validated.data);
    revalidatePath(buildPatientPath(token));

    if (process.env.DOCTOR_ACCESS_TOKEN) {
      revalidatePath(`/doctor/${process.env.DOCTOR_ACCESS_TOKEN}`);
    }

    redirect(buildPatientPath(token, {
      notice: 'updated',
      q: query || undefined
    }));
  }

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1 style={{margin:'0 0 6px'}}>Aafhan Reading Manager</h1>
          <div className="muted">Private add, edit, and search page connected directly to Google Sheets</div>
          <div style={{marginTop:12, fontSize:14, color:'#334155'}}>
            <strong>{patientProfile.name}</strong> • Age {patientAge} • Born {formatBirthDate(patientProfile.birthDate)} • {patientProfile.maritalStatus}
          </div>
        </div>
      </div>

      <section className="grid cards" style={{marginTop:14}}>
        <div className="card">
          <div className="muted">Total readings</div>
          <div className="value">{readings.length}</div>
        </div>
        <div className="card">
          <div className="muted">Search results</div>
          <div className="value">{sortedReadings.length}</div>
        </div>
        <div className="card">
          <div className="muted">Latest logged date</div>
          <div className="value" style={{fontSize:24}}>{latestReading ? formatDateForDisplay(latestReading.date) : 'No readings yet'}</div>
        </div>
      </section>

      <section className="card" style={{marginTop:14}}>
        <div className="section-head">
          <div>
            <h2 style={{margin:'0 0 6px'}}>Search readings</h2>
            <div className="helper-text">Search by date, sugar values, insulin values, time, or notes.</div>
          </div>
        </div>

        <form action={basePath} className="search-bar" method="get">
          <input className="search-input" defaultValue={query} name="q" placeholder="Try 2-Aug-2026, 91, walk, or 25" type="search" />
          <button className="button-primary" type="submit">Search</button>
          {query ? <Link className="button-secondary" href={basePath}>Clear</Link> : null}
        </form>
      </section>

      {notice ? <div className={`status-note ${notice.tone}`} style={{marginTop:14}}>{notice.text}</div> : null}

      <div className="manage-layout" style={{marginTop:14}}>
        <ReadingForm
          action={addReadingAction}
          description="Use the form instead of editing the sheet manually. The date and time pickers keep entry faster and cleaner."
          initialValues={toReadingFormDefaults()}
          submitLabel="Add reading"
          title="Add new reading"
        />

        {editReading ? (
          <ReadingForm
            action={updateReadingAction}
            cancelHref={clearEditPath}
            description={`Editing row ${editReading.rowNumber} from the Google Sheet.`}
            initialValues={toReadingFormDefaults(editReading)}
            rowNumber={editReading.rowNumber}
            submitLabel="Save changes"
            title={`Edit reading for ${formatDateForDisplay(editReading.date)}`}
          />
        ) : null}
      </div>

      <section className="card" style={{marginTop:14}}>
        <div className="section-head">
          <div>
            <h2 style={{margin:'0 0 6px'}}>Existing readings</h2>
            <div className="helper-text">
              {query ? `Showing ${sortedReadings.length} matching readings.` : 'Showing all readings, newest first.'}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Fasting</th>
                <th>Breakfast insulin</th>
                <th>Post-breakfast</th>
                <th>Dinner insulin</th>
                <th>Night</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedReadings.length ? sortedReadings.map((reading) => (
                <tr className={editReading?.rowNumber === reading.rowNumber ? 'reading-row-active' : undefined} key={reading.rowNumber}>
                  <td><strong>{formatDateForDisplay(reading.date)}</strong><br /><small>Sheet row {reading.rowNumber}</small></td>
                  <td>{reading.fastingSugar ?? '—'}<br /><small>{reading.beforeBreakfastTime || '—'}</small></td>
                  <td>{reading.breakfastInsulin ?? '—'} units<br /><small>{reading.breakfastInsulinTime || '—'}</small></td>
                  <td>{reading.postBreakfastSugar ?? '—'}<br /><small>{reading.postBreakfastTime || '—'}</small></td>
                  <td>{reading.dinnerInsulin ?? '—'} units<br /><small>{reading.dinnerInsulinTime || '—'}</small></td>
                  <td>{reading.nightSugar ?? '—'}<br /><small>{reading.nightTestTime || '—'}</small></td>
                  <td>{reading.notes || '—'}</td>
                  <td>
                    <Link className="inline-link" href={buildPatientPath(token, {
                      edit: String(reading.rowNumber),
                      q: query || undefined
                    })}>
                      Edit
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8}>No readings match this search yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
