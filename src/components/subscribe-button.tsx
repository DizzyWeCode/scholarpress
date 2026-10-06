import Link from "next/link";

export function SubscribeButton() {
  return (
    <Link
      href="/login"
      className="rounded-full border border-ink px-4 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      Subscribe
    </Link>
  );
}
