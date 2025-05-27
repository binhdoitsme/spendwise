"use client";

import { useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { topNavigationLabels, TopNavigationLabels } from "./top-nav-labels";

type NavItem = {
  key: keyof TopNavigationLabels;
  href: string;
};

export function TopNavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useI18n();
  const authContext = useAuthContext();
  const isSignedIn = useMemo(() => !!authContext.user, [authContext.user]);
  const [isOpen, setIsOpen] = useState(false);

  const labels = topNavigationLabels[language];
  const navItems: NavItem[] = useMemo(() => {
    if (isSignedIn) {
      return [
        // { key: "dashboard", href: "/dashboard" },
        { key: "journals", href: "/journals" },
        { key: "accounts", href: "/accounts" },
      ];
    } else {
      return [];
    }
  }, [isSignedIn]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
      });
      if (response.ok) {
        authContext.setUser();
        router.push("/auth/sign-in"); // Redirect to sign-in page after logout
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAuthClick = async () => {
    if (isSignedIn) {
      await handleSignOut();
    } else {
      router.push("/auth/sign-in");
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">SpendWise</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:justify-between md:flex-1 md:ml-6">
          <div className="relative flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-1 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {labels[item.key]}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-foreground"
                      layoutId="navbar-indicator"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Button */}
          <Button
            variant={isSignedIn ? "outline" : "default"}
            size="sm"
            onClick={handleAuthClick}
            className="ml-4 transition-all"
          >
            {isSignedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {labels.signOut}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {labels.signIn}
              </>
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          {/* Mobile Auth Button */}
          <Button
            variant={isSignedIn ? "outline" : "default"}
            size="sm"
            onClick={handleAuthClick}
            className="mr-2"
          >
            {isSignedIn ? (
              <LogOut className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
          </Button>

          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className="md:hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        style={{ overflow: "hidden" }}
      >
        <div className="container flex flex-col space-y-3 px-4 pb-5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {labels[item.key]}
              </Link>
            );
          })}

          {/* Mobile Full Auth Button */}
          <Button
            variant={isSignedIn ? "outline" : "default"}
            onClick={handleAuthClick}
            className="mt-2 w-full justify-start transition-all"
          >
            {isSignedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {labels.signOut}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {labels.signIn}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </nav>
  );
}
