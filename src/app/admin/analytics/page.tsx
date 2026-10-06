"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { PageView } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Range = 7 | 30 | 90;

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [views, setViews] = useState<PageView[] | null>(null);

  useEffect(() => {
    const since = subDays(new Date(), range).toISOString();
    getSupabaseBrowser()
      .from("page_views")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(10000)
      .then(({ data }) => setViews((data ?? []) as PageView[]));
  }, [range]);

  const daily = useMemo(() => {
    if (!views) return [];
    const buckets = new Map<string, number>();
    for (let i = range - 1; i >= 0; i--) {
      buckets.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
    }
    for (const v of views) {
      const day = format(new Date(v.created_at), "yyyy-MM-dd");
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([day, count]) => ({
      day: format(new Date(day), range > 7 ? "dd MMM" : "EEE"),
      views: count,
    }));
  }, [views, range]);

  const topPages = useMemo(() => {
    if (!views) return [];
    const counts = new Map<string, number>();
    views.forEach((v) => counts.set(v.path, (counts.get(v.path) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [views]);

  const referrers = useMemo(() => {
    if (!views) return [];
    const counts = new Map<string, number>();
    views.forEach((v) => {
      const r = v.referrer || "Direct";
      counts.set(r, (counts.get(r) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [views]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-ink">Analytics</h1>
        <div className="flex gap-2">
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                range === r
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-3 hover:border-ink hover:text-ink"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 max-w-lg text-xs leading-relaxed text-ink-4">
        Privacy-respecting analytics: page views are recorded only for visitors
        who accepted cookies. No IPs, no fingerprints.
      </p>

      <div className="mt-8 border border-line p-6" style={{ borderRadius: 7 }}>
        <p className="text-xs uppercase tracking-widest text-ink-4">
          Page views — last {range} days ({views?.length ?? 0} total)
        </p>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9c9c9c" }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9c9c9c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "none",
                  borderRadius: 7,
                  color: "#fafafa",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#9c9c9c" }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#0a0a0a"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="border border-line p-6" style={{ borderRadius: 7 }}>
          <p className="text-xs uppercase tracking-widest text-ink-4">
            Most-read pages
          </p>
          <div className="mt-4">
            {topPages.length === 0 ? (
              <p className="py-6 text-sm text-ink-3">No data yet.</p>
            ) : (
              topPages.map(([path, count]) => (
                <div
                  key={path}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 text-sm"
                >
                  <span className="truncate text-ink-2">{path}</span>
                  <span className="shrink-0 text-ink">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="border border-line p-6" style={{ borderRadius: 7 }}>
          <p className="text-xs uppercase tracking-widest text-ink-4">
            Where readers arrive from
          </p>
          <div className="mt-4">
            {referrers.length === 0 ? (
              <p className="py-6 text-sm text-ink-3">No data yet.</p>
            ) : (
              referrers.map(([host, count]) => (
                <div
                  key={host}
                  className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 text-sm"
                >
                  <span className="truncate text-ink-2">{host}</span>
                  <span className="shrink-0 text-ink">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
