"use client";
import { useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { topNavigationLabels } from "./top-nav-labels";

export function TopNavigationBar() {
  const router = useRouter();
  const { user, setUser } = useAuthContext();
  const { language } = useI18n();
  const labels = topNavigationLabels[language];

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
      });
      if (response.ok) {
        setUser();
        router.push("/auth/sign-in"); // Redirect to sign-in page after logout
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="border-b bg-white shadow-md">
      <div className="container min-h-16 mx-auto px-4 py-2 flex justify-between items-center">
        <div className="text-lg font-bold">SpendWise</div>
        {user && (
          <>
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-500"
                >
                  {labels.dashboard}
                </Link>
              </li>
              <li>
                <Link
                  href="/journals"
                  className="text-gray-700 hover:text-blue-500"
                >
                  {labels.journals}
                </Link>
              </li>
              <li>
                <Link
                  href="/accounts"
                  className="text-gray-700 hover:text-blue-500"
                >
                  {labels.accounts}
                </Link>
              </li>
            </ul>

            <div>
              <Button variant="outline" onClick={handleSignOut}>
                {labels.signOut}
              </Button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
