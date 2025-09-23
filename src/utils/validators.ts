export function validatePassword(password: string): string | null {
  // Regex: at least 8 chars, one uppercase, one number, one special char
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`-]).{8,}$/;

  if (!regex.test(password)) {
    return "Password must be at least 8 characters, include one uppercase letter, one number, and one special character.";
  }

  return null; // ✅ valid
}
