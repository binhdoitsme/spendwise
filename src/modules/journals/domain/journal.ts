import { UUIDIdentifier } from "@/modules/shared/base/identifiers";
import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { ExcludeMethods } from "@/types";
import { DateTime } from "luxon";
import { JournalAccount } from "./account";
import { Collaborator, JournalCollaboratorPermission } from "./collaborator";
import { journalErrors } from "./errors";
import { Repayment } from "./repayments";
import { Tag } from "./tag";

export class JournalId extends UUIDIdentifier {}

export type JournalCreate = {
  ownerId: UserId;
  ownerEmail: Email;
  title: string;
  currency: string; // Added currency field
};

export type JournalRestore = ExcludeMethods<Journal> & {
  currency: string; // Added currency field
};

export class Journal {
  private constructor(
    readonly id: JournalId,
    readonly ownerId: UserId,
    readonly ownerEmail: Email,
    public title: string,
    public currency: string, // Added currency field
    private _repayments: Repayment[] = [],
    private _tags: Map<string, Tag> = new Map(),
    private _accounts: Map<string, JournalAccount> = new Map(),
    private _collaborators: Map<string, Collaborator> = new Map(),
    private _requiresApproval: boolean = false,
    public isArchived: boolean = false,
    public readonly createdAt: DateTime = DateTime.utc()
  ) {
    if (!_collaborators.has(ownerId.value)) {
      _collaborators.set(ownerId.value, new Collaborator(ownerId, "owner"));
    }
  }

  equals(other: Journal): boolean {
    return this.id.equals(other.id);
  }

  get requiresApproval() {
    return this._requiresApproval;
  }

  setApprovalRequirement(value: boolean) {
    this._requiresApproval = value;
  }

  //#region Collaborators
  get collaborators(): Map<string, Collaborator> {
    return new Map(this._collaborators);
  }

  hasCollaborator(userId: UserId): boolean {
    return this._collaborators.has(userId.value);
  }

  addCollaborator(userId: UserId, permission: JournalCollaboratorPermission) {
    if (userId.equals(this.ownerId)) {
      throw Error("Cannot grant any more permission to yourself");
    }
    if (["owner"].includes(permission)) {
      throw Error("Cannot grant owner permission to others");
    }
    this._collaborators.set(userId.value, new Collaborator(userId, permission));
  }

  removeCollaborator(userId: UserId) {
    if (userId.equals(this.ownerId)) {
      throw Error("Cannot remove yourself as a collaborator");
    }
    return this._collaborators.delete(userId.value);
  }
  //#endregion Collaborators

  //#region Tags
  get tags() {
    return new Map(this._tags);
  }

  hasTag(tag: string) {
    return this._tags.has(new Tag(tag).id);
  }

  addTags(tags: string[]) {
    for (const tag of tags) {
      const tagObj = new Tag(tag);
      this._tags.set(tagObj.id, tagObj);
    }
  }

  removeTags(tags: string[]) {
    for (const tag of tags) {
      this._tags.delete(new Tag(tag).id);
    }
  }
  //#endregion Tags

  //#region Accounts
  get accounts() {
    return new Map(this._accounts);
  }

  hasAccount(accountId: AccountId) {
    return this._accounts.has(accountId.value);
  }

  linkAccount(accountId: AccountId, ownerId: UserId) {
    if (this.isArchived) {
      throw journalErrors.archivedJournal;
    }
    if (this._accounts.has(accountId.value)) {
      throw journalErrors.accountAlreadyLinked;
    }
    const account = new JournalAccount(accountId, ownerId);
    this._accounts.set(account.accountId.value, account);
  }

  unlinkAccount(accountId: AccountId) {
    if (this.isArchived) {
      throw journalErrors.archivedJournal;
    }
    if (!this._accounts.has(accountId.value)) {
      throw journalErrors.accountNotLinked;
    }
    this._accounts.delete(accountId.value);
  }
  //#endregion Accounts

  get repayments() {
    return [...this._repayments];
  }

  addRepayment(repayment: Repayment) {
    const existing = this._repayments.find(
      (r) =>
        r.accountId.equals(repayment.accountId) &&
        r.journalId.equals(repayment.journalId) &&
        r.statementPeriod.equals(repayment.statementPeriod)
    );
    if (!existing) {
      this._repayments.push(repayment);
    }
  }

  static create(props: JournalCreate) {
    const id = new JournalId();
    return new Journal(
      id,
      props.ownerId,
      props.ownerEmail,
      props.title,
      props.currency
    );
  }

  static restore(props: JournalRestore) {
    return new Journal(
      props.id,
      props.ownerId,
      props.ownerEmail,
      props.title,
      props.currency,
      props.repayments,
      props.tags,
      props.accounts,
      props.collaborators,
      props.requiresApproval,
      props.isArchived,
      props.createdAt
    );
  }
}
