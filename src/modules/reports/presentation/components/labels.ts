import { Language } from "@/components/common/i18n";

export interface ReportingLabels {
  paymentSummary: string;
  upcomingDues: string;
  usageThisMonth: (month: string) => string;
  noAccounts: string;
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
}

export const reportingLabels: Record<Language, ReportingLabels> = {
  en: {
    paymentSummary: "Payment Summary",
    upcomingDues: "Upcoming Dues",
    usageThisMonth: (month) => `Usage This Month (${month})`,
    noAccounts: "No accounts to display.",
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
  },
  vi: {
    paymentSummary: "Tổng kết thanh toán",
    upcomingDues: "Các khoản đến hạn",
    usageThisMonth: (month) => `Sử dụng tháng này (${month})`,
    noAccounts: "Không có tài khoản để hiển thị.",
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
  },
};
