export type PostStatus = "draft" | "published" | "scheduled";
export type WebinarStatus = "upcoming" | "past" | "draft";

export interface ReferenceItem {
  label: string;
  url?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  institution: string | null;
  title: string | null;
  newsletter_format: "all" | "essays" | "announcements" | "none";
  role: "owner" | "reader";
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: Record<string, unknown> | null; // TipTap JSON document
  cover_image_url: string | null;
  cover_image_credit: string | null;
  cover_image_credit_url: string | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  references: ReferenceItem[];
  reading_time_minutes: number | null;
  like_count: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  authors: string[];
  venue: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  pdf_url: string | null;
  tags: string[];
  featured: boolean;
  status: "draft" | "published";
  created_at: string;
}

export interface Webinar {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
  platform: string | null;
  registration_url: string | null;
  recording_url: string | null;
  status: WebinarStatus;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  user_id: string | null;
  source: string | null;
  created_at: string;
}

export interface PageView {
  id: number;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string | null;
  author_name: string;
  body: string;
  status: "visible" | "hidden" | "deleted";
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  user_id: string;
  post_id: string;
  created_at: string;
  posts?: Pick<Post, "id" | "slug" | "title" | "excerpt" | "published_at" | "cover_image_url"> | null;
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
  vote_count: number;
}

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  status: "draft" | "open" | "closed";
  allow_results_before_vote: boolean;
  poll_options: PollOption[];
}

export type EmailPurpose =
  | "welcome"
  | "newsletter"
  | "webinar_announcement"
  | "webinar_reminder";

export type EmailStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "failed";

export interface EmailSend {
  id: string;
  purpose: EmailPurpose;
  recipient_email: string;
  subject: string | null;
  post_id: string | null;
  webinar_id: string | null;
  resend_email_id: string | null;
  status: EmailStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  created_at: string;
}
