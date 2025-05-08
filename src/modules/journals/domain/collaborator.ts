import { Email } from "@/modules/shared/domain/value-objects";

export const journalCollaboratorPermissions = ["read", "write"] as const;
export type JournalCollaboratorPermission =
  (typeof journalCollaboratorPermissions)[number];

export const journalPermissions = [
  ...journalCollaboratorPermissions,
  "owner",
] as const;
export type JournalPermission = (typeof journalPermissions)[number];

export class Collaborator {
  constructor(readonly email: Email, private _permission: JournalPermission) {}

  get permission() {
    return this._permission;
  }

  set permission(value: JournalPermission) {
    if (!["read", "write"].includes(value)) {
      throw Error(
        `${value} is not a valid JournalPermission. Expect either of ["read", "write"]`
      );
    }
    this._permission = value;
  }
}
