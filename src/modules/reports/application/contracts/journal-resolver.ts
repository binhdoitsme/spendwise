import { JournalId } from "@/modules/journals/domain/journal";
import { AccountId } from "@/modules/shared/domain/identifiers";

export interface JournalBasic {
  id: JournalId;
  accountIds: AccountId[];
  currency: string;
}

export abstract class JournalResolver {
  abstract resolveOne(id: JournalId): Promise<JournalBasic | undefined>;
}
