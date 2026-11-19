// Zod-compatible validator shapes (import zod in projects that use these)
// These are the shared schema definitions

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const VALIDATORS = {
  isValidEmail: (email: string) => EMAIL_REGEX.test(email),
  isValidPhone: (phone: string) => PHONE_REGEX.test(phone),
  isValidPassword: (pw: string) => pw.length >= PASSWORD_MIN_LENGTH && PASSWORD_REGEX.test(pw),
  isValidBloodGroup: (bg: string) => ['A+','A-','B+','B-','AB+','AB-','O+','O-'].includes(bg),
};
