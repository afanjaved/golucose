import { notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { getReadings } from '@/lib/sheets';

export const revalidate = 300;

export default async function DoctorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!process.env.DOCTOR_ACCESS_TOKEN || token !== process.env.DOCTOR_ACCESS_TOKEN) notFound();

  try {
    const readings = await getReadings();
    return <Dashboard readings={readings} />;
  } catch (error) {
    return <div className="error"><h1>Dashboard configuration error</h1><p>{error instanceof Error ? error.message : 'Unable to load readings.'}</p></div>;
  }
}
