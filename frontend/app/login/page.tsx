"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

type LoginData = {
  username: string;
  password: string;
};

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();

  const handleLogin = (values: LoginData) => {
    fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = searchParams.get("redirect") || "/finances";
          setError(null);
        } else {
          setError("Incorrect username or password");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)}>
        <div className="w-full h-screen flex justify-center items-center bg-slate-50">
          <Card className="md:w-1/2 lg:w-1/3 xl:w-1/4">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Link
                  href="/register"
                  className="hover:underline underline-offset-4 text-sm text-muted-foreground text-offset"
                >
                  Create an account
                </Link>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">
                Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
