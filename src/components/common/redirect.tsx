"use client";

import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectOnAuthExpiration() {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useAuthContext();

  useEffect(() => {
    if (
      !authContext.user &&
      !["/404", "/"].includes(pathname) &&
      !pathname.includes("/api")
    ) {
      router.push("/auth/sign-in");
    }
  }, [authContext.user, router, pathname]);
  return <></>;
}
