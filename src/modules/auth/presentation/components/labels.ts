export interface AuthLabels {
  signInTitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signInButton: string;
  orLabel: string;
  signInGoogle: string;
  noAccount: string;
  signUpButton: string;
}

export const signInLabels: Record<string, AuthLabels> = {
  en: {
    signInTitle: "Sign in to SpendWise",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    signInButton: "Sign In",
    orLabel: "OR",
    signInGoogle: "Continue with Google",
    noAccount: "Don't have account?",
    signUpButton: "Sign up",
  }
};
