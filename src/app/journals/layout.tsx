import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { JournalListProvider } from "@/modules/journals/presentation/contexts/journal-list.context";
import { Metadata } from "next";
import { use } from "react";

export const metadata: Metadata = {
  title: "My Finance Journals | SpendWise",
};

export default function JournalListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = use(getCurrentUserId());
  const journalServices = provideJournalServices();
  const journals = use(journalServices.listJournals(userId!));
  return (
    <JournalListProvider initialState={journals}>
      {children}
    </JournalListProvider>
  );
}
