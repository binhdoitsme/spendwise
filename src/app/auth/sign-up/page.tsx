import { SignUpForm } from "@/modules/users/presentation/components/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | SpendWise",
  description: "Create user on SpendWise",
};

export default function SignUpPage() {
  return <SignUpForm language="en" redirectTo="/auth/sign-in" />;
}
