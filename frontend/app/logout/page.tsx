"use client";

import Spinner from "@/components/Spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function LogoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogout = useCallback(() => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          router.push(searchParams.get("redirect") || "/login");
        } else {
          console.log("Failed to logout", res);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [router, searchParams]);

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <Spinner msg="Logging out..." />
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense>
      <LogoutPageInner />
    </Suspense>
  );
}
