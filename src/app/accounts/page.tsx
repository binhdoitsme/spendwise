import { provideAccountServices } from "@/modules/accounts/account.module";
import { getCurrentUserId } from "@/modules/auth/presentation/api/current-user";
import { headers } from "next/headers";
import { MyAccountPageContent } from "./content";

export default async function MyAccountPage() {
  const headerStore = await headers();
  const userId = await getCurrentUserId(headerStore);
  const accountService = provideAccountServices();
  const accounts = await accountService.getAccounts(userId!);

  return <MyAccountPageContent accounts={accounts} />;
}
