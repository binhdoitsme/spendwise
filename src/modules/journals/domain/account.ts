import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { DateTime } from "luxon";

export class JournalAccount {
  constructor(
    readonly accountId: AccountId,
    readonly ownerId: UserId,
    readonly createdAt: DateTime = DateTime.utc()
  ) {}
}
