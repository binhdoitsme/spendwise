"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";
import { BasicUserApi } from "@/modules/shared/presentation/contracts/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthApi } from "../contracts/auth.service";
import { useAuthContext } from "./auth-context";
import { signInLabels } from "./labels";
import { SSOLoginActions } from "./sso-actions";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export interface SignInFormProps {
  language?: string;
  ssoProviders: Set<string>;
  redirectTo?: string;
}

export function SignInForm({
  language = "en",
  ssoProviders,
  redirectTo,
}: SignInFormProps) {
  const labels = signInLabels[language];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authApi = useMemo(() => new AuthApi(), []);
  const userApi = useMemo(() => new BasicUserApi(), []);
  const router = useRouter();
  const { setUser } = useAuthContext();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onEmailPasswordSignIn = async (
    values: z.infer<typeof signInSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await authApi.signIn(values);
      form.reset();
      const user = await userApi.me();
      setUser(user);
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      toast.error(`Cannot sign in`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg py-8">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {labels.signInTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onEmailPasswordSignIn)}
            className="space-y-4"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={labels.emailPlaceholder}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.password}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={labels.passwordPlaceholder}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {labels.signInButton}
              {isSubmitting && <LoadingSpinner />}
            </Button>
          </form>
        </Form>
        <SSOLoginActions labels={labels} ssoProviders={ssoProviders} />
        <div className="mt-4 text-center text-sm">
          {labels.noAccount}{" "}
          <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
            {labels.signUpButton}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
