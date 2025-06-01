import { Language } from "@/components/common/i18n";

export interface ReportingLabels {
  paymentSummary: string;
  upcomingDues: string;
  usageThisMonth: (month: string) => string;
  noAccounts: string;
  statementPeriod: string;
  due: string;
  dueToday: string;
  dueTomorrow: string;
  dueYesterday: string;
  overdue: string;
  overdueYesterday: string;
  dueInDays: (days: number) => string;
  notYetDue: string;
  spent: string;
  limit: string;
  markAsPaid: string;
  percentUsed: (percent: number) => string;
  today: string;
  tomorrow: string;
  yesterday: string;

  monthlySummary: string;
  totalSpent: string;
  topSpendingTags: string;
  spendingByAccount: string;
}

export const reportingLabels: Record<Language, ReportingLabels> = {
  en: {
    paymentSummary: "Payment Summary",
    upcomingDues: "Upcoming Dues",
    usageThisMonth: (month) => `Usage This Month (${month})`,
    noAccounts: "No accounts to display.",
    statementPeriod: "Statement Period:",
    due: "Due:",
    dueToday: "Due Today",
    dueTomorrow: "Due Tomorrow",
    dueYesterday: "Yesterday",
    overdue: "Overdue",
    overdueYesterday: "Overdue (Yesterday)",
    dueInDays: (days) => `Due in ${days} days`,
    notYetDue: "Not yet due",
    spent: "Spent:",
    limit: "Limit:",
    markAsPaid: "Mark as Paid",
    percentUsed: (percent) => `${percent}% used`,
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    monthlySummary: "Monthly Summary",
    totalSpent: "Total Expenses",
    topSpendingTags: "Top Spending Tags",
    spendingByAccount: "Spending by Account",
  },
  vi: {
    paymentSummary: "Tổng kết thanh toán",
    upcomingDues: "Các khoản đến hạn",
    usageThisMonth: (month) => `Sử dụng tháng này (${month})`,
    noAccounts: "Không có tài khoản để hiển thị.",
    statementPeriod: "Kỳ sao kê:",
    due: "Đến hạn:",
    dueToday: "Đến hạn hôm nay",
    dueTomorrow: "Đến hạn ngày mai",
    dueYesterday: "Hôm qua",
    overdue: "Quá hạn",
    overdueYesterday: "Quá hạn (Hôm qua)",
    dueInDays: (days) => `Đến hạn sau ${days} ngày`,
    notYetDue: "Chưa đến hạn",
    spent: "Đã chi:",
    limit: "Hạn mức:",
    markAsPaid: "Thanh toán",
    percentUsed: (percent) => `Đã tiêu: ${percent}%`,
    today: "Hôm nay",
    tomorrow: "Ngày mai",
    yesterday: "Hôm qua",
    monthlySummary: "Tóm tắt hàng tháng",
    totalSpent: "Tổng chi tiêu",
    topSpendingTags: "Hạng mục chi tiêu nhiều nhất",
    spendingByAccount: "Phân bổ theo tài khoản",
  },
};
