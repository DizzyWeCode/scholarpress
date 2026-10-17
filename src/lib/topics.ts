import type { SupabaseClient } from "@supabase/supabase-js";
import type { Paper, Post, Webinar } from "@/lib/types";

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_public: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export type TopicContentType = "blog_post" | "research_output" | "event" | "asset" | "newsletter_issue" | "event_recording";

interface ContentTopicRow {
  topic_id: string;
  content_type: TopicContentType;
  content_id: string;
  sort_order: number;
}

export interface TopicContent {
  posts: Post[];
  papers: Paper[];
  webinars: Webinar[];
}

export async function getPublicTopics(supabase: SupabaseClient | null): Promise<Topic[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) {
    console.warn(`topics query failed (${error.code}): ${error.message}`);
    return [];
  }
  return (data ?? []) as Topic[];
}

export async function getPublicTopicBySlug(
  supabase: SupabaseClient | null,
  slug: string,
): Promise<Topic | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (error) {
    console.warn(`topic query failed (${error.code}): ${error.message}`);
    return null;
  }
  return (data as Topic | null) ?? null;
}

export async function getPublicTopicContent(
  supabase: SupabaseClient | null,
  topicId: string,
): Promise<TopicContent> {
  const empty: TopicContent = { posts: [], papers: [], webinars: [] };
  if (!supabase) return empty;

  const linksResult = await supabase
    .from("content_topics")
    .select("topic_id, content_type, content_id, sort_order")
    .eq("topic_id", topicId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (linksResult.error) {
    console.warn(`topic content query failed (${linksResult.error.code}): ${linksResult.error.message}`);
    return empty;
  }

  const links = (linksResult.data ?? []) as ContentTopicRow[];
  const idsByType = new Map<TopicContentType, string[]>();
  for (const link of links) {
    if (!idsByType.has(link.content_type)) idsByType.set(link.content_type, []);
    idsByType.get(link.content_type)?.push(link.content_id);
  }

  const [postsResult, papersResult, webinarsResult] = await Promise.all([
    getPosts(supabase, idsByType.get("blog_post") ?? []),
    getPapers(supabase, idsByType.get("research_output") ?? []),
    getWebinars(supabase, idsByType.get("event") ?? []),
  ]);

  return {
    posts: postsResult,
    papers: papersResult,
    webinars: webinarsResult,
  };
}

async function getPosts(supabase: SupabaseClient, ids: string[]): Promise<Post[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, tags, status, published_at, reading_time_minutes, updated_at, cover_image_url")
    .in("id", ids)
    .or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`)
    .order("published_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Post[];
}

async function getPapers(supabase: SupabaseClient, ids: string[]): Promise<Paper[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .in("id", ids)
    .eq("status", "published")
    .order("year", { ascending: false });
  if (error) return [];
  return (data ?? []) as Paper[];
}

async function getWebinars(supabase: SupabaseClient, ids: string[]): Promise<Webinar[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("webinars")
    .select("*")
    .in("id", ids)
    .in("status", ["scheduled", "registration_open", "upcoming", "live", "past", "replay_available"])
    .order("starts_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Webinar[];
}
