"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HiOutlineInformationCircle, HiOutlineMail } from "react-icons/hi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fragment, useState } from "react";
import { Loader2 } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";


const userProfileForm = z.object({
  email: z.string().email().default(""),
  password: z.string().default(''),
});

interface ShowAlertProps {
  show: boolean;
  variant?: "success" | "destructive";
  title?: string;
  description?: string;
}

export default function AuthForm() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>();

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        }
      });
      // Handle success, e.g., redirect or fetch user data
    } catch (error) {
      // Handle error, e.g., display an error message
      console.error('Login failed:', error);
    }
  };

  const [alert, setAlert] = useState<ShowAlertProps>({
    show: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof userProfileForm>>({
    resolver: zodResolver(userProfileForm),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  async function onLogin(values: z.infer<typeof userProfileForm>) {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setLoading(false);
      return setAlert({
        show: true,
        title: "An error has occured!",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
    setAlert({
      show: true,
      title: "Success!",
      description: "Redirecting...",
      variant: "success",
    });

    return window.location.replace('/')
  }

  return (
    <main className="w-full flex flex-col items-center justify-center px-4 mt-8">
      <div className="max-w-sm w-full text-gray-600 space-y-8">
        <div className="text-center">
          <div className="mt-5 space-y-2">
            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
              Log in to your account
            </h3>
            <p className="">
              Log in or create an account to post your recommendations.
            </p>
          </div>
        </div>
        {alert.show && (
          <Alert variant={alert.variant}>
            <HiOutlineInformationCircle className="h-5 w-5" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onLogin)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-5">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (
                <Fragment>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Fragment>
              ) : (
                <Fragment>
                  <HiOutlineMail className="w-5 h-5 mr-2" />
                  Log In
                </Fragment>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <span className="block w-full h-px bg-gray-300"></span>
          <p className="inline-block w-fit text-sm bg-white px-2 absolute -top-2 inset-x-0 mx-auto">
            Or continue with
          </p>
        </div>
        <div className="space-y-4 text-sm font-medium">
          <Button className="w-full" variant="secondary" onClick={handleGoogleLogin}>
            <FcGoogle className="w-6 h-6 mr-2" />
            Continue with Google
          </Button>
          <Button className="w-full" variant="secondary" disabled>
            <FaApple className="w-6 h-6 mr-2" />
            Continue with Apple
          </Button>
        </div>
      </div>
    </main>
  );
}
