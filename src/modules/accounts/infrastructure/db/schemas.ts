import { AccountId, UserId } from "@/modules/shared/domain/identifiers";
import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  text,
  timestamp
} from "drizzle-orm/pg-core";
import { DateTime } from "luxon";
import {
  Account,
  AccountType,
  CreditAccountData,
  DebitAccountData,
  LoanAccountData,
} from "../../domain/account";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // AccountType enum: cash, debit, credit, loan
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),

  // Common bank info (debit, credit, loan)
  bankName: text("bank_name"),
  last4: text("last4"),

  // Credit card fields
  statementDay: integer("statement_day"), // 1–28
  gracePeriodInDays: integer("grace_period_in_days"),
  creditExpirationDate: date("credit_expiration_date", {
    mode: "date",
  }),
  limit: real("limit"),

  // Loan-specific fields
  loanStartDate: timestamp("loan_start_date", { mode: "date" }),
  loanEndDate: timestamp("loan_end_date", { mode: "date" }),
  originalAmount: real("original_amount"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export function mapAccountToDomain(row: typeof accounts.$inferSelect) {
  switch (row.type) {
    case "cash":
      return Account.cash(
        row.name,
        new UserId(row.userId),
        new AccountId(row.id),
        row.isActive,
        DateTime.fromJSDate(row.createdAt, { zone: "utc" })
      );
    case "debit":
      return Account.debit(
        row.name,
        row.bankName!,
        row.last4!,
        new UserId(row.userId),
        new AccountId(row.id),
        row.isActive,
        DateTime.fromJSDate(row.createdAt, { zone: "utc" })
      );
    case "credit":
      return Account.credit(
        row.name,
        row.bankName!,
        row.last4!,
        row.statementDay!,
        row.gracePeriodInDays!,
        DateTime.fromJSDate(row.creditExpirationDate!, { zone: "utc" }),
        new UserId(row.userId),
        row.limit ?? undefined,
        new AccountId(row.id),
        row.isActive,
        DateTime.fromJSDate(row.createdAt, { zone: "utc" })
      );
    case "loan":
      return Account.loan(
        row.name,
        row.bankName!,
        DateTime.fromJSDate(row.loanStartDate!, { zone: "utc" }),
        DateTime.fromJSDate(row.loanEndDate!, { zone: "utc" }),
        row.originalAmount!,
        new UserId(row.userId),
        new AccountId(row.id),
        row.isActive,
        DateTime.fromJSDate(row.createdAt, { zone: "utc" })
      );
  }
  throw Error(`Unknown account type: ${row.type}`);
}

export function mapAccountFromDomain(
  account: Account
): typeof accounts.$inferInsert {
  const common = {
    id: account.id.value,
    type: account.type,
    name: account.name,
    userId: account.userId.value,
    createdAt: account.createdAt.toJSDate(),
  };

  switch (account.type) {
    case AccountType.CASH:
      return {
        ...common,
        bankName: null,
        last4: null,
        statementDay: null,
        gracePeriodInDays: null,
        limit: null,
        loanStartDate: null,
        loanEndDate: null,
        originalAmount: null,
      };

    case AccountType.DEBIT: {
      const data = account.data as DebitAccountData;
      return {
        ...common,
        bankName: data.bankName,
        last4: data.last4,
        statementDay: null,
        gracePeriodInDays: null,
        limit: null,
        loanStartDate: null,
        loanEndDate: null,
        originalAmount: null,
      };
    }

    case AccountType.CREDIT: {
      const data = account.data as CreditAccountData;
      return {
        ...common,
        bankName: data.bankName,
        last4: data.last4,
        statementDay: data.statementDay,
        gracePeriodInDays: data.gracePeriodInDays,
        limit: data.limit ?? null,
        loanStartDate: null,
        loanEndDate: null,
        originalAmount: null,
      };
    }

    case AccountType.LOAN: {
      const data = account.data as LoanAccountData;
      return {
        ...common,
        bankName: data.bankName,
        last4: null,
        statementDay: null,
        gracePeriodInDays: null,
        limit: null,
        loanStartDate: (data.loanStartDate as DateTime).toJSDate(),
        loanEndDate: (data.loanEndDate as DateTime).toJSDate(),
        originalAmount: data.originalAmount,
      };
    }

    default:
      throw new Error(`Unsupported account type: ${account.type}`);
  }
}
