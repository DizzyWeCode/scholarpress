"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function SubscribeButton() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowser();
      supabase.auth.getUser().then(({ data }) => {
        setSignedIn(Boolean(data.user));
        setReady(true);
      });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(Boolean(session?.user));
        setReady(true);
      });
      return () => subscription.unsubscribe();
    } catch {
      // Keep the public shell usable in previews where Supabase is not configured.
      setReady(true);
      return undefined;
    }
  }, []);

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    setSignedIn(false);
    router.replace("/");
    router.refresh();
  }

  if (ready && signedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="rounded-full border border-ink px-4 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Account
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="hidden text-sm text-ink-3 underline underline-offset-2 transition-colors hover:text-ink sm:inline"
        >
          Sign out
        </button>
      </div>
    );
  }

  const next =
    pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";

  return (
    <Link
      href={`/login${next}`}
      className="rounded-full border border-ink px-4 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      Sign in
    </Link>
  );
}
