import { Language } from "@/components/common/i18n";

export interface TransactionLabels {
  searchPlaceholder: string;
  quickFilters: string;
  showOnlyCredit: string;
  filterByDate: string;
  currentMonth: string;
  lastMonth: string;
  mostRecent2Months: string;
  customDateRange: string;
  applyFilters: string;
  startDate: string;
  endDate: string;
  view: string;
  edit: string;
  delete: string;
  duplicate: string;
  archive: string;
  type: string;
  title: string;
  titlePlaceholder: string;
  amount: string;
  date: string;
  paidBy: string;
  paidByPlaceholder: string;
  tags: string;
  tagsPlaceholder: string;
  account: string;
  accountPlaceholder: string;
  linkAccountOnNoAccount: string;
  expense: string;
  income: string;
  notes: string;
  notesPlaceholder: string;
  saveTransaction: string;
  category: string;
  categoryPlaceholder: string;
}

export const transactionLabels: Record<Language, TransactionLabels> = {
  en: {
    searchPlaceholder: "Search...",
    quickFilters: "Quick Filters",
    showOnlyCredit: "Show only credit transactions",
    filterByDate: "Filter by date",
    currentMonth: "Current Month",
    lastMonth: "Last Month",
    mostRecent2Months: "Most Recent 2 Months",
    customDateRange: "Custom",
    applyFilters: "Apply Filters",
    startDate: "Start Date",
    endDate: "End Date",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    archive: "Archive",
    type: "Type",
    title: "Title",
    titlePlaceholder: "e.g. Pho lunch, Invoice #42",
    amount: "Amount",
    date: "Date",
    paidBy: "Paid By",
    paidByPlaceholder: "Select user...",
    tags: "Tags",
    tagsPlaceholder: "e.g. Food, Rent, etc.",
    account: "Account",
    accountPlaceholder: "e.g. Cash, Bank",
    linkAccountOnNoAccount: "Link an account to add a transaction",
    expense: "Expense",
    income: "Income",
    notes: "Notes",
    notesPlaceholder: "Optionally add notes for this transaction...",
    saveTransaction: "Save Transaction",
    category: "Category",
    categoryPlaceholder: "Select a category...",
  },
  vi: {
    searchPlaceholder: "Tìm kiếm...",
    quickFilters: "Lọc nhanh",
    showOnlyCredit: "Chỉ hiển thị giao dịch tín dụng",
    filterByDate: "Lọc theo ngày",
    currentMonth: "Tháng này",
    lastMonth: "Tháng trước",
    mostRecent2Months: "2 tháng gần nhất",
    customDateRange: "Tùy chỉnh",
    applyFilters: "Áp dụng",
    startDate: "Ngày bắt đầu",
    endDate: "Ngày kết thúc",
    view: "Chi tiết",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    duplicate: "Tạo bản sao",
    archive: "Lưu trữ",
    type: "Loại",
    title: "Tiêu đề",
    titlePlaceholder: "Ví dụ: Ăn trưa, Đóng tiền nhà, ...",
    amount: "Số tiền",
    date: "Ngày",
    paidBy: "Người thanh toán",
    paidByPlaceholder: "Chọn người chi trả...",
    tags: "Nhãn",
    tagsPlaceholder: "Ví dụ: Ăn uống, Tiền nhà, ...",
    account: "Tài khoản",
    accountPlaceholder: "Ví dụ: Tiền mặt, Thẻ, ...",
    linkAccountOnNoAccount: "Liên kết tài khoản để thêm giao dịch",
    expense: "Chi tiêu",
    income: "Thu nhập",
    notes: "Ghi chú",
    notesPlaceholder: "Thêm ghi chú cho giao dịch này (tùy chọn)...",
    saveTransaction: "Lưu giao dịch",
    category: "Quỹ",
    categoryPlaceholder: "Chọn quỹ để dùng ngân sách...",
  },
};
