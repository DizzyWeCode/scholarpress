import { NextResponse } from "next/server";
import { crossrefMetadata, isCrossrefWork } from "@/lib/crossref";
import { normalizeDoi } from "@/lib/utils";
import { getOwnerSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CROSSREF_URL = "https://api.crossref.org/works/";
const CROSSREF_TIMEOUT_MS = 10_000;

export async function POST(request: Request) {
  const { user, isOwner } = await getOwnerSession();
  if (!user || !isOwner) {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }

  let body: { doi?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const doi = normalizeDoi(typeof body.doi === "string" ? body.doi : null);
  if (!doi) {
    return NextResponse.json(
      { error: "Enter a valid DOI such as 10.1000/example." },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${CROSSREF_URL}${encodeURIComponent(doi)}`, {
      headers: {
        Accept: "application/vnd.crossref.unixref+xml; q=0.1, application/json",
        "User-Agent": "ScholarPress/1.0 (mailto:fdzinjalamala@must.ac.mw)",
      },
      signal: AbortSignal.timeout(CROSSREF_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof DOMException && error.name === "TimeoutError"
      ? "Crossref took too long to respond. Try again."
      : "Crossref could not be reached. Check your connection and try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (response.status === 404) {
    return NextResponse.json({ error: "No Crossref record was found for this DOI." }, { status: 404 });
  }
  if (response.status === 429) {
    return NextResponse.json({ error: "Crossref is rate-limiting requests. Wait a moment and try again." }, { status: 429 });
  }
  if (!response.ok) {
    return NextResponse.json({ error: "Crossref could not retrieve metadata for this DOI." }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return NextResponse.json({ error: "Crossref returned an unreadable response." }, { status: 502 });
  }
  if (!isCrossrefWork(data)) {
    return NextResponse.json({ error: "Crossref returned incomplete metadata for this DOI." }, { status: 502 });
  }

  return NextResponse.json({ metadata: crossrefMetadata(data.message, doi) });
}
