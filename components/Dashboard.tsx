'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
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

export default function Dashboard({ readings }: { readings: Reading[] }) {
  const latest = readings.at(-1);
  const last7 = readings.slice(-7);
  const chartData = readings.slice(-30).map((r) => ({
    date: r.date.replace('-2026', ''),
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
        </div>
        <button onClick={() => window.print()} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #d9dde2', background:'#fff', cursor:'pointer'}}>Print / Save PDF</button>
      </div>

      <section className="grid cards">
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fasting" name="Fasting" connectNulls />
              <Line type="monotone" dataKey="postBreakfast" name="Post-breakfast" connectNulls />
              <Line type="monotone" dataKey="night" name="Night" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card" style={{marginTop:14}}>
        <h2 style={{marginTop:0}}>Daily readings</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Fasting</th><th>Breakfast insulin</th><th>Post-breakfast</th><th>Dinner insulin</th><th>Night</th><th>Notes</th></tr></thead>
            <tbody>{[...readings].reverse().map((r, i) => (
              <tr key={`${r.date}-${i}`}>
                <td><strong>{r.date}</strong></td>
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

      <p className="muted" style={{fontSize:12}}>This dashboard displays recorded values only. It does not provide insulin-dosing or treatment recommendations.</p>
    </main>
  );
}
