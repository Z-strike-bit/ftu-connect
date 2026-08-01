"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Props = { children: React.ReactNode };

export default function PostHogProvider({ children }: Props) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    // Initialize once
    if (!(posthog as any).__initialized) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        loaded: () => {
          (posthog as any).__initialized = true;
        },
      });
    }

    // identify on auth state change
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // minimal properties; expand as needed in later sprints
        posthog.identify(user.uid, {
          email: user.email || undefined,
        });
      } else {
        try {
          posthog.reset();
        } catch (e) {
          // ignore
        }
      }
    });

    // pageview
    try {
      posthog.capture("$pageview");
    } catch (e) {
      // ignore
    }

    return () => {
      unsub();
    };
  }, []);

  return <>{children}</>;
}
