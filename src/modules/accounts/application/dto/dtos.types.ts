export type BaseAccountInput = {
  name: string;
  type: string;
  userId: string;
};

export type CashAccountInput = BaseAccountInput & {
  type: "cash";
};

export type DebitAccountInput = BaseAccountInput & {
  type: "debit";
  bankName: string;
  last4: string;
};

export type CreditAccountInput = BaseAccountInput & {
  type: "credit";
  bankName: string;
  last4: string;
  statementDay: number;
  gracePeriodInDays: number;
  expiration: Date;
  limit?: number;
  remainingLimit?: number;
};

export type LoanAccountInput = BaseAccountInput & {
  type: "loan";
  bankName: string;
  loanStartDate: Date; // ISO format
  loanEndDate: Date;
  originalAmount: number;
};

export type AccountInput =
  | CashAccountInput
  | DebitAccountInput
  | CreditAccountInput
  | LoanAccountInput;

export interface AccountBasicDto {
  id: string;
  type: "cash" | "debit" | "credit" | "loan";
  displayName: string;
  owner: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type AccountDetailedDto =
  | AccountBasicDto &
      (
        | {
            type: "cash";
          }
        | {
            type: "debit";
            bankName: string;
            last4: string;
          }
        | {
            type: "credit";
            bankName: string;
            last4: string;
            statementDay: number;
            gracePeriodInDays: number;
            expiration: string;
            limit?: number;
            remainingLimit?: number;
          }
        | {
            type: "loan";
            bankName: string;
            loanStartDate: string;
            loanEndDate: string;
            originalAmount: number;
          }
      );

export interface AccountListResponse {
  data: AccountDetailedDto[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}
