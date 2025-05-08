import { provideJournalServices } from "@/modules/journals/journal.module";
import { JournalProvider } from "@/modules/journals/presentation/contexts/journal.context";
import { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "Account Book Details | SpendWise",
};

export default function AccountBookByIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const service = provideJournalServices();
  const journal = use(service.getJournalById("user-id"));
  return <JournalProvider initialState={journal}>{children}</JournalProvider>;
}
