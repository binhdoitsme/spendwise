export const ISO_CURRENCIES = ["EUR", "USD", "VND"] as const;
export type ISOCurrency = (typeof ISO_CURRENCIES)[number];

export interface MoneyAmount {
  amount: number;
  currency: ISOCurrency;
}
