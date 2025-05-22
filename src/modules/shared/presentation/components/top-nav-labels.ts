export interface TopNavigationLabels {
  dashboard: string;
  journals: string;
  accounts: string;
  signOut: string;
}

export const topNavigationLabels: Record<string, TopNavigationLabels> = {
  en: {
    dashboard: "Dashboard",
    journals: "Finance Journals",
    accounts: "Accounts",
    signOut: "Sign Out",
  },
  vi: {
    dashboard: "Tóm tắt",
    journals: "Sổ chi tiêu",
    accounts: "Tài khoản",
    signOut: "Đăng xuất",
  },
};
