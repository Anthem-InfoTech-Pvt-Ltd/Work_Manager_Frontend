export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Please enter your email address.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@company.com).';
  }
  return null;
}

export function validatePassword(password: string, fieldName: string = 'Password'): string | null {
  if (!password) {
    return `Please enter a ${fieldName.toLowerCase()}.`;
  }
  if (password.length < 6) {
    return `${fieldName} must be at least 6 characters long.`;
  }
  if (!/[A-Z]/.test(password)) {
    return `${fieldName} must contain at least one uppercase letter (A-Z).`;
  }
  if (!/[a-z]/.test(password)) {
    return `${fieldName} must contain at least one lowercase letter (a-z).`;
  }
  if (!/[0-9]/.test(password)) {
    return `${fieldName} must contain at least one number (0-9).`;
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return `${fieldName} must contain at least one special character (!@#$%^&*).`;
  }
  return null;
}
