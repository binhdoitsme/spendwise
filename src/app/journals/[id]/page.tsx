import { provideAccountServices } from "@/modules/accounts/account.module";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { provideJournalServices } from "@/modules/journals/journal.module";
import { headers } from "next/headers";
import { FinanceJournalPageContent } from "./content";

export default async function FinanceJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const service = provideJournalServices();
  const id = (await params).id;
  const journal = await service.getJournalById(id);
  const accountService = provideAccountServices();
  const headerStore = await headers();
  const userId = await getCurrentUserId(headerStore);
  const accounts = await accountService.getAccounts(userId!);
  return <FinanceJournalPageContent journal={journal} myAccounts={accounts} />;
}
