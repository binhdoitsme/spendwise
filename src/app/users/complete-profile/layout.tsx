import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Profile | Spendwise",
};

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
