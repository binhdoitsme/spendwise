import { UUIDIdentifier } from "@/modules/shared/base/identifiers";
import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { ExcludeMethods } from "@/types";
import { DateTime } from "luxon";
import { JournalAccount } from "./account";
import { Collaborator, JournalCollaboratorPermission } from "./collaborator";
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
    private _tags: Map<string, Tag> = new Map(),
    private _accounts: Map<string, JournalAccount> = new Map(),
    private _collaborators: Map<string, Collaborator> = new Map(),
    private _requiresApproval: boolean = false,
    public isArchived: boolean = false,
    public readonly createdAt: DateTime = DateTime.utc()
  ) {
    _collaborators.set(
      ownerEmail.toString(),
      new Collaborator(ownerEmail, "owner")
    );
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

  hasCollaborator(email: Email): boolean {
    return this._collaborators.has(email.toString());
  }

  addCollaborator(email: Email, permission: JournalCollaboratorPermission) {
    if (email.equals(this.ownerEmail)) {
      throw Error("Cannot grant any more permission to yourself");
    }
    if (["owner"].includes(permission)) {
      throw Error("Cannot grant owner permission to others");
    }
    this._collaborators.set(
      email.toString(),
      new Collaborator(email, permission)
    );
  }

  removeCollaborator(email: Email) {
    return this._collaborators.delete(email.toString());
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

  addAccount(
    accountId: AccountId,
    ownerEmail: Email,
    ownerId: UserId,
    gracePeriodDays?: number
  ) {
    const account = new JournalAccount(
      accountId,
      ownerId,
      ownerEmail,
      gracePeriodDays
    );
    this._accounts.set(account.accountId.value, account);
  }

  removeAccount(accountId: AccountId) {
    this._accounts.delete(accountId.value);
  }
  //#endregion Accounts

  static create(props: JournalCreate) {
    const id = new JournalId();
    return new Journal(id, props.ownerId, props.ownerEmail, props.title, props.currency);
  }

  static restore(props: JournalRestore) {
    return new Journal(
      props.id,
      props.ownerId,
      props.ownerEmail,
      props.title,
      props.currency,
      props.tags,
      props.accounts,
      props.collaborators,
      props.requiresApproval,
      props.isArchived,
      props.createdAt
    );
  }
}
