export interface SignUpLabels {
  signUpTitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  hasAccount: string;
  signInButton: string;
  signUpButton: string;
}

export const signUpLabels: Record<string, SignUpLabels> = {
  en: {
    signUpTitle: "Create your SpendWise account",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    hasAccount: "Already had account?",
    signInButton: "Sign in",
    signUpButton: "Sign Up",
  },
};
