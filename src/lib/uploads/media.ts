import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "media";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SAFE_NAME_RE = /[^a-z0-9._-]+/gi;

function cleanFileName(name: string) {
  const cleaned = name.replace(SAFE_NAME_RE, "-").replace(/^-+|-+$/g, "");
  return cleaned || "upload";
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName !== file.name.toLowerCase()) return fromName;
  return file.type.split("/")[1] ?? "bin";
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Choose an image file.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 8 MB or smaller.";
  return null;
}

export async function uploadPublicImage({
  supabase,
  file,
  folder,
}: {
  supabase: SupabaseClient;
  file: File;
  folder: string;
}) {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const extension = extensionFor(file);
  const baseName = cleanFileName(file.name.replace(/\.[^.]+$/, ""));
  const path = `${folder}/${crypto.randomUUID()}-${baseName}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
