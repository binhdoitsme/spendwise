import { provideJournalServices } from "@/modules/journals/journal.module";
import { FinanceJournalPageContent } from "./content";

export default async function FinanceJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const journalServices = provideJournalServices();
  const { etag } = await journalServices.getJournalMeta(id);
  return <FinanceJournalPageContent etag={etag} id={id} />;
}
