export interface JournalLabels {
  newJournal: string;
  journalTitle: string;
  journalTitlePlaceholder: string;
  currency: string;
  currencyPlaceholder: string;
  submit: string;
  noJournals: string;
  owner: string;
  you: string;
  createdAt: string;
}

export const journalLabels: Record<string, JournalLabels> = {
  en: {
    newJournal: "New Finance Journal",
    journalTitle: "Journal Title",
    journalTitlePlaceholder: "Give a memorable name for your finance journal",
    currency: "Currency",
    currencyPlaceholder: "e.g. VND, EUR, USD, etc.",
    submit: "Create",
    noJournals:
      "No journals found. Start tracking your financial journey today!",
    owner: "Owner",
    you: "You",
    createdAt: "Created at",
  },
  vi: {
    newJournal: "Tạo sổ chi tiêu mới",
    journalTitle: "Tên sổ chi tiêu",
    journalTitlePlaceholder: "Đặt tên cho sổ chi tiêu của bạn",
    currency: "Tiền tệ",
    currencyPlaceholder: "VD: VND, EUR, USD, v.v.",
    submit: "Tạo sổ chi tiêu",
    noJournals:
      "Chưa có sổ chi tiêu nào. Bắt đầu theo dõi chi tiêu của bạn ngay hôm nay!",
    owner: "Chủ sở hữu",
    you: "Bạn",
    createdAt: "Ngày tạo",
  },
};
