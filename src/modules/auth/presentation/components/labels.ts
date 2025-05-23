import { Language } from "@/components/common/i18n";

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

export const signInLabels: Record<Language, AuthLabels> = {
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
  },
  vi: {
    signInTitle: "Đăng nhập vào SpendWise",
    email: "Email",
    emailPlaceholder: "Nhập email của bạn",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    signInButton: "Đăng nhập",
    orLabel: "HOẶC",
    signInGoogle: "Tiếp tục với Google",
    noAccount: "Chưa có tài khoản?",
    signUpButton: "Đăng ký",
  },
};
