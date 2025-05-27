import { Language } from "@/components/common/i18n";

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

export const signUpLabels: Record<Language, SignUpLabels> = {
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
  vi: {
    signUpTitle: "Tạo tài khoản SpendWise của bạn",
    email: "Email",
    emailPlaceholder: "Nhập email của bạn",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    confirmPassword: "Xác nhận mật khẩu",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu của bạn",
    hasAccount: "Đã có tài khoản?",
    signInButton: "Đăng nhập",
    signUpButton: "Đăng ký",
  },
};
