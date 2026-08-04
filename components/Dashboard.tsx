'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calculateAge, formatBirthDate, patientProfile } from '@/lib/patient';
import { formatDateForChart, formatDateForDisplay } from '@/lib/reading-format';
import type { Reading } from '@/lib/types';

const average = (values: Array<number | null>) => {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
};

const statusClass = (value: number | null, postMeal = false) => {
  if (value === null) return 'badge';
  if (value < 70) return 'badge low';
  const upper = postMeal ? 180 : 130;
  if (value <= upper) return 'badge ok';
  if (value <= 250) return 'badge high';
  return 'badge very-high';
};

const show = (value: number | null) => value === null ? '—' : value;

const chartSeries = [
  { key: 'fasting', name: 'Fasting', color: '#2563eb' },
  { key: 'postBreakfast', name: 'Post-breakfast', color: '#f97316' },
  { key: 'night', name: 'Night', color: '#10b981' }
] as const;

export default function Dashboard({ readings }: { readings: Reading[] }) {
  const latest = readings.at(-1);
  const last7 = readings.slice(-7);
  const patientAge = calculateAge(patientProfile.birthDate);
  const chartData = readings.slice(-30).map((r) => ({
    date: formatDateForChart(r.date),
    fasting: r.fastingSugar,
    postBreakfast: r.postBreakfastSugar,
    night: r.nightSugar
  }));

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1 style={{margin:'0 0 6px'}}>Blood Sugar Dashboard</h1>
          <div className="muted">Read-only summary for doctor review</div>
          <div style={{marginTop:12, fontSize:14, color:'#334155'}}>
            <strong>{patientProfile.name}</strong> • Age {patientAge} • Born {formatBirthDate(patientProfile.birthDate)} • {patientProfile.maritalStatus}
          </div>
        </div>
        <button onClick={() => window.print()} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #d9dde2', background:'#fff', cursor:'pointer'}}>Print / Save PDF</button>
      </div>

      <section className="card">
        <h2 style={{marginTop:0}}>Daily readings</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Fasting</th><th>Breakfast insulin</th><th>Post-breakfast</th><th>Dinner insulin</th><th>Night</th><th>Notes</th></tr></thead>
            <tbody>{[...readings].reverse().map((r, i) => (
              <tr key={`${r.date}-${i}`}>
                <td><strong>{formatDateForDisplay(r.date)}</strong></td>
                <td><span className={statusClass(r.fastingSugar)}>{show(r.fastingSugar)}</span><br/><small>{r.beforeBreakfastTime}</small></td>
                <td>{show(r.breakfastInsulin)} units<br/><small>{r.breakfastInsulinTime}</small></td>
                <td><span className={statusClass(r.postBreakfastSugar, true)}>{show(r.postBreakfastSugar)}</span><br/><small>{r.postBreakfastTime}</small></td>
                <td>{show(r.dinnerInsulin)} units<br/><small>{r.dinnerInsulinTime}</small></td>
                <td><span className={statusClass(r.nightSugar, true)}>{show(r.nightSugar)}</span><br/><small>{r.nightTestTime}</small></td>
                <td>{r.notes || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="grid cards" style={{marginTop:14}}>
        <div className="card"><div className="muted">Latest fasting</div><div className="value">{show(latest?.fastingSugar ?? null)} <small>mg/dL</small></div><div className={statusClass(latest?.fastingSugar ?? null)}>Latest</div></div>
        <div className="card"><div className="muted">Latest post-breakfast</div><div className="value">{show(latest?.postBreakfastSugar ?? null)} <small>mg/dL</small></div><div className={statusClass(latest?.postBreakfastSugar ?? null, true)}>Latest</div></div>
        <div className="card"><div className="muted">Latest night</div><div className="value">{show(latest?.nightSugar ?? null)} <small>mg/dL</small></div><div className={statusClass(latest?.nightSugar ?? null, true)}>Latest</div></div>
      </section>

      <section className="grid cards" style={{marginTop:14}}>
        <div className="card"><div className="muted">7-day fasting average</div><div className="value">{show(average(last7.map(r => r.fastingSugar)))} <small>mg/dL</small></div></div>
        <div className="card"><div className="muted">7-day post-breakfast average</div><div className="value">{show(average(last7.map(r => r.postBreakfastSugar)))} <small>mg/dL</small></div></div>
        <div className="card"><div className="muted">7-day night average</div><div className="value">{show(average(last7.map(r => r.nightSugar)))} <small>mg/dL</small></div></div>
      </section>

      <section className="card" style={{marginTop:14}}>
        <h2 style={{marginTop:0}}>Blood sugar trend</h2>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#dfe6ee" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#5b6470', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #d7dee8', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
                labelStyle={{ color: '#111827', fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {chartSeries.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 0, fill: series.color }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: series.color }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="muted" style={{fontSize:12}}>This dashboard displays recorded values only. It does not provide insulin-dosing or treatment recommendations.</p>
    </main>
  );
}
