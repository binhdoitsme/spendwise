import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal Details | SpendWise",
};

export default function JournalByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
