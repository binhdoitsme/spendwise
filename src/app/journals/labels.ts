import { Language } from "@/components/common/i18n";

export interface JournalListLabels {
  title: string;
  pageTitle: string;
  newJournal: string;
}

export const journalListLabels: Record<Language, JournalListLabels> = {
  en: {
    title: "My Finance Journals | SpendWise",
    pageTitle: "My Finance Journals",
    newJournal: "New Finance Journal",
  },
  vi: {
    title: "Sổ chi tiêu của tôi | SpendWise",
    pageTitle: "Sổ chi tiêu của tôi",
    newJournal: "Tạo sổ chi tiêu mới",
  },
};
