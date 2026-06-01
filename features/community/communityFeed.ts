import AsyncStorage from "@react-native-async-storage/async-storage";

import type { FinishSummary } from "@/features/workout/finishFeedback";

export const COMMUNITY_FEED_STORAGE_KEY = "aa_fit_community_feed";

export type CommunityFeedComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type CommunityFeedPost = {
  id: string;
  type: "workout_share";
  sessionId: string;
  athleteName: string;
  userStatus?: string;
  imageUrl?: string;
  workoutId?: string;
  workoutSupabaseId?: string;
  workoutOwnerType?: "program_workout" | "individual_workout";
  workoutTitle: string;
  programId?: string;
  completedAt: string;
  durationSec: number;
  completionRate: number;
  status: "partial" | "completed";
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  reactionsCount: number;
  viewerHasReacted: boolean;
  comments: CommunityFeedComment[];
};

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function sanitizeComment(raw: any): CommunityFeedComment | null {
  if (!raw) return null;

  const body =
    typeof raw.body === "string" && raw.body.trim().length > 0
      ? raw.body.trim()
      : null;

  if (!body) return null;

  return {
    id:
      typeof raw.id === "string" && raw.id.trim().length > 0
        ? raw.id
        : `comment-${Date.now()}`,
    authorName:
      typeof raw.authorName === "string" && raw.authorName.trim().length > 0
        ? raw.authorName.trim()
        : "You",
    body,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0
        ? raw.createdAt
        : new Date().toISOString(),
  };
}

function sanitizePost(raw: any): CommunityFeedPost | null {
  if (!raw || raw.type !== "workout_share") return null;

  const sessionId =
    typeof raw.sessionId === "string" && raw.sessionId.trim().length > 0
      ? raw.sessionId
      : null;

  if (!sessionId) return null;

  return {
    id:
      typeof raw.id === "string" && raw.id.trim().length > 0
        ? raw.id
        : `community-${sessionId}`,
    type: "workout_share",
    sessionId,
    athleteName:
      typeof raw.athleteName === "string" && raw.athleteName.trim().length > 0
        ? raw.athleteName
        : "You",
    userStatus:
      typeof raw.userStatus === "string" && raw.userStatus.trim().length > 0
        ? raw.userStatus
        : undefined,
    imageUrl:
      typeof raw.imageUrl === "string" && raw.imageUrl.trim().length > 0
        ? raw.imageUrl
        : undefined,
    workoutId:
      typeof raw.workoutId === "string" && raw.workoutId.trim().length > 0
        ? raw.workoutId
        : undefined,
    workoutSupabaseId:
      typeof raw.workoutSupabaseId === "string" &&
      raw.workoutSupabaseId.trim().length > 0
        ? raw.workoutSupabaseId
        : undefined,
    workoutOwnerType:
      raw.workoutOwnerType === "program_workout" ||
      raw.workoutOwnerType === "individual_workout"
        ? raw.workoutOwnerType
        : undefined,
    workoutTitle:
      typeof raw.workoutTitle === "string" && raw.workoutTitle.trim().length > 0
        ? raw.workoutTitle
        : "Workout",
    programId: typeof raw.programId === "string" ? raw.programId : undefined,
    completedAt:
      typeof raw.completedAt === "string" && raw.completedAt.trim().length > 0
        ? raw.completedAt
        : new Date().toISOString(),
    durationSec: typeof raw.durationSec === "number" ? raw.durationSec : 0,
    completionRate:
      typeof raw.completionRate === "number" ? raw.completionRate : 0,
    status: raw.status === "partial" ? "partial" : "completed",
    completedSets:
      typeof raw.completedSets === "number" ? raw.completedSets : 0,
    totalSets: typeof raw.totalSets === "number" ? raw.totalSets : 0,
    completedExercises:
      typeof raw.completedExercises === "number" ? raw.completedExercises : 0,
    totalExercises:
      typeof raw.totalExercises === "number" ? raw.totalExercises : 0,
    reactionsCount:
      typeof raw.reactionsCount === "number" && raw.reactionsCount >= 0
        ? raw.reactionsCount
        : 0,
    viewerHasReacted: !!raw.viewerHasReacted,
    comments: safeArray<any>(raw.comments)
      .map(sanitizeComment)
      .filter((comment): comment is CommunityFeedComment => !!comment)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  };
}

export async function getCommunityFeedPosts(): Promise<CommunityFeedPost[]> {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_FEED_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return safeArray<any>(parsed)
      .map(sanitizePost)
      .filter((post): post is CommunityFeedPost => !!post)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );
  } catch {
    return [];
  }
}

export async function saveCommunityFeedPosts(
  posts: CommunityFeedPost[],
): Promise<void> {
  const normalized = posts
    .map(sanitizePost)
    .filter((post): post is CommunityFeedPost => !!post)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

  await AsyncStorage.setItem(
    COMMUNITY_FEED_STORAGE_KEY,
    JSON.stringify(normalized),
  );
}

export async function hasCommunityPostForSession(
  sessionId?: string | null,
): Promise<boolean> {
  if (!sessionId) return false;
  const posts = await getCommunityFeedPosts();
  return posts.some((post) => post.sessionId === sessionId);
}

export async function appendWorkoutSharePost(
  summary: FinishSummary,
  athleteName = "You",
  options?: {
    userStatus?: string;
    imageUrl?: string;
    workoutSupabaseId?: string;
    workoutOwnerType?: "program_workout" | "individual_workout";
  },
): Promise<CommunityFeedPost[]> {
  const sessionId =
    typeof summary.sessionId === "string" && summary.sessionId.trim().length > 0
      ? summary.sessionId
      : `session-${Date.now()}`;

  const posts = await getCommunityFeedPosts();
  const existingPost = posts.find((post) => post.sessionId === sessionId);
  const nextPost: CommunityFeedPost = {
    id: `community-${sessionId}`,
    type: "workout_share",
    sessionId,
    athleteName,
    userStatus:
      typeof options?.userStatus === "string" && options.userStatus.trim().length > 0
        ? options.userStatus.trim()
        : existingPost?.userStatus,
    imageUrl:
      typeof options?.imageUrl === "string" && options.imageUrl.trim().length > 0
        ? options.imageUrl
        : existingPost?.imageUrl,
    workoutId: summary.workoutId,
    workoutSupabaseId: options?.workoutSupabaseId ?? existingPost?.workoutSupabaseId,
    workoutOwnerType:
      options?.workoutOwnerType ??
      (summary.programId ? "program_workout" : "individual_workout"),
    workoutTitle: summary.workoutTitle || "Workout",
    programId: summary.programId,
    completedAt: summary.completedAt || new Date().toISOString(),
    durationSec: summary.durationSec,
    completionRate: summary.insights.completionRate,
    status: summary.status === "partial" ? "partial" : "completed",
    completedSets: summary.totals.completedSets,
    totalSets: summary.totals.totalSets,
    completedExercises: summary.totals.completedExercises,
    totalExercises: summary.totals.totalExercises,
    reactionsCount: existingPost?.reactionsCount ?? 0,
    viewerHasReacted: existingPost?.viewerHasReacted ?? false,
    comments: existingPost?.comments ?? [],
  };

  const deduped = posts.filter((post) => post.sessionId !== sessionId);
  const next = [nextPost, ...deduped];
  await saveCommunityFeedPosts(next);
  return next;
}

export async function toggleCommunityPostReaction(
  postId: string,
): Promise<CommunityFeedPost[]> {
  const posts = await getCommunityFeedPosts();

  const next = posts.map((post) => {
    if (post.id !== postId) return post;

    const viewerHasReacted = !post.viewerHasReacted;

    return {
      ...post,
      viewerHasReacted,
      reactionsCount: Math.max(
        0,
        post.reactionsCount + (viewerHasReacted ? 1 : -1),
      ),
    };
  });

  await saveCommunityFeedPosts(next);
  return next;
}

export async function addCommunityPostComment(
  postId: string,
  body: string,
  authorName = "You",
): Promise<CommunityFeedPost[]> {
  const trimmed = body.trim();
  if (!trimmed) return getCommunityFeedPosts();

  const posts = await getCommunityFeedPosts();

  const next = posts.map((post) => {
    if (post.id !== postId) return post;

    const comment: CommunityFeedComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };

    return {
      ...post,
      comments: [...post.comments, comment],
    };
  });

  await saveCommunityFeedPosts(next);
  return next;
}
