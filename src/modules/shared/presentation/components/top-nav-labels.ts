export interface TopNavigationLabels {
  dashboard: string;
  journals: string;
  accounts: string;
  signOut: string;
  signIn: string;
}

export const topNavigationLabels: Record<string, TopNavigationLabels> = {
  en: {
    dashboard: "Dashboard",
    journals: "Finance Journals",
    accounts: "Accounts",
    signOut: "Sign Out",
    signIn: "Sign In",
  },
  vi: {
    dashboard: "Tóm tắt",
    journals: "Sổ chi tiêu",
    accounts: "Tài khoản tiêu dùng",
    signOut: "Đăng xuất",
    signIn: "Đăng nhập",
  },
};
