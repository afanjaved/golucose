import Link from 'next/link';
import type { ReadingFormDefaults } from '@/lib/reading-form';

type ReadingFormProps = {
  action: (formData: FormData) => Promise<void>;
  cancelHref?: string;
  description: string;
  initialValues: ReadingFormDefaults;
  rowNumber?: number;
  submitLabel: string;
  title: string;
};

export default function ReadingForm({
  action,
  cancelHref,
  description,
  initialValues,
  rowNumber,
  submitLabel,
  title
}: ReadingFormProps) {
  const formId = rowNumber ? `reading-form-${rowNumber}` : 'reading-form-new';

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2 style={{margin:'0 0 6px'}}>{title}</h2>
          <div className="helper-text">{description}</div>
        </div>
      </div>

      <form action={action}>
        {rowNumber ? <input name="rowNumber" type="hidden" value={rowNumber} /> : null}

        <div className="form-grid">
          <div className="field">
            <label htmlFor={`${formId}-date`}>Date</label>
            <input defaultValue={initialValues.date} id={`${formId}-date`} name="date" required type="date" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-before-breakfast-time`}>Before breakfast test time</label>
            <input defaultValue={initialValues.beforeBreakfastTime} id={`${formId}-before-breakfast-time`} name="beforeBreakfastTime" type="time" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-fasting-sugar`}>Fasting sugar</label>
            <input defaultValue={initialValues.fastingSugar} id={`${formId}-fasting-sugar`} min="0" name="fastingSugar" step="any" type="number" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-breakfast-insulin`}>Breakfast insulin</label>
            <input defaultValue={initialValues.breakfastInsulin} id={`${formId}-breakfast-insulin`} min="0" name="breakfastInsulin" step="any" type="number" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-breakfast-insulin-time`}>Breakfast insulin time</label>
            <input defaultValue={initialValues.breakfastInsulinTime} id={`${formId}-breakfast-insulin-time`} name="breakfastInsulinTime" type="time" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-post-breakfast-time`}>Post-breakfast test time</label>
            <input defaultValue={initialValues.postBreakfastTime} id={`${formId}-post-breakfast-time`} name="postBreakfastTime" type="time" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-post-breakfast-sugar`}>Post-breakfast sugar</label>
            <input defaultValue={initialValues.postBreakfastSugar} id={`${formId}-post-breakfast-sugar`} min="0" name="postBreakfastSugar" step="any" type="number" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-dinner-insulin`}>Dinner insulin</label>
            <input defaultValue={initialValues.dinnerInsulin} id={`${formId}-dinner-insulin`} min="0" name="dinnerInsulin" step="any" type="number" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-dinner-insulin-time`}>Dinner insulin time</label>
            <input defaultValue={initialValues.dinnerInsulinTime} id={`${formId}-dinner-insulin-time`} name="dinnerInsulinTime" type="time" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-night-test-time`}>Night test time</label>
            <input defaultValue={initialValues.nightTestTime} id={`${formId}-night-test-time`} name="nightTestTime" type="time" />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-night-sugar`}>Night sugar</label>
            <input defaultValue={initialValues.nightSugar} id={`${formId}-night-sugar`} min="0" name="nightSugar" step="any" type="number" />
          </div>
        </div>

        <div className="field" style={{marginTop:14}}>
          <label htmlFor={`${formId}-notes`}>Notes</label>
          <textarea defaultValue={initialValues.notes} id={`${formId}-notes`} name="notes" placeholder="Walks, meals, exercise, symptoms, or anything worth remembering." />
        </div>

        <div className="form-actions">
          {cancelHref ? <Link className="button-secondary" href={cancelHref}>Cancel</Link> : null}
          <button className="button-primary" type="submit">{submitLabel}</button>
        </div>
      </form>
    </section>
  );
}
