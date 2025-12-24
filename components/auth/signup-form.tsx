"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const signUpformSchema = z
  .object({
    email: z.email("Enter a valid email adress"),
    password: z.string().min(6, "Enter a valid password"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {
  const [isLoading, setLoading] = useState(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof signUpformSchema>>({
    resolver: zodResolver(signUpformSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpformSchema>) => {
    try {
      setLoading(true);
      await authClient.signUp.email(
        {
          name: data.email,
          email: data.email,
          password: data.password,
          callbackURL: "/sign-in",
        },
        {
          onSuccess: () => {
            // router.push("/sign-in");
            toast.success("Signed up successfully!");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const signInwithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const cardShadow =
    "8px 8px 0 0 rgba(0,0,0,0.9), -4px -4px 0 0 rgba(255,255,255,0.8), inset 2px 2px 0 rgba(0,0,0,0.06)";

  return (
    <Card
      className="w-[90vw] md:w-full sm:max-w-md border-4 border-black rounded-2xl bg-[#fbfbfb]"
      style={{ boxShadow: cardShadow }}
    >
      <CardHeader className="md:space-y-1">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
          Create your VivaCrochet account
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-gray-700">
          Sign up to start managing your crochet goodies ✨
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="signup-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3 md:gap-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 border-2 border-black rounded-none px-3 py-2"
                >
                  <FieldLabel className="text-[0.65rem] md:text-xs uppercase tracking-wide">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    className="border-none bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs md:text-sm"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[0.7rem] text-red-700"
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 border-2 border-black rounded-none px-3 py-2"
                >
                  <FieldLabel className="flex items-center justify-between text-[0.65rem] md:text-xs uppercase tracking-wide text-gray-700">
                    <span>Password</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    className="border-none bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs md:text-sm"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[0.7rem] text-red-700"
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 border-2 border-black rounded-none px-3 py-2"
                >
                  <FieldLabel className="flex items-center justify-between text-[0.65rem] md:text-xs uppercase tracking-wide text-gray-700">
                    <span>Confirm password</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    className="border-none bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs md:text-sm"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-[0.7rem] text-red-700"
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col w-full">
        <Field
          orientation="horizontal"
          className="flex w-full items-center justify-between  flex-col gap-2"
        >
          <Button
            type="submit"
            form="signup-form"
            variant={"elevated"}
            className="cursor-pointer w-full border-2 bg-pink-400 hover:bg-white text-black rounded-none"
          >
            {isLoading ? <Spinner className="size-6" /> : "Sign up"}
          </Button>

          <p className="text-xs md:text-sm flex items-center gap-1 mt-1">
            Already have an account?
            <Link
              href="/sign-in"
              className="text-blue-600 underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </Field>

        <div className="flex flex-col w-full my-4 md:my-6 items-center justify-center">
          <p className="text-xs md:text-sm font-medium text-gray-700">Or</p>
          <Separator className="gap-6 my-1 border-2 border-dashed border-black" />
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button
            type="button"
            onClick={signInwithGoogle}
            variant={"elevated"}
            className="cursor-pointer w-full border-2 hover:bg-pink-400 bg-white text-black rounded-none"
        >
            Continue with Google
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
