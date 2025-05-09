import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";

// Sample Response 1
const journalDetailedSample1: JournalDetailedDto = {
  id: "journal-001",
  ownerId: "user-123",
  ownerEmail: "owner1@example.com",
  title: "Personal Finance",
  isArchived: false,
  createdAt: "2025-05-01T10:00:00Z",
  currency: "VND",
  tags: [
    { id: "budget", name: "Budget" },
    { id: "savings", name: "Savings" },
  ],
  accounts: [
    {
      accountId: "account-001",
      ownerId: "user-123",
      ownerEmail: "owner1@example.com",
      gracePeriodDays: 30,
      createdAt: "2025-04-01T10:00:00Z",
    },
    {
      accountId: "account-002",
      ownerId: "user-123",
      ownerEmail: "owner1@example.com",
      createdAt: "2025-04-15T10:00:00Z",
    },
  ],
  collaborators: [
    {
      user: {
        email: "owner1@example.com",
        fullName: "Owner 1",
        avatarUrl: "https://example.com/avatar1.png",
      },
      permission: "owner",
    },
    {
      user: {
        email: "collab1@example.com",
        fullName: "John Doe",
        avatarUrl: "https://example.com/avatar1.png",
      },
      permission: "read",
    },
    {
      user: { email: "collab2@example.com", fullName: "Jane Smith" },
      permission: "write",
    },
  ],
  transactions: [
    {
      id: "txn-001",
      accountId: "account-001",
      title: "Grocery Shopping",
      amount: 150_500,
      date: "2025-05-02",
      type: "EXPENSE",
      status: "AUTO_APPROVED",
      notes: "Bought fruits and vegetables",
      tags: ["budget"],
    },
    {
      id: "txn-002",
      accountId: "account-001",
      title: "Salary",
      amount: 3_000_000,
      date: "2025-05-01",
      type: "INCOME",
      status: "AUTO_APPROVED",
      tags: ["budget"],
    },
  ],
};

// Sample Response 2
const journalDetailedSample2: JournalDetailedDto = {
  id: "journal-002",
  ownerId: "user-456",
  ownerEmail: "owner2@example.com",
  title: "Travel Expenses",
  isArchived: true,
  createdAt: "2025-03-20T12:00:00Z",
  currency: "VND",
  tags: [
    { id: "tag-003", name: "Travel" },
    { id: "tag-004", name: "Vacation" },
  ],
  accounts: [
    {
      accountId: "account-003",
      ownerId: "user-456",
      ownerEmail: "owner2@example.com",
      createdAt: "2025-03-01T10:00:00Z",
    },
  ],
  collaborators: [
    {
      user: { email: "collab3@example.com", fullName: "Alice Johnson" },
      permission: "read",
    },
  ],
  transactions: [
    {
      id: "txn-003",
      accountId: "account-003",
      title: "Flight Tickets",
      amount: 1200,
      date: "2025-03-15T10:00:00Z",
      type: "EXPENSE",
      status: "AUTO_APPROVED",
      notes: "Round trip tickets to Paris",
      tags: ["budget"],
    },
    {
      id: "txn-004",
      accountId: "account-003",
      title: "Hotel Booking",
      amount: 800,
      date: "2025-03-18T12:00:00Z",
      type: "EXPENSE",
      status: "AUTO_APPROVED",
      tags: ["budget"],
    },
  ],
};

// Sample Response 3
const journalDetailedSample3: JournalDetailedDto = {
  id: "journal-003",
  ownerId: "user-789",
  ownerEmail: "owner3@example.com",
  title: "Business Expenses",
  isArchived: false,
  createdAt: "2025-04-10T09:00:00Z",
  currency: "VND",
  tags: [
    { id: "tag-005", name: "Business" },
    { id: "tag-006", name: "Office Supplies" },
  ],
  accounts: [
    {
      accountId: "account-004",
      ownerId: "user-789",
      ownerEmail: "owner3@example.com",
      gracePeriodDays: 15,
      createdAt: "2025-04-05T10:00:00Z",
    },
    {
      accountId: "account-005",
      ownerId: "user-789",
      ownerEmail: "owner3@example.com",
      createdAt: "2025-04-08T10:00:00Z",
    },
  ],
  collaborators: [
    {
      user: { email: "collab4@example.com", fullName: "Bob Brown" },
      permission: "write",
    },
    {
      user: { email: "collab5@example.com", fullName: "Charlie Green" },
      permission: "read",
    },
  ],
  transactions: [
    {
      id: "txn-005",
      accountId: "account-005",
      title: "Office Chairs",
      amount: 500,
      date: "2025-04-12T14:00:00Z",
      type: "EXPENSE",
      status: "AUTO_APPROVED",
      notes: "Purchased ergonomic chairs",
      tags: ["budget"],
    },
    {
      id: "txn-006",
      accountId: "account-005",
      title: "Client Payment",
      amount: 2000,
      date: "2025-04-15T10:00:00Z",
      type: "INCOME",
      status: "AUTO_APPROVED",
      tags: ["budget"],
    },
  ],
};

export const sampleJournals = [
  journalDetailedSample1,
  journalDetailedSample2,
  journalDetailedSample3,
];
