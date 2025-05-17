import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { JournalListProvider } from "@/modules/journals/presentation/contexts/journal-list.context";
import { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "My Finance Journals | SpendWise",
};

export default async function JournalListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const userId = await getCurrentUserId(headerStore);
  const journalServices = provideJournalServices();
  const journals = await journalServices.listJournals(userId!);
  return (
    <JournalListProvider initialState={journals}>
      {children}
    </JournalListProvider>
  );
}
