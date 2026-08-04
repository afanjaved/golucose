# Blood Sugar Dashboard

Next.js dashboard for the Google Sheet:

`1QkJIGgG4ddUGouKYwToPqR12q1E0Ui-Cule6fli6MdY`

## Setup

1. Create a Google Cloud project.
2. Enable **Google Sheets API**.
3. Create a service account and download its JSON key.
4. Share the Google Sheet with the service-account email.
   Use **Viewer** if you only need the doctor dashboard.
   Use **Editor** if you want the patient add/edit page to write back to the sheet.
5. Copy `.env.example` to `.env.local` and fill the values.
6. Run:

```bash
npm install
npm run dev
```

Open:

`http://localhost:3000/doctor/<DOCTOR_ACCESS_TOKEN>`

Patient entry page:

`http://localhost:3000/patient/<PATIENT_ACCESS_TOKEN>`

## Vercel

Push this project to GitHub, import it into Vercel, and add all `.env.local` variables in Vercel Project Settings → Environment Variables.

For `GOOGLE_PRIVATE_KEY`, preserve the `\n` characters exactly as shown in the JSON key.

Add `PATIENT_ACCESS_TOKEN` if you want the private add/edit/search page for the patient.

## Sheet format

The code expects columns A-L in this order:

1. Date
2. Before Breakfast Test Time
3. Fasting Sugar
4. Breakfast Insulin
5. Breakfast Insulin Time
6. Post-Breakfast Test Time
7. Post-Breakfast Sugar
8. Dinner Insulin
9. Dinner Insulin Time
10. Night Test Time
11. Night Sugar
12. Notes

Change `GOOGLE_SHEET_TAB` if the tab is not named `Daily Log`.

## Patient manager

The patient route writes directly to the same Google Sheet and includes:

- add new readings with native date and time inputs
- edit existing rows without opening the sheet
- search by date, numbers, times, or notes

When a reading is added or edited from the patient page, the doctor page is revalidated so updated values appear without waiting for the normal cache window.
