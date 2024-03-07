"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");

  let t = trpc.authCallback.useQuery(undefined, {
    // retry: true,
    // retryDelay: 5000,
  });

  useEffect(() => {
    console.log("authCallback result:", t);

    if (t.data?.success) {
      console.log("User synced to DB, redirecting...");
      router.push(origin ? `${origin}` : "/dashboard");
    }

    if (t.error) {
      console.log("Error occurred:", t.error);
      if (t.error.data?.code === "UNAUTHORIZED") {
        console.log("User is unauthorized, redirecting to sign-in page");
        router.push("/sign-in");
      }
    }
  }, [t.data?.success, t.error, t]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h8 w-8 animate-spin text-zinc-800" />
        <h1 className="font-semibold text-xl ">Setting up your account...</h1>
        <p>You will be redirected automatically</p>
      </div>
    </div>
  );
};

export default page;
