import { Language } from "@/components/common/i18n";

export interface AccountLabels {
  accountType: string;
  accountName: string;
  bankName: string;
  last4: string;
  statementDay: string;
  gracePeriodInDays: string;
  limit: string;
  loanStartDate: string;
  loanEndDate: string;
  originalAmount: string;
  saveAccount: string;
  selectType: string;
  cash: string;
  debit: string;
  credit: string;
  loan: string;
  myWalletPlaceholder: string;
  bankNamePlaceholder: string;
  last4Placeholder: string;
  statementDayPlaceholder: string;
  gracePeriodPlaceholder: string;
  limitPlaceholder: string;
  loanStartDatePlaceholder: string;
  loanEndDatePlaceholder: string;
  originalAmountPlaceholder: string;
  owner: string;
  you: string;
  view: string;
  edit: string;
  unlink: string;
  delete: string;
  openMenu: string;
}

export const accountLabels: Record<Language, AccountLabels> = {
  en: {
    accountType: "Account Type",
    accountName: "Account Name",
    bankName: "Bank Name",
    last4: "Last 4 digits",
    statementDay: "Statement Day",
    gracePeriodInDays: "Grace Period (days)",
    limit: "Credit Limit",
    loanStartDate: "Loan Start Date",
    loanEndDate: "Loan End Date",
    originalAmount: "Original Amount",
    saveAccount: "Save Account",
    selectType: "Select type",
    cash: "Cash",
    debit: "Debit",
    credit: "Credit",
    loan: "Loan",
    myWalletPlaceholder: "My Wallet / Visa Card / etc.",
    bankNamePlaceholder: "e.g., Vietcombank",
    last4Placeholder: "1234",
    statementDayPlaceholder: "1-28",
    gracePeriodPlaceholder: "1-60",
    limitPlaceholder: "Optional",
    loanStartDatePlaceholder: "YYYY-MM-DD",
    loanEndDatePlaceholder: "YYYY-MM-DD",
    originalAmountPlaceholder: "e.g. 120000",
    owner: "Owner",
    you: "You",
    view: "View",
    edit: "Edit",
    unlink: "Unlink",
    delete: "Delete",
    openMenu: "Open menu",
  },
  vi: {
    accountType: "Loại tài khoản",
    accountName: "Tên tài khoản",
    bankName: "Ngân hàng",
    last4: "4 số cuối",
    statementDay: "Ngày sao kê",
    gracePeriodInDays: "Số ngày miễn lãi",
    limit: "Hạn mức tín dụng",
    loanStartDate: "Ngày bắt đầu vay",
    loanEndDate: "Ngày kết thúc vay",
    originalAmount: "Số tiền gốc",
    saveAccount: "Lưu tài khoản",
    selectType: "Chọn loại",
    cash: "Tiền mặt",
    debit: "Thẻ ghi nợ",
    credit: "Thẻ tín dụng",
    loan: "Khoản vay",
    myWalletPlaceholder: "Ví của tôi / Thẻ Visa / v.v.",
    bankNamePlaceholder: "VD: Vietcombank",
    last4Placeholder: "1234",
    statementDayPlaceholder: "1-28",
    gracePeriodPlaceholder: "1-60",
    limitPlaceholder: "Không bắt buộc",
    loanStartDatePlaceholder: "YYYY-MM-DD",
    loanEndDatePlaceholder: "YYYY-MM-DD",
    originalAmountPlaceholder: "VD: 120000",
    owner: "Chủ tài khoản",
    you: "Bạn",
    view: "Xem",
    edit: "Chỉnh sửa",
    unlink: "Hủy liên kết",
    delete: "Xóa",
    openMenu: "Mở menu",
  },
};
