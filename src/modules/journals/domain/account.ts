import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";

export class JournalAccount {
  constructor(
    readonly accountId: AccountId,
    readonly ownerId: UserId,
    readonly ownerEmail: Email,
    readonly gracePeriodDays?: number,
    readonly createdAt: DateTime = DateTime.utc()
  ) {}
}
