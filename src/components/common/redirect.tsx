"use client";

import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { spendwiseIDb } from "@/modules/shared/presentation/components/indexed-db";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectOnAuthExpiration() {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useAuthContext();

  useEffect(() => {
    const isAuthPath = pathname.startsWith("/auth");
    const isPublicPath =
      ["/404", "/"].includes(pathname) || pathname.includes("/api");

    if (isAuthPath) {
      return;
    }

    if (!authContext.user && !isPublicPath && !isAuthPath) {
      spendwiseIDb.delete().then(() => {
        router.push("/auth/sign-in");
      });
    } else if (authContext.user && !authContext.user.profileCompleted) {
      router.push("/users/complete-profile");
    }
  }, [authContext.user, router, pathname]);

  return null;
}
