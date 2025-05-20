import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import { Email } from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { JournalCollaboratorPermission } from "./collaborator";
import { Journal, JournalId } from "./journal";

describe("JournalMapping", () => {
  it("should create a journal with the correct properties", () => {
    const userId = new UserId("owner-id");
    const email = Email.from("test@email.com");
    const journal = Journal.create({
      ownerId: userId,
      ownerEmail: email,
      title: "Test Journal",
      currency: "USD",
    });
    expect(journal).toBeInstanceOf(Journal);
    expect(journal.ownerId.equals(userId)).toBeTruthy();
    expect(journal.ownerEmail.equals(email)).toBeTruthy();
    expect(journal.title).toBe("Test Journal");
    expect(journal.currency).toBe("USD");
    expect(journal.isArchived).toBe(false);
  });

  it("should restore a journal with the correct properties", () => {
    const userId = new UserId("owner-id");
    const email = Email.from("test@email.com");
    const journal = Journal.restore({
      id: new JournalId("journal-id"),
      ownerId: userId,
      ownerEmail: email,
      title: "Restored Journal",
      currency: "EUR",
      tags: new Map(),
      accounts: new Map(),
      collaborators: new Map(),
      requiresApproval: false,
      isArchived: false,
      createdAt: DateTime.utc(),
    });
    expect(journal).toBeInstanceOf(Journal);
    expect(journal.id.value).toBe("journal-id");
    expect(journal.ownerId.equals(userId)).toBeTruthy();
    expect(journal.ownerEmail.equals(email)).toBeTruthy();
    expect(journal.title).toBe("Restored Journal");
    expect(journal.currency).toBe("EUR");
    expect(journal.isArchived).toBe(false);
    expect(journal.requiresApproval).toBe(false);
  });
});

describe("Journal", () => {
  let journal: Journal;
  beforeEach(() => {
    jest.clearAllMocks();
    const userId = new UserId("owner-id");
    const email = Email.from("test@email.com");
    journal = Journal.create({
      ownerId: userId,
      ownerEmail: email,
      title: "Test Journal",
      currency: "USD",
    });
  });

  describe("collaborators", () => {
    it("should add a collaborator", () => {
      const userId = new UserId("collaborator-id");
      journal.addCollaborator(userId, "read");
      expect(journal.hasCollaborator(userId)).toBeTruthy();
    });
    it("should not add the owner as a collaborator", () => {
      const userId = new UserId("owner-id");
      expect(() => {
        journal.addCollaborator(userId, "read");
      }).toThrow();
    });
    it("should not add a collaborator as an owner", () => {
      const userId = new UserId("collaborator-id");
      expect(() => {
        journal.addCollaborator(
          userId,
          "owner" as unknown as JournalCollaboratorPermission
        );
      }).toThrow();
    });

    it("should remove a collaborator", () => {
      const userId = new UserId("collaborator-id");
      journal.addCollaborator(userId, "read");
      journal.removeCollaborator(userId);
      expect(journal.hasCollaborator(userId)).toBeFalsy();
    });
    it("should not remove the owner as a collaborator", () => {
      const userId = new UserId("owner-id");
      expect(() => {
        journal.removeCollaborator(userId);
      }).toThrow();
    });
  });

  describe("tags", () => {
    it("should add a tag", () => {
      const tags = ["Tag 1", "Tag 2"];
      journal.addTags(tags);
      tags.forEach((tag) => {
        expect(journal.hasTag(tag)).toBeTruthy();
      });
    });

    it("should not add a tag if it already exists", () => {
      const tag = "Tag 1";
      journal.addTags([tag]);
      expect(() => {
        journal.addTags([tag]);
      }).not.toThrow();
      expect(journal.hasTag(tag)).toBeTruthy();
      expect(journal.tags.size).toBe(1);
    });
  });

  describe("approval requirement", () => {
    it("should set approval requirement", () => {
      journal.setApprovalRequirement(true);
      expect(journal.requiresApproval).toBeTruthy();
    });
  });

  describe("equals", () => {
    it("should return true for equal journals", () => {
      const journal2 = Journal.restore({
        id: journal.id,
        ownerId: journal.ownerId,
        ownerEmail: journal.ownerEmail,
        title: journal.title,
        currency: journal.currency,
        tags: new Map(),
        accounts: new Map(),
        collaborators: new Map(),
        requiresApproval: false,
        isArchived: false,
        createdAt: DateTime.utc(),
      });
      expect(journal.equals(journal2)).toBeTruthy();
    });

    it("should return false for different journals", () => {
      const journal2 = Journal.restore({
        id: new JournalId("different-id"),
        ownerId: journal.ownerId,
        ownerEmail: journal.ownerEmail,
        title: "Different Journal",
        currency: journal.currency,
        tags: new Map(),
        accounts: new Map(),
        collaborators: new Map(),
        requiresApproval: false,
        isArchived: false,
        createdAt: DateTime.utc(),
      });
      expect(journal.equals(journal2)).toBeFalsy();
    });
  });

  describe("linking accounts", () => {
    it("should link an account to the journal", () => {
      const accountId = new AccountId("account-id");
      const ownerId = new UserId("owner-id");

      journal.linkAccount(accountId, ownerId);
      expect(journal.hasAccount(accountId)).toBeTruthy();
    });

    it("should not link the same account multiple times", () => {
      const accountId = new AccountId("account-id");
      const ownerId = new UserId("owner-id");

      journal.linkAccount(accountId, ownerId);
      expect(() => {
        journal.linkAccount(accountId, ownerId);
      }).toThrow();
    });

    it("should unlink an account from the journal", () => {
      const accountId = new AccountId("account-id");
      const ownerId = new UserId("owner-id");

      journal.linkAccount(accountId, ownerId);
      expect(journal.hasAccount(accountId)).toBeTruthy();

      journal.unlinkAccount(accountId);
      expect(journal.hasAccount(accountId)).toBeFalsy();
    });
    it("should not unlink an account that is not linked", () => {
      const accountId = new AccountId("account-id");
      expect(() => {
        journal.unlinkAccount(accountId);
      }).toThrow();
    });

    it("should not link an account if the journal is archived", () => {
      const accountId = new AccountId("account-id");
      const ownerId = new UserId("owner-id");

      journal.isArchived = true;
      expect(() => {
        journal.linkAccount(accountId, ownerId);
      }).toThrow();
    });

    it("should not unlink an account if the journal is archived", () => {
      const accountId = new AccountId("account-id");
      const ownerId = new UserId("owner-id");

      journal.linkAccount(accountId, ownerId);
      journal.isArchived = true;
      expect(() => {
        journal.unlinkAccount(accountId);
      }).toThrow();
    });
  });
});
