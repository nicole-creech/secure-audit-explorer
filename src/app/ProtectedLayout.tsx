"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

function ProtectedContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        void signOut({
          callbackUrl: "/login?reason=inactive",
        });
      }, IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
      <ProtectedContent>{children}</ProtectedContent>
    </SessionProvider>
  );
}