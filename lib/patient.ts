export const patientProfile = {
  name: 'Aafhan Javed',
  birthDate: '2002-07-22',
  maritalStatus: 'Single'
} as const;

const toBirthDate = (birthDate: string) => new Date(`${birthDate}T00:00:00Z`);

export const calculateAge = (birthDate: string, referenceDate = new Date()) => {
  const birthday = toBirthDate(birthDate);
  let age = referenceDate.getFullYear() - birthday.getUTCFullYear();
  const monthDifference = referenceDate.getMonth() - birthday.getUTCMonth();

  if (monthDifference < 0 || (monthDifference === 0 && referenceDate.getDate() < birthday.getUTCDate())) {
    age -= 1;
  }

  return age;
};

export const formatBirthDate = (birthDate: string) =>
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(toBirthDate(birthDate));
