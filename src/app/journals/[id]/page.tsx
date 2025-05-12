import { provideJournalServices } from "@/modules/journals/journal.module";
import { use } from "react";
import { FinanceJournalPageContent } from "./content";

export default function FinanceJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const service = provideJournalServices();
  const id = use(params).id;
  const journal = use(service.getJournalById(id));
  return <FinanceJournalPageContent journal={journal} />;
}
