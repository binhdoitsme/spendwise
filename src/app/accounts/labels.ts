import { Language } from "@/components/common/i18n";

export interface AccountPageLabels {
  myAccounts: string;
  newAccount: string;
  viewAccount: string;
  editAccount: string;
  confirmDeleteAccount: string;
  deleteConfirmPrompt: string;
  yes: string;
  no: string;
  failedToDelete: string;
  failedToCreate: string;
}

export const accountPageLabels: Record<Language, AccountPageLabels> = {
  en: {
    myAccounts: "My Accounts",
    newAccount: "New Account",
    viewAccount: "View Account",
    editAccount: "Edit Account",
    confirmDeleteAccount: "Confirm Delete Account",
    deleteConfirmPrompt: "Are you sure want to delete this account?",
    yes: "Yes",
    no: "No",
    failedToDelete: "Failed to delete account!",
    failedToCreate: "Failed to create account:",
  },
  vi: {
    myAccounts: "Tài khoản của tôi",
    newAccount: "Tạo tài khoản mới",
    viewAccount: "Xem tài khoản",
    editAccount: "Chỉnh sửa tài khoản",
    confirmDeleteAccount: "Xác nhận xóa tài khoản",
    deleteConfirmPrompt: "Bạn có chắc chắn muốn xóa tài khoản này không?",
    yes: "Có",
    no: "Không",
    failedToDelete: "Xóa tài khoản thất bại!",
    failedToCreate: "Tạo tài khoản thất bại:",
  },
};
