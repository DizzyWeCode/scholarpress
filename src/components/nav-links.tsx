"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string };

/** Primary nav links — marks the active route with aria-current and a visible state. */
export function NavLinks({
  links,
  className = "",
  activeClassName = "",
}: {
  links: NavLink[];
  className?: string;
  activeClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? activeClassName : className}
            onClick={(e) => {
              const details = e.currentTarget.closest("details");
              if (details instanceof HTMLDetailsElement) details.open = false;
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
