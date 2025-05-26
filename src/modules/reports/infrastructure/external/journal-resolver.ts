import { JournalResolver, JournalBasic } from "../../application/contracts/journal-resolver";
import { JournalRepository } from "@/modules/journals/domain/repositories";
import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";

export class DrizzleReportJournalResolver implements JournalResolver {
  constructor(private readonly journalRepository: JournalRepository) {}

  async resolveOne(id: JournalId): Promise<JournalBasic | undefined> {
    const journal = await this.journalRepository.findById(id);
    if (!journal) return undefined;
    return {
      id: journal.id,
      accountIds: Array.from(journal.accounts.keys()).map(
        (accountId) => new AccountId(accountId)
      ),
    };
  }
}