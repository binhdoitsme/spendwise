import { Language } from "@/components/common/i18n";

export interface JournalDetailsPageLabels {
  title: string;

  you: string;
  owner: string;
  transactions: string;
  accounts: string;
  access: string;

  invite: string;
  usersWithAccess: string;
  shareWithOthers: string;
  email: string;
  share: string;
  cancel: string;
  confirmUnshare: string;
  confirmUnsharePromptPrefix: string;
  confirmUnsharePromptSuffix: string;
  confirmUnshareYes: string;

  noAccounts: string;
  newAccount: string;
  linkAccount: string;

  newTransaction: string;
  noTransactions: string;
  transactionDetails: string;
  editTransaction: string;
  confirmDelete: string;
  confirmDeletePrompt: string;
  confirmDeleteYes: string;
}

export const journalDetailsPageLabels: Record<
  Language,
  JournalDetailsPageLabels
> = {
  en: {
    title: "Finance Journal",
    you: "You",
    owner: "Owner",
    transactions: "Transactions",
    accounts: "Accounts",
    access: "Access",
    invite: "Invite",
    usersWithAccess: "Users with access",
    shareWithOthers: "Share with others",
    email: "Email",
    share: "Share",
    cancel: "Cancel",
    confirmUnshare: "Confirm remove access",
    confirmUnshareYes: "Yes, remove access",
    confirmUnsharePromptPrefix: "Are you sure want to remove",
    confirmUnsharePromptSuffix: "as a collaborator?",
    noAccounts:
      "No account added. Create a new account or link your existing ones.",
    newAccount: "New Account",
    linkAccount: "Link Account",
    newTransaction: "New Transaction",
    noTransactions:
      "It's empty here. Click + New Transaction to start recording your expenses!",
    transactionDetails: "Transaction Details",
    editTransaction: "Edit Transaction",
    confirmDelete: "Confirm delete transaction",
    confirmDeletePrompt: "Are you sure you want to delete this transaction?",
    confirmDeleteYes: "Yes, delete transaction",
  },
  vi: {
    title: "Sổ chi tiêu",
    you: "Bạn",
    owner: "Chủ sở hữu",
    transactions: "Giao dịch",
    accounts: "Tài khoản",
    access: "Quyền truy cập",
    invite: "Mời",
    usersWithAccess: "Được chia sẻ với",
    shareWithOthers: "Chia sẻ sổ chi tiêu",
    email: "Email",
    share: "Chia sẻ",
    cancel: "Hủy",
    confirmUnshare: "Xác nhận xóa quyền truy cập",
    confirmUnsharePromptPrefix: "Bạn có chắc chắn muốn xóa quyền truy cập của",
    confirmUnsharePromptSuffix: "khỏi sổ chi tiêu này không?",
    confirmUnshareYes: "Có, xóa quyền truy cập",
    noAccounts:
      "Chưa có tài khoản nào được thêm. Tạo tài khoản mới hoặc liên kết tài khoản hiện có của bạn.",
    newAccount: "Tạo tài khoản mới",
    linkAccount: "Liên kết tài khoản",
    newTransaction: "Tạo giao dịch mới",
    noTransactions:
      "Chưa có giao dịch nào. Nhấn + Tạo giao dịch mới để bắt đầu ghi lại chi tiêu của bạn!",
    transactionDetails: "Chi tiết giao dịch",
    editTransaction: "Chỉnh sửa giao dịch",
    confirmDelete: "Xác nhận xóa giao dịch",
    confirmDeletePrompt: "Bạn có chắc chắn muốn xóa giao dịch này không?",
    confirmDeleteYes: "Có, xóa giao dịch",
  },
};
