import { Journal } from "./journal";
import { Transaction } from "./transactions";

export class RichJournal {
  constructor(
    readonly journal: Journal,
    readonly transactions: Transaction[],
  ) {}
}
