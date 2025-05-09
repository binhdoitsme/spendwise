import { SignInForm } from "@/modules/auth/presentation/components/sign-in-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SpendWise",
  description: "Sign in to use SpendWise",
};

export default function SignInPage() {
  const ssoProviders = new Set(
    process.env.NEXT_PUBLIC_SSO_PROVIDER?.split(";") ?? []
  );

  return (
    <SignInForm
      ssoProviders={ssoProviders}
      language="en"
      redirectTo="/dashboard"
    />
  );
}
