import { format } from "date-fns";
import { redirect } from "next/navigation";
import { getOwnerSession, getSupabaseServer } from "@/lib/supabase/server";
import type { EmailPurpose, EmailSend, EmailStatus } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

const PURPOSE_LABEL: Record<EmailPurpose, string> = {
  welcome: "Welcome",
  newsletter: "Newsletter",
  webinar_announcement: "Webinar announcement",
  webinar_reminder: "Webinar reminder",
};

const STATUS_ORDER: EmailStatus[] = [
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "failed",
];

const REACHED_DELIVERY: EmailStatus[] = ["delivered", "opened", "clicked"];
const REACHED_OPEN: EmailStatus[] = ["opened", "clicked"];

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function statusClass(status: EmailStatus): string {
  if (status === "failed" || status === "bounced") return "text-red-700";
  if (status === "queued") return "text-ink-4";
  return "text-ink";
}

export default async function AdminEmailPage() {
  const { user, isOwner } = await getOwnerSession();
  if (!user || !isOwner) redirect("/login");

  const supabase = getSupabaseServer();
  const [rowsResult, totalResult] = await Promise.all([
    supabase
      .from("email_sends")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("email_sends").select("id", { count: "exact", head: true }),
  ]);

  const sends = (rowsResult.data ?? []) as EmailSend[];
  const totalAll = totalResult.count ?? sends.length;
  const loadError = rowsResult.error?.message ?? null;

  const byStatus = new Map<EmailStatus, number>();
  for (const s of sends) byStatus.set(s.status, (byStatus.get(s.status) ?? 0) + 1);

  const purposes = Array.from(
    new Set(sends.map((s) => s.purpose)),
  ) as EmailPurpose[];
  const byPurpose = purposes.map((purpose) => {
    const rows = sends.filter((s) => s.purpose === purpose);
    const count = (statuses: EmailStatus[]) =>
      rows.filter((s) => statuses.includes(s.status)).length;
    const delivered = count(REACHED_DELIVERY);
    return {
      purpose,
      total: rows.length,
      delivered,
      opened: count(REACHED_OPEN),
      clicked: count(["clicked"]),
      failed: count(["failed", "bounced"]),
    };
  });
  byPurpose.sort((a, b) => b.total - a.total);

  const overallDelivered = sends.filter((s) =>
    REACHED_DELIVERY.includes(s.status),
  ).length;
  const overallOpened = sends.filter((s) =>
    REACHED_OPEN.includes(s.status),
  ).length;
  const overallFailed = sends.filter(
    (s) => s.status === "failed" || s.status === "bounced",
  ).length;

  const cards = [
    { label: "Emails sent", value: String(totalAll) },
    { label: "Delivered", value: pct(overallDelivered, sends.length) },
    { label: "Opened", value: pct(overallOpened, overallDelivered) },
    { label: "Failed / bounced", value: pct(overallFailed, sends.length) },
  ];

  return (
    <div>
      <AdminPageHeader eyebrow="Communication" title="Email log" description={`${totalAll} messages recorded across all delivery purposes.`} />

      {loadError && (
        <p className="mt-4 border-t border-line pt-4 text-sm text-red-700">
          Could not load email_sends: {loadError}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-paper px-4 py-6">
            <p className="text-xs uppercase tracking-widest text-ink-4">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-3xl tracking-tight text-ink">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            By purpose
          </h2>
          {byPurpose.length === 0 ? (
            <p className="border-t border-line py-8 text-sm text-ink-3">
              No emails sent yet.
            </p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-ink-4">
                  <th className="py-2 font-normal">Purpose</th>
                  <th className="py-2 text-right font-normal">Sent</th>
                  <th className="py-2 text-right font-normal">Delivered</th>
                  <th className="py-2 text-right font-normal">Opened</th>
                  <th className="py-2 text-right font-normal">Failed</th>
                </tr>
              </thead>
              <tbody>
                {byPurpose.map((row) => (
                  <tr key={row.purpose} className="border-b border-line">
                    <td className="py-2.5 text-ink">{PURPOSE_LABEL[row.purpose]}</td>
                    <td className="py-2.5 text-right text-ink-3">{row.total}</td>
                    <td className="py-2.5 text-right text-ink-3">{row.delivered}</td>
                    <td className="py-2.5 text-right text-ink-3">{row.opened}</td>
                    <td
                      className={`py-2.5 text-right ${row.failed ? "text-red-700" : "text-ink-3"}`}
                    >
                      {row.failed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2 className="mt-8 text-xs uppercase tracking-widest text-ink-4">
            By status (recent {sends.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
            {STATUS_ORDER.map((status) => (
              <span key={status} className="text-sm text-ink-3">
                <span className={statusClass(status)}>{status}</span>{" "}
                <span className="text-ink-4">{byStatus.get(status) ?? 0}</span>
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink-4">
            Recent sends
          </h2>
          <div className="mt-3 border-t border-line">
            {sends.length === 0 ? (
              <p className="py-8 text-sm text-ink-3">No email sends recorded.</p>
            ) : (
              sends.slice(0, 50).map((s) => (
                <div
                  key={s.id}
                  className="grid gap-1 border-b border-line py-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">
                      {s.recipient_email}
                      <span className="ml-2 text-ink-4">
                        {PURPOSE_LABEL[s.purpose]}
                      </span>
                    </p>
                    <p className="truncate text-xs text-ink-4">
                      {s.subject ?? "—"}
                      {s.error_message ? (
                        <span className="text-red-700"> — {s.error_message}</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className={`uppercase tracking-widest ${statusClass(s.status)}`}>
                      {s.status}
                    </span>
                    <span className="ml-3 text-ink-4">
                      {format(new Date(s.created_at), "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
