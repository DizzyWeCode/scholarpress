"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { AdminButton, AdminCard, AdminCardHeader, AdminInput, AdminPageHeader, StatusBadge } from "@/components/admin-ui";
import { useToast } from "@/components/toast";
import type { Paper, PaperContributor } from "@/lib/types";
import { normalizeDoi } from "@/lib/utils";

type EditorProps = { paperId?: string };
type ContributorRow = PaperContributor & { id: string };

type FormState = {
  title: string;
  abstract: string;
  public_summary: string;
  venue: string;
  year: string;
  doi: string;
  url: string;
  pdf_url: string;
  output_type: Paper["output_type"];
  publication_stage: Paper["publication_stage"];
  publication_date_precision: Paper["publication_date_precision"];
  online_publication_date: string;
  print_publication_date: string;
  accepted_date: string;
  journal_title: string;
  journal_abbreviation: string;
  issn: string;
  eissn: string;
  volume: string;
  issue: string;
  article_number: string;
  first_page: string;
  last_page: string;
  publisher: string;
  pmid: string;
  isbn: string;
  repository_identifier: string;
  publisher_url: string;
  version_of_record_url: string;
  access_status: Paper["access_status"];
  license: string;
  funder: string;
  grant_identifier: string;
  ethics_reference: string;
  citation_text: string;
  tags: string;
  featured: boolean;
  status: Paper["status"];
};

const OUTPUT_TYPES: Array<[Paper["output_type"], string]> = [
  ["journal_article", "Journal article"],
  ["conference_proceeding", "Conference proceeding"],
  ["conference_presentation", "Conference presentation"],
  ["preprint", "Preprint / posted content"],
  ["working_paper", "Working paper"],
  ["technical_report", "Technical report"],
  ["policy_brief", "Policy brief"],
  ["dataset", "Dataset"],
  ["research_protocol", "Research protocol"],
  ["registered_report", "Registered report"],
  ["thesis_dissertation", "Thesis / dissertation"],
  ["book_chapter", "Book chapter"],
  ["other", "Other scholarly output"],
];

const PUBLICATION_STAGES: Array<[Paper["publication_stage"], string]> = [
  ["submitted_manuscript", "Submitted manuscript"],
  ["under_review", "Under review"],
  ["accepted_manuscript", "Accepted manuscript"],
  ["version_of_record", "Version of record"],
  ["posted_content", "Posted content"],
  ["withdrawn", "Withdrawn"],
  ["unknown", "Unknown"],
];

const initialForm: FormState = {
  title: "", abstract: "", public_summary: "", venue: "", year: "", doi: "", url: "", pdf_url: "",
  output_type: "journal_article", publication_stage: "version_of_record", publication_date_precision: "year",
  online_publication_date: "", print_publication_date: "", accepted_date: "", journal_title: "", journal_abbreviation: "",
  issn: "", eissn: "", volume: "", issue: "", article_number: "", first_page: "", last_page: "", publisher: "",
  pmid: "", isbn: "", repository_identifier: "", publisher_url: "", version_of_record_url: "", access_status: "unknown",
  license: "", funder: "", grant_identifier: "", ethics_reference: "", citation_text: "", tags: "", featured: false, status: "draft",
};

const inputClass = "mt-2";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500";

function contributorFromName(name: string, index: number): ContributorRow {
  return { id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`, name };
}

function formFromPaper(paper: Paper): FormState {
  return {
    title: paper.title ?? "", abstract: paper.abstract ?? "", public_summary: paper.public_summary ?? "", venue: paper.venue ?? "",
    year: paper.year ? String(paper.year) : "", doi: paper.doi ?? "", url: paper.url ?? "", pdf_url: paper.pdf_url ?? "",
    output_type: paper.output_type ?? "other", publication_stage: paper.publication_stage ?? "unknown", publication_date_precision: paper.publication_date_precision ?? "year",
    online_publication_date: paper.online_publication_date ?? "", print_publication_date: paper.print_publication_date ?? "", accepted_date: paper.accepted_date ?? "",
    journal_title: paper.journal_title ?? "", journal_abbreviation: paper.journal_abbreviation ?? "", issn: paper.issn ?? "", eissn: paper.eissn ?? "",
    volume: paper.volume ?? "", issue: paper.issue ?? "", article_number: paper.article_number ?? "", first_page: paper.first_page ?? "", last_page: paper.last_page ?? "",
    publisher: paper.publisher ?? "", pmid: paper.pmid ?? "", isbn: paper.isbn ?? "", repository_identifier: paper.repository_identifier ?? "",
    publisher_url: paper.publisher_url ?? paper.url ?? "", version_of_record_url: paper.version_of_record_url ?? "", access_status: paper.access_status ?? "unknown",
    license: paper.license ?? "", funder: paper.funder ?? "", grant_identifier: paper.grant_identifier ?? "", ethics_reference: paper.ethics_reference ?? "",
    citation_text: paper.citation_text ?? "", tags: (paper.tags ?? []).join(", "), featured: Boolean(paper.featured), status: paper.status ?? "draft",
  };
}

export function ResearchOutputEditor({ paperId }: EditorProps) {
  const isNew = !paperId;
  const [paper, setPaper] = useState<Paper | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [contributors, setContributors] = useState<ContributorRow[]>([contributorFromName("", 0)]);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [fetchingDoi, setFetchingDoi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    if (!paperId) return;
    let active = true;
    void getSupabaseBrowser().from("papers").select("*").eq("id", paperId).single().then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError || !data) setError(loadError?.message ?? "Research output not found.");
      else {
        const loaded = data as Paper;
        setPaper(loaded);
        setForm(formFromPaper(loaded));
        const loadedContributors = loaded.contributors?.length ? loaded.contributors : (loaded.authors ?? []).map((name) => contributorFromName(name, 0));
        setContributors(loadedContributors.map((item, index) => ({ ...item, id: `${loaded.id}-${index}` })));
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [paperId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const filledContributors = useMemo(() => contributors.filter((item) => item.name.trim()), [contributors]);
  const completeness = useMemo(() => {
    const checks = [Boolean(form.title.trim()), filledContributors.length > 0, Boolean(form.abstract.trim() || form.public_summary.trim()), Boolean(form.output_type), Boolean(form.status)];
    return checks.filter(Boolean).length;
  }, [filledContributors.length, form.abstract, form.output_type, form.public_summary, form.status, form.title]);

  function updateContributor(id: string, key: keyof PaperContributor, value: string | boolean | string[]) {
    setContributors((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  }

  async function fetchFromDoi() {
    const doi = normalizeDoi(form.doi);
    if (!doi) { setError("Enter a valid DOI such as 10.1000/example before fetching."); return; }
    setFetchingDoi(true); setError(null);
    try {
      const response = await fetch("/api/admin/papers/crossref", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doi }) });
      const result = await response.json() as { error?: string; metadata?: { title: string | null; abstract: string | null; authors: string[]; venue: string | null; year: number | null; doi: string; url: string } };
      if (!response.ok || !result.metadata) { setError(result.error ?? "Could not fetch DOI metadata."); return; }
      const metadata = result.metadata;
      setForm((current) => ({ ...current, doi: metadata.doi, title: current.title.trim() ? current.title : metadata.title ?? current.title, abstract: current.abstract.trim() ? current.abstract : metadata.abstract ?? current.abstract, venue: current.venue.trim() ? current.venue : metadata.venue ?? current.venue, year: current.year || (metadata.year ? String(metadata.year) : ""), publisher_url: current.publisher_url.trim() ? current.publisher_url : metadata.url }));
      if (!filledContributors.length && metadata.authors.length) setContributors(metadata.authors.map((name, index) => contributorFromName(name, index)));
      push({ kind: "success", title: "DOI metadata loaded", body: "Review the imported fields before saving." });
    } catch { setError("Could not fetch DOI metadata. Check your connection and try again."); }
    finally { setFetchingDoi(false); }
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!filledContributors.length) { setError("Add at least one author or contributor."); return; }
    const doi = normalizeDoi(form.doi);
    if (form.doi.trim() && !doi) { setError("Enter a valid DOI such as 10.1000/example."); return; }
    setBusy(true); setError(null);
    const contributorPayload = filledContributors.map(({ id: _id, ...item }) => item);
    const payload = {
      title: form.title.trim(), abstract: form.abstract.trim() || null, public_summary: form.public_summary.trim() || null,
      authors: filledContributors.filter((item) => !item.roles?.includes("contributor")).map((item) => item.name.trim()), contributors: contributorPayload,
      venue: form.venue.trim() || null, year: form.year ? Number(form.year) : null, doi, url: form.url.trim() || null, pdf_url: form.pdf_url.trim() || null,
      output_type: form.output_type, publication_stage: form.publication_stage, publication_date_precision: form.publication_date_precision,
      online_publication_date: form.online_publication_date || null, print_publication_date: form.print_publication_date || null, accepted_date: form.accepted_date || null,
      journal_title: form.journal_title.trim() || null, journal_abbreviation: form.journal_abbreviation.trim() || null, issn: form.issn.trim() || null, eissn: form.eissn.trim() || null,
      volume: form.volume.trim() || null, issue: form.issue.trim() || null, article_number: form.article_number.trim() || null, first_page: form.first_page.trim() || null, last_page: form.last_page.trim() || null,
      publisher: form.publisher.trim() || null, pmid: form.pmid.trim() || null, isbn: form.isbn.trim() || null, repository_identifier: form.repository_identifier.trim() || null,
      publisher_url: form.publisher_url.trim() || null, version_of_record_url: form.version_of_record_url.trim() || null, access_status: form.access_status, license: form.license.trim() || null,
      funder: form.funder.trim() || null, grant_identifier: form.grant_identifier.trim() || null, ethics_reference: form.ethics_reference.trim() || null, citation_text: form.citation_text.trim() || null,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), featured: form.featured, status: form.status,
    };
    const supabase = getSupabaseBrowser();
    const result = paperId ? await supabase.from("papers").update(payload).eq("id", paperId).select("*").single() : await supabase.from("papers").insert(payload).select("*").single();
    setBusy(false);
    if (result.error || !result.data) { setError(result.error?.message ?? "Could not save the research output."); return; }
    const saved = result.data as Paper;
    setPaper(saved); setForm(formFromPaper(saved));
    push({ kind: "success", title: isNew ? "Research output created" : "Research output saved", body: "The record is ready for the next editorial review." });
    if (isNew) window.history.replaceState(null, "", `/admin/papers/${saved.id}`);
  }

  if (loading) return <div className="py-12 text-sm text-slate-500" role="status"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />Loading research output</div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Research library" title={isNew ? "New research output" : "Edit research output"} description="Build a credible, citeable record first. Publishing status and marketing follow-up remain separate decisions." actions={<><Link href="/admin/papers" className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" aria-hidden /> Research outputs</Link><AdminButton onClick={() => void save()} disabled={busy}>{busy ? <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-1.5 h-4 w-4" aria-hidden />}{busy ? "Saving…" : form.status === "published" ? "Save changes" : "Save draft"}</AdminButton></>} />
      {error ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <AdminCard><AdminCardHeader title="Identity and public promise" description="Start with what this output is and why a visitor should care." /><div className="grid gap-5 p-5"><label className={labelClass}>Title<AdminInput className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="The title as it should appear publicly" /></label><div className="grid gap-5 md:grid-cols-2"><label className={labelClass}>Output type<select className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" value={form.output_type} onChange={(e) => set("output_type", e.target.value as FormState["output_type"])}>{OUTPUT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className={labelClass}>Publication stage<select className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" value={form.publication_stage} onChange={(e) => set("publication_stage", e.target.value as FormState["publication_stage"])}>{PUBLICATION_STAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><label className={labelClass}>Accessible public summary<textarea className="mt-2 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={form.public_summary} onChange={(e) => set("public_summary", e.target.value)} placeholder="What should a non-specialist understand from this work?" /></label><label className={labelClass}>Abstract<textarea className="mt-2 min-h-40 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={form.abstract} onChange={(e) => set("abstract", e.target.value)} placeholder="The formal abstract or a concise scholarly description" /></label></div></AdminCard>
          <AdminCard><AdminCardHeader title="Authors and contributors" description="Formal authors and other contributors are stored separately through roles." action={<AdminButton variant="secondary" onClick={() => setContributors((current) => [...current, contributorFromName("", current.length)])}><Plus className="mr-1.5 h-4 w-4" aria-hidden />Add person</AdminButton>} /><div className="space-y-3 p-5">{contributors.map((person, index) => <div key={person.id} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"><label className={labelClass}>Name<AdminInput className={inputClass} value={person.name} onChange={(e) => updateContributor(person.id, "name", e.target.value)} placeholder={index === 0 ? "Dr Fraction Dzinjalamala" : "Contributor name"} /></label><label className={labelClass}>ORCID<AdminInput className={inputClass} value={person.orcid ?? ""} onChange={(e) => updateContributor(person.id, "orcid", e.target.value)} placeholder="0000-0000-0000-0000" /></label><label className={labelClass}>Affiliation<AdminInput className={inputClass} value={person.affiliation ?? ""} onChange={(e) => updateContributor(person.id, "affiliation", e.target.value)} placeholder="Institution or organization" /></label><div className="flex items-center gap-3 pb-1"><label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={Boolean(person.corresponding)} onChange={(e) => updateContributor(person.id, "corresponding", e.target.checked)} />Corresponding</label><button type="button" className="p-1 text-slate-400 hover:text-red-700" aria-label={`Remove ${person.name || `person ${index + 1}`}`} onClick={() => setContributors((current) => current.length === 1 ? current : current.filter((item) => item.id !== person.id))}><Trash2 className="h-4 w-4" aria-hidden /></button></div></div>)}</div></AdminCard>
          <AdminCard><AdminCardHeader title="Publication and access" description="Use only fields that are appropriate for this output type." /><div className="grid gap-5 p-5"><div className="grid gap-5 md:grid-cols-3"><label className={labelClass}>Venue / journal<AdminInput className={inputClass} value={form.venue} onChange={(e) => set("venue", e.target.value)} /></label><label className={labelClass}>Journal title<AdminInput className={inputClass} value={form.journal_title} onChange={(e) => set("journal_title", e.target.value)} /></label><label className={labelClass}>Publisher<AdminInput className={inputClass} value={form.publisher} onChange={(e) => set("publisher", e.target.value)} /></label></div><div className="grid gap-5 md:grid-cols-4"><label className={labelClass}>Year<AdminInput className={inputClass} type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></label><label className={labelClass}>Online publication<AdminInput className={inputClass} type="date" value={form.online_publication_date} onChange={(e) => set("online_publication_date", e.target.value)} /></label><label className={labelClass}>Print publication<AdminInput className={inputClass} type="date" value={form.print_publication_date} onChange={(e) => set("print_publication_date", e.target.value)} /></label><label className={labelClass}>Accepted date<AdminInput className={inputClass} type="date" value={form.accepted_date} onChange={(e) => set("accepted_date", e.target.value)} /></label></div><div className="grid gap-5 md:grid-cols-4"><label className={labelClass}>Volume<AdminInput className={inputClass} value={form.volume} onChange={(e) => set("volume", e.target.value)} /></label><label className={labelClass}>Issue<AdminInput className={inputClass} value={form.issue} onChange={(e) => set("issue", e.target.value)} /></label><label className={labelClass}>Article number<AdminInput className={inputClass} value={form.article_number} onChange={(e) => set("article_number", e.target.value)} /></label><label className={labelClass}>Pages<AdminInput className={inputClass} value={[form.first_page, form.last_page].filter(Boolean).join("–")} onChange={(e) => { const [first, last] = e.target.value.split(/[–-]/); set("first_page", first?.trim() ?? ""); set("last_page", last?.trim() ?? ""); }} placeholder="1–12" /></label></div><div className="grid gap-5 md:grid-cols-3"><label className={labelClass}>Access status<select className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={form.access_status} onChange={(e) => set("access_status", e.target.value as FormState["access_status"])}><option value="unknown">Unknown</option><option value="open_access">Open access</option><option value="restricted">Restricted</option><option value="repository">Repository copy</option></select></label><label className={labelClass}>License<AdminInput className={inputClass} value={form.license} onChange={(e) => set("license", e.target.value)} placeholder="CC BY 4.0" /></label><label className={labelClass}>Date precision<select className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={form.publication_date_precision} onChange={(e) => set("publication_date_precision", e.target.value as FormState["publication_date_precision"])}><option value="year">Year</option><option value="month">Month</option><option value="day">Day</option></select></label></div></div></AdminCard>
          <AdminCard><AdminCardHeader title="Identifiers and links" description="Import from DOI, then review all metadata before saving." /><div className="grid gap-5 p-5"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><label className={labelClass}>DOI<AdminInput className={inputClass} value={form.doi} onChange={(e) => set("doi", e.target.value)} placeholder="10.1000/example" /></label><AdminButton variant="secondary" className="mt-6" onClick={() => void fetchFromDoi()} disabled={fetchingDoi || busy}>{fetchingDoi ? <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : null}{fetchingDoi ? "Fetching…" : "Fetch from DOI"}</AdminButton></div><div className="grid gap-5 md:grid-cols-2"><label className={labelClass}>PMID<AdminInput className={inputClass} value={form.pmid} onChange={(e) => set("pmid", e.target.value)} /></label><label className={labelClass}>ISBN<AdminInput className={inputClass} value={form.isbn} onChange={(e) => set("isbn", e.target.value)} /></label><label className={labelClass}>Publisher URL<AdminInput className={inputClass} value={form.publisher_url} onChange={(e) => set("publisher_url", e.target.value)} /></label><label className={labelClass}>Version-of-record URL<AdminInput className={inputClass} value={form.version_of_record_url} onChange={(e) => set("version_of_record_url", e.target.value)} /></label><label className={labelClass}>Full text / PDF URL<AdminInput className={inputClass} value={form.pdf_url} onChange={(e) => set("pdf_url", e.target.value)} /></label><label className={labelClass}>Repository identifier<AdminInput className={inputClass} value={form.repository_identifier} onChange={(e) => set("repository_identifier", e.target.value)} /></label></div></div></AdminCard>
          <AdminCard><AdminCardHeader title="Context and publishing" description="Keep provenance and operational choices visible to future readers and editors." /><div className="grid gap-5 p-5"><label className={labelClass}>Citation text<textarea className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={form.citation_text} onChange={(e) => set("citation_text", e.target.value)} /></label><div className="grid gap-5 md:grid-cols-3"><label className={labelClass}>Funder<AdminInput className={inputClass} value={form.funder} onChange={(e) => set("funder", e.target.value)} /></label><label className={labelClass}>Grant identifier<AdminInput className={inputClass} value={form.grant_identifier} onChange={(e) => set("grant_identifier", e.target.value)} /></label><label className={labelClass}>Ethics reference<AdminInput className={inputClass} value={form.ethics_reference} onChange={(e) => set("ethics_reference", e.target.value)} /></label></div><label className={labelClass}>Tags / subjects<AdminInput className={inputClass} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="malaria, pharmacology, resistance" /></label></div></AdminCard>
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24"><AdminCard><AdminCardHeader title="Publishing checklist" /><div className="space-y-3 p-5 text-sm"><div className="flex items-center justify-between"><span>Core fields</span><strong>{completeness}/5</strong></div><div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${(completeness / 5) * 100}%` }} /></div><p className="text-xs leading-5 text-slate-500">Save a draft while metadata is incomplete. Publish only when the public summary, author list, type, and stage accurately describe the output.</p><label className={labelClass}>Status<select className="mt-2 min-h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={form.status} onChange={(e) => set("status", e.target.value as Paper["status"])}><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-1" />Feature this output in selected research surfaces.</label><AdminButton className="w-full" onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : form.status === "published" ? "Save and publish" : "Save draft"}</AdminButton></div></AdminCard>{paper?.doi ? <AdminCard><AdminCardHeader title="External record" /><div className="p-5"><a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:underline">Open DOI record<ExternalLink className="h-4 w-4" aria-hidden /></a><p className="mt-2 text-xs text-slate-500">Imported metadata remains reviewable and editable in this workspace.</p><StatusBadge status={paper.status} /></div></AdminCard> : null}</aside>
      </div>
    </div>
  );
}
