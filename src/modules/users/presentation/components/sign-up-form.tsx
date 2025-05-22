"use client";

import { useLoader } from "@/app/loader.context";
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
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { UserApi } from "../api/user.api";
import { signUpLabels } from "./labels";
import { Localizable } from "@/components/common/i18n";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormProps = {
  redirectTo?: string;
} & Localizable;

export function SignUpForm({ language = "en", redirectTo }: SignUpFormProps) {
  const labels = signUpLabels[language];
  const userApi = useMemo(() => new UserApi(), []);
  const router = useRouter();
  const { isLoading, loadingStart, loadingEnd } = useLoader();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onEmailPasswordSignIn = async (
    values: z.infer<typeof signUpSchema>
  ) => {
    loadingStart();
    try {
      await userApi.registerUser(values);
      toast.info("Successful sign up. You can now sign in.");
      if (redirectTo) {
        router.push(redirectTo);
      }
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error(`Cannot sign in`);
    } finally {
      loadingEnd();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg py-8">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {labels.signUpTitle}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.confirmPassword}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={labels.confirmPasswordPlaceholder}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {labels.signUpButton}
              {isLoading && <LoadingSpinner />}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {labels.hasAccount}{" "}
          <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
            {labels.signInButton}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
