import { supabase } from "../config/supabase";
import { CatchReport, Comment, User } from "../types";
const PAGE_SIZE = 10;

// ─── User ───────────────────────────────────────────────────────────────

export async function createUserProfile(user: Omit<User, "created_at">): Promise<void> {
  const { error } = await supabase.from("profiles").insert(user);
  if (error) throw error;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) return null;
  return data as User;
}

// ─── Upload Image ───────────────────────────────────────────────────────

export async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  // Convert blob to arraybuffer
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("report-photos")
    .upload(path, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("report-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}

// ─── Reports ────────────────────────────────────────────────────────────

export async function createReport(
  data: Omit<CatchReport, "id" | "created_at" | "likes_count" | "comments_count">
): Promise<string> {
  const { data: inserted, error } = await supabase
    .from("reports")
    .insert(data)
    .select("id")
    .single();

  if (error) throw error;
  return inserted.id;
}

export async function getReports(
  page: number = 0
): Promise<{ reports: CatchReport[]; hasMore: boolean }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const reports = (data ?? []) as CatchReport[];
  return { reports, hasMore: reports.length >= PAGE_SIZE };
}

export async function getReportById(id: string): Promise<CatchReport | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as CatchReport;
}

export async function getUserReports(userId: string): Promise<CatchReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CatchReport[];
}

export async function getAllReportsForMap(): Promise<CatchReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as CatchReport[];
}

// ─── Likes ──────────────────────────────────────────────────────────────

export async function toggleLike(
  reportId: string,
  userId: string
): Promise<boolean> {
  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Unlike
    await supabase
      .from("likes")
      .delete()
      .eq("report_id", reportId)
      .eq("user_id", userId);

    await supabase.rpc("decrement_likes", { report_id_input: reportId });
    return false;
  } else {
    // Like
    await supabase
      .from("likes")
      .insert({ report_id: reportId, user_id: userId });

    await supabase.rpc("increment_likes", { report_id_input: reportId });
    return true;
  }
}

export async function hasUserLiked(
  reportId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .single();

  return !!data;
}

// ─── Comments ───────────────────────────────────────────────────────────

export async function addComment(
  comment: Omit<Comment, "id" | "created_at">
): Promise<string> {
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select("id")
    .single();

  if (error) throw error;

  // Increment comments count
  await supabase.rpc("increment_comments", { report_id_input: comment.report_id });

  return data.id;
}

export async function getComments(reportId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Comment[];
}
