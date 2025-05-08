import { TransactionStatus, TransactionType } from "../../domain/transactions";

export interface JournalCreateDto {
  ownerId: string;
  ownerEmail: string;
  title: string;
  currency: string;
}

export interface JournalBasicDto {
  id: string;
  ownerId: string;
  ownerEmail: string;
  title: string;
  currency: string;
  isArchived: boolean;
  createdAt: string;
}

export interface JournalBasicWithTransactionsDto extends JournalBasicDto {
  transactions: TransactionDetailedDto[];
}

export interface AccountBasicDto {
  accountId: string;
  ownerId: string;
  ownerEmail: string;
  gracePeriodDays?: number;
  createdAt: string;
}

export interface TransactionDetailedDto {
  id: string;
  title: string;
  amount: number;
  accountId: string;
  date: string;
  type: `${TransactionType}`;
  status: `${TransactionStatus}`;
  notes?: string;
  tags: TagDto[];
}

export interface UserBasicDto {
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CollaboratorBasicDto {
  user: UserBasicDto;
  permission: string;
}

export interface TagDto {
  id: string;
  name: string;
}

export interface JournalDetailedDto {
  id: string;
  ownerId: string;
  ownerEmail: string;
  title: string;
  currency: string;
  isArchived: boolean;
  createdAt: string;
  tags: TagDto[];
  accounts: AccountBasicDto[];
  collaborators: CollaboratorBasicDto[];
  transactions: TransactionDetailedDto[];
}

export interface JournalEditDto {
  title?: string;
  currency?: string;
}

export interface TransactionEditDto {
  journalId?: string;
  title?: string;
  amount?: number;
  date?: string;
  account?: string;
  type?: string;
  paidBy?: string;
  tags?: string[];
  notes?: string;
}

export interface TransactionCreateDto {
  journalId: string;
  title: string;
  amount: number;
  date: string;
  account: string;
  type: string;
  paidBy: string;
  tags?: string[];
  notes?: string;
}

export {
  mapJournalToJournalBasicDto,
  mapJournalToJournalBasicWithTransactionsDto,
  mapRichJournalToJournalDetailedDto,
} from "./mappers";
