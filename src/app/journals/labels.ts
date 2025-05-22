import { Language } from "@/components/common/i18n";

export interface JournalListLabels {
  title: string;
  newJournal: string;
}

export const journalListLabels: Record<Language, JournalListLabels> = {
  en: {
    title: "My Finance Journals | SpendWise",
    newJournal: "New Finance Journal",
  },
  vi: {
    title: "Sổ chi tiêu của tôi | SpendWise",
    newJournal: "Tạo sổ chi tiêu mới",
  },
};
