import BarbataContentLoading from "@/components/BarbataContentLoading";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  addCommunityPostComment,
  getCommunityFeedPosts,
  toggleCommunityPostReaction,
  type CommunityFeedComment,
  type CommunityFeedPost,
} from "@/features/community/communityFeed";
import {
  getLatestIndividualWorkouts,
  type IndividualWorkout,
} from "@/features/workouts/individualWorkouts.supabase";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Ellipsis, Heart, MessageCircle, Share2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeedTabKey = "community" | "personal";
type FilterKey = "following" | "latest" | "nearby";

type WorkoutShareFeedItem = {
  id: string;
  athlete: string;
  accent: string;
  workoutTitle: string;
  statusText: string;
  postedLabel: string;
  postedAt: string;
  completionPct: number;
  durationMin: number;
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  status: "partial" | "completed";
  filter: FilterKey;
  isOwnPost: boolean;
  imageUrl?: string;
  routeWorkoutId?: string;
  routeProgramId?: string;
  routeSupabaseWorkoutId?: string;
  routeWorkoutOwnerType?: "program_workout" | "individual_workout";
  reactionsCount: number;
  viewerHasReacted: boolean;
  comments: CommunityFeedComment[];
};

const FEED_TABS: { key: FeedTabKey; label: string }[] = [
  { key: "community", label: "Community" },
  { key: "personal", label: "Personal" },
];

const SAMPLE_ATHLETES = [
  { name: "Alex", accent: "#DAC79B", filter: "following" as const },
  { name: "Maya", accent: "#7ED6A5", filter: "latest" as const },
  { name: "Chris", accent: "#8FB8FF", filter: "following" as const },
  { name: "Sofia", accent: "#F7A8B8", filter: "nearby" as const },
];

const SAMPLE_STATUSES = [
  "Feeling strong today",
  "Locked in and focused",
  "Good sweat, better mood",
  "Proud I showed up",
];

const SAMPLE_COMMENTS = [
  "Needed this one today.",
  "Saving this workout for tomorrow.",
  "That looked strong.",
  "Adding this to my week.",
];

function formatPostedLabel(iso: string) {
  const postedAt = new Date(iso);
  const now = new Date();
  const minutesAgo = Math.max(
    0,
    Math.round((now.getTime() - postedAt.getTime()) / 60_000),
  );

  if (minutesAgo < 1) return "Posted just now";
  if (minutesAgo < 60) return `Posted ${minutesAgo} min ago`;

  const hoursAgo = Math.round(minutesAgo / 60);
  if (hoursAgo < 24) return `Posted ${hoursAgo}h ago`;

  const daysAgo = Math.round(hoursAgo / 24);
  if (daysAgo === 1) return "Posted yesterday";
  if (daysAgo < 7) return `Posted ${daysAgo} days ago`;

  const date = postedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `Posted ${date}`;
}

function getDefaultStatusText(completionPct: number) {
  if (completionPct >= 100) return "Feeling accomplished";
  if (completionPct >= 90) return "Pushed through strong";
  if (completionPct >= 75) return "Solid work today";
  return "Showed up and got it done";
}

function formatCommentTime(iso: string) {
  const createdAt = new Date(iso);
  return createdAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildSampleFeed(workouts: IndividualWorkout[]) {
  return workouts.slice(0, 4).map((workout, index): WorkoutShareFeedItem => {
    const athlete = SAMPLE_ATHLETES[index % SAMPLE_ATHLETES.length];
    const completionPct = [100, 92, 100, 78][index % 4];
    const totalSets = [16, 14, 12, 10][index % 4];
    const completedSets = Math.max(1, Math.round((completionPct / 100) * totalSets));
    const totalExercises = [5, 6, 4, 5][index % 4];
    const completedExercises = Math.min(
      totalExercises,
      Math.max(1, Math.round((completionPct / 100) * totalExercises)),
    );

    const finishedAt = new Date(
      Date.now() - index * 5 * 60 * 60 * 1000,
    ).toISOString();

    return {
      id: `sample-${workout.id}`,
      athlete: athlete.name,
      accent: athlete.accent,
      workoutTitle: workout.title,
      statusText: SAMPLE_STATUSES[index % SAMPLE_STATUSES.length],
      postedLabel: formatPostedLabel(finishedAt),
      postedAt: finishedAt,
      completionPct,
      durationMin: workout.durationMin,
      completedSets,
      totalSets,
      completedExercises,
      totalExercises,
      status: completionPct >= 100 ? "completed" : "partial",
      filter: athlete.filter,
      isOwnPost: false,
      imageUrl: workout.imageUrl || undefined,
      routeWorkoutId: workout.slug || workout.id,
      routeSupabaseWorkoutId: workout.id,
      routeWorkoutOwnerType: "individual_workout",
      reactionsCount: 18 - index * 3,
      viewerHasReacted: index === 0,
      comments: [
        {
          id: `sample-comment-${workout.id}`,
          authorName: SAMPLE_ATHLETES[(index + 1) % SAMPLE_ATHLETES.length].name,
          body: SAMPLE_COMMENTS[index % SAMPLE_COMMENTS.length],
          createdAt: finishedAt,
        },
      ],
    };
  });
}

function mapCommunityPost(post: CommunityFeedPost): WorkoutShareFeedItem {
  return {
    id: post.id,
    athlete: post.athleteName,
    accent: "#DAC79B",
    workoutTitle: post.workoutTitle,
    statusText:
      typeof post.userStatus === "string" && post.userStatus.trim().length > 0
        ? post.userStatus
        : getDefaultStatusText(Math.round(post.completionRate * 100)),
    postedLabel: formatPostedLabel(post.completedAt),
    postedAt: post.completedAt,
    completionPct: Math.round(post.completionRate * 100),
    durationMin: Math.max(1, Math.round(post.durationSec / 60)),
    completedSets: post.completedSets,
    totalSets: post.totalSets,
    completedExercises: post.completedExercises,
    totalExercises: post.totalExercises,
    status: post.status,
    filter: "following",
    isOwnPost: post.athleteName === "You",
    imageUrl: post.imageUrl,
    routeWorkoutId: post.workoutId,
    routeProgramId: post.programId,
    routeSupabaseWorkoutId: post.workoutSupabaseId,
    routeWorkoutOwnerType: post.workoutOwnerType,
    reactionsCount: post.reactionsCount,
    viewerHasReacted: post.viewerHasReacted,
    comments: post.comments,
  };
}

function FeedTabs({
  active,
  onChange,
  colors,
}: {
  active: FeedTabKey;
  onChange: (value: FeedTabKey) => void;
  colors: {
    text: string;
    muted: string;
    card: string;
    surface: string;
    border: string;
    borderSubtle: string;
  };
}) {
  const border = colors.borderSubtle ?? colors.border;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={pillStyles.rail}
      style={pillStyles.scroll}
    >
      {FEED_TABS.map((tab) => {
        const selected = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              pillStyles.pill,
              {
                backgroundColor: selected ? colors.text : colors.card,
                borderColor: selected ? colors.text : border,
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text
              style={[
                pillStyles.pillText,
                {
                  color: selected ? colors.surface : colors.muted,
                  fontWeight: selected ? "800" : "700",
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function FeedCard({
  item,
  colors,
  isDark,
  onToggleReaction,
  onAddComment,
  onShare,
}: {
  item: WorkoutShareFeedItem;
  colors: {
    text: string;
    muted: string;
    card: string;
    border: string;
    borderSubtle: string;
    surface: string;
    fillAlt: string;
  };
  isDark: boolean;
  onToggleReaction: (postId: string) => void;
  onAddComment: (postId: string, body: string) => Promise<void> | void;
  onShare: (item: WorkoutShareFeedItem) => Promise<void> | void;
}) {
  const hasImage =
    typeof item.imageUrl === "string" && item.imageUrl.trim().length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const canOpenWorkout =
    typeof item.routeWorkoutId === "string" && item.routeWorkoutId.length > 0;

  const openWorkout = () => {
    if (!canOpenWorkout || !item.routeWorkoutId) return;

    router.push({
      pathname: "/workout",
      params: {
        workoutId: item.routeWorkoutId,
        ...(item.routeProgramId ? { programId: item.routeProgramId } : {}),
        ...(item.routeSupabaseWorkoutId
          ? { supabaseWorkoutId: item.routeSupabaseWorkoutId }
          : {}),
        ...(item.routeWorkoutOwnerType
          ? { supabaseWorkoutOwnerType: item.routeWorkoutOwnerType }
          : {}),
        source: "community",
      },
    });
  };

  const submitComment = async () => {
    const trimmed = commentDraft.trim();
    if (!trimmed || submittingComment) return;

    setSubmittingComment(true);

    try {
      await onAddComment(item.id, trimmed);
      setCommentDraft("");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <>
      <View
        style={{
          borderRadius: 26,
          overflow: "hidden",
          backgroundColor: colors.card,
          borderWidth: BorderWidth.default,
          borderColor: colors.borderSubtle,
        }}
      >
        <View style={{ height: 320, backgroundColor: colors.fillAlt }}>
          {hasImage ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#202124", "#111111"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.16)", "rgba(0,0,0,0.68)"]}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <View
              style={{
                minHeight: 30,
                paddingHorizontal: 12,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.92)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: "#111111",
                  letterSpacing: -0.08,
                }}
              >
                {item.completionPct}% complete
              </Text>
            </View>

            <View
              style={{
                minHeight: 30,
                paddingHorizontal: 12,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(17,17,17,0.44)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.16)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  letterSpacing: -0.08,
                }}
              >
                {item.durationMin} min
              </Text>
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              top: 14,
              right: 14,
            }}
          >
            <Pressable
              onPress={() => setMenuOpen(true)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(17,17,17,0.44)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.16)",
              }}
            >
              <Ellipsis size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: item.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "900",
                      color: "#111111",
                    }}
                  >
                    {item.athlete.slice(0, 1)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "rgba(255,255,255,0.92)",
                      letterSpacing: -0.08,
                    }}
                  >
                    {item.athlete}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.86)",
                      letterSpacing: -0.05,
                    }}
                  >
                    {item.statusText}
                  </Text>
                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.68)",
                      letterSpacing: -0.04,
                    }}
                  >
                    {item.postedLabel}
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={!canOpenWorkout}
                onPress={openWorkout}
                hitSlop={6}
                style={({ pressed }) =>
                  pressed && canOpenWorkout ? { opacity: 0.8 } : undefined
                }
              >
                <Text
                  style={{
                    fontSize: 22,
                    lineHeight: 26,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: -0.28,
                  }}
                >
                  {item.workoutTitle}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                flex: 1,
                minHeight: 74,
                borderRadius: 16,
                padding: 12,
                backgroundColor: colors.fillAlt,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: colors.text,
                  letterSpacing: -0.2,
                }}
              >
                {item.completedSets}/{item.totalSets}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                sets logged
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minHeight: 74,
                borderRadius: 16,
                padding: 12,
                backgroundColor: colors.fillAlt,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: colors.text,
                  letterSpacing: -0.2,
                }}
              >
                {item.completedExercises}/{item.totalExercises}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                exercises
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: colors.muted,
                letterSpacing: -0.04,
              }}
            >
              {item.reactionsCount} gave props
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: colors.muted,
                letterSpacing: -0.04,
              }}
            >
              {item.comments.length} comments
            </Text>
          </View>

          <View
            style={{
              marginTop: 12,
              height: BorderWidth.default,
              backgroundColor: colors.borderSubtle,
            }}
          />

          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Pressable
              onPress={() => onToggleReaction(item.id)}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              <Heart
                size={16}
                color={item.viewerHasReacted ? colors.text : colors.muted}
                fill={item.viewerHasReacted ? colors.text : "transparent"}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: item.viewerHasReacted ? colors.text : colors.muted,
                  letterSpacing: -0.05,
                }}
              >
                Like
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCommentsOpen(true)}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              <MessageCircle size={16} color={colors.muted} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: colors.muted,
                  letterSpacing: -0.05,
                }}
              >
                Comment
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void onShare(item)}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              <Share2 size={16} color={colors.muted} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: colors.muted,
                  letterSpacing: -0.05,
                }}
              >
                Share
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.34)",
            justifyContent: "flex-end",
          }}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 18,
              borderTopWidth: BorderWidth.default,
              borderTopColor: colors.borderSubtle,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: colors.text,
                  letterSpacing: -0.2,
                }}
              >
                Post options
              </Text>

              <Pressable
                onPress={() => setMenuOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.fillAlt,
                }}
              >
                <X size={16} color={colors.text} />
              </Pressable>
            </View>

            {[
              "Report as spam",
              "Report as inappropriate",
              "Block user",
            ].map((label, index, items) => (
              <Pressable
                key={label}
                onPress={() => setMenuOpen(false)}
                style={{
                  minHeight: 56,
                  justifyContent: "center",
                  borderBottomWidth:
                    index !== items.length - 1 ? BorderWidth.default : 0,
                  borderBottomColor: colors.borderSubtle,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: colors.text,
                    letterSpacing: -0.12,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={commentsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentsOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.34)",
            justifyContent: "flex-end",
          }}
          onPress={() => setCommentsOpen(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              maxHeight: "80%",
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 18,
              borderTopWidth: BorderWidth.default,
              borderTopColor: colors.borderSubtle,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: colors.text,
                    letterSpacing: -0.2,
                  }}
                >
                  Comments
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.muted,
                  }}
                >
                  {item.comments.length > 0
                    ? `${item.comments.length} replies on this post`
                    : "Start the conversation"}
                </Text>
              </View>

              <Pressable
                onPress={() => setCommentsOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.fillAlt,
                }}
              >
                <X size={16} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 280 }}
              contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              {item.comments.length > 0 ? (
                item.comments.map((comment) => (
                  <View
                    key={comment.id}
                    style={{
                      borderRadius: 18,
                      padding: 12,
                      backgroundColor: colors.fillAlt,
                      borderWidth: BorderWidth.default,
                      borderColor: colors.borderSubtle,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "900",
                          color: colors.text,
                        }}
                      >
                        {comment.authorName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: colors.muted,
                        }}
                      >
                        {formatCommentTime(comment.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 14,
                        lineHeight: 20,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                    >
                      {comment.body}
                    </Text>
                  </View>
                ))
              ) : (
                <View
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    backgroundColor: colors.fillAlt,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "600",
                      color: colors.muted,
                    }}
                  >
                    Be the first to comment on this workout share.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 10,
              }}
            >
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Add a comment"
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                style={{
                  flex: 1,
                  minHeight: 52,
                  maxHeight: 96,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 18,
                  backgroundColor: colors.fillAlt,
                  borderWidth: BorderWidth.default,
                  borderColor: colors.borderSubtle,
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              />

              <Pressable
                onPress={submitComment}
                disabled={commentDraft.trim().length === 0 || submittingComment}
                style={{
                  minWidth: 84,
                  height: 48,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    commentDraft.trim().length === 0 || submittingComment
                      ? colors.fillAlt
                      : colors.text,
                  borderWidth: BorderWidth.default,
                  borderColor:
                    commentDraft.trim().length === 0 || submittingComment
                      ? colors.borderSubtle
                      : colors.text,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color:
                      commentDraft.trim().length === 0 || submittingComment
                        ? colors.muted
                        : colors.surface,
                  }}
                >
                  {submittingComment ? "Posting" : "Reply"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function PersonalSummaryCard({
  posts,
  colors,
}: {
  posts: WorkoutShareFeedItem[];
  colors: {
    text: string;
    muted: string;
    card: string;
    border: string;
    borderSubtle: string;
    surface: string;
    fillAlt: string;
  };
}) {
  const totalMinutes = posts.reduce((sum, post) => sum + post.durationMin, 0);
  const averageCompletion =
    posts.length > 0
      ? Math.round(
          posts.reduce((sum, post) => sum + post.completionPct, 0) / posts.length,
        )
      : 0;
  const totalReactions = posts.reduce((sum, post) => sum + post.reactionsCount, 0);

  return (
    <View
      style={{
        marginBottom: 14,
        borderRadius: 22,
        padding: 14,
        backgroundColor: colors.card,
        borderWidth: BorderWidth.default,
        borderColor: colors.borderSubtle,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.text,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: colors.surface,
            }}
          >
            Y
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: colors.text,
              letterSpacing: -0.25,
            }}
          >
            Your posts
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              lineHeight: 16,
              fontWeight: "700",
              color: colors.muted,
            }}
          >
            Finished-session history
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          gap: 8,
        }}
      >
        {[
          { label: "posts", value: String(posts.length) },
          { label: "mins", value: String(totalMinutes) },
          { label: "avg", value: `${averageCompletion}%` },
          { label: "likes", value: String(totalReactions) },
        ].map((stat) => (
          <View
            key={stat.label}
            style={{
              flex: 1,
              minHeight: 60,
              borderRadius: 14,
              paddingHorizontal: 10,
              paddingVertical: 9,
              backgroundColor: colors.fillAlt,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "900",
                color: colors.text,
                letterSpacing: -0.2,
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                marginTop: 3,
                fontSize: 10,
                fontWeight: "800",
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<FeedTabKey>("community");
  const [sharedPosts, setSharedPosts] = useState<CommunityFeedPost[]>([]);
  const [sampleFeed, setSampleFeed] = useState<WorkoutShareFeedItem[]>([]);
  const [sampleFeedLoaded, setSampleFeedLoaded] = useState(false);
  const [sharedPostsLoaded, setSharedPostsLoaded] = useState(false);
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    let mounted = true;

    const loadSampleFeed = async () => {
      try {
        const workouts = await getLatestIndividualWorkouts(4);
        if (mounted) {
          setSampleFeed(buildSampleFeed(workouts));
        }
      } catch {
        if (mounted) {
          setSampleFeed([]);
        }
      } finally {
        if (mounted) {
          setSampleFeedLoaded(true);
        }
      }
    };

    void loadSampleFeed();

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadFeed = async () => {
        try {
          const posts = await getCommunityFeedPosts();
          if (mounted) {
            setSharedPosts(posts);
          }
        } catch {
          if (mounted) {
            setSharedPosts([]);
          }
        } finally {
          if (mounted) {
            setSharedPostsLoaded(true);
          }
        }
      };

      void loadFeed();

      return () => {
        mounted = false;
      };
    }, []),
  );

  const handleToggleReaction = useCallback(
    async (postId: string) => {
      if (postId.startsWith("sample-")) {
        setSampleFeed((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  viewerHasReacted: !post.viewerHasReacted,
                  reactionsCount: Math.max(
                    0,
                    post.reactionsCount + (post.viewerHasReacted ? -1 : 1),
                  ),
                }
              : post,
          ),
        );
        return;
      }

      const next = await toggleCommunityPostReaction(postId);
      setSharedPosts(next);
    },
    [],
  );

  const handleAddComment = useCallback(
    async (postId: string, body: string) => {
      if (postId.startsWith("sample-")) {
        setSampleFeed((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    {
                      id: `sample-local-${postId}-${Date.now()}`,
                      authorName: "You",
                      body: body.trim(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : post,
          ),
        );
        return;
      }

      const next = await addCommunityPostComment(postId, body, "You");
      setSharedPosts(next);
    },
    [],
  );

  const handleSharePost = useCallback(async (item: WorkoutShareFeedItem) => {
    const statusLine =
      item.statusText.trim().length > 0 ? `Feeling: ${item.statusText}` : null;

    await Share.share({
      title: `${item.workoutTitle} on Barbata`,
      message: [
        `Just finished ${item.workoutTitle} on Barbata.`,
        `${item.completionPct}% complete • ${item.durationMin} min • ${item.completedSets}/${item.totalSets} sets`,
        statusLine,
        "Train with me on Barbata.",
      ]
        .filter(Boolean)
        .join("\n"),
      url: item.imageUrl,
    });
  }, []);

  const feedItems = useMemo(() => {
    const livePosts = sharedPosts.map(mapCommunityPost);
    const source =
      activeTab === "personal"
        ? livePosts.filter((post) => post.isOwnPost)
        : [...livePosts, ...sampleFeed];

    return source.sort((a, b) => {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [activeTab, sampleFeed, sharedPosts]);

  const personalPosts = useMemo(
    () => sharedPosts.map(mapCommunityPost).filter((post) => post.isOwnPost),
    [sharedPosts],
  );

  const isLoadingFeed =
    activeTab === "personal"
      ? !sharedPostsLoaded
      : !sharedPostsLoaded || !sampleFeedLoaded;

  if (isLoadingFeed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BarbataContentLoading
          title="Loading community"
          subtitle="Getting the latest shared sessions."
          variant="feed"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pad}>
          <ScreenHeader
            title="Community"
            subtitle="Train alongside others and share finished sessions"
          />
        </View>

        <FeedTabs
          active={activeTab}
          onChange={setActiveTab}
          colors={colors}
        />

        <View style={styles.feedWrap}>
          {activeTab === "personal" && personalPosts.length > 0 ? (
            <PersonalSummaryCard posts={personalPosts} colors={colors} />
          ) : null}

          {feedItems.length > 0 ? (
            feedItems.map((item, index) => (
              <View
                key={item.id}
                style={index !== feedItems.length - 1 ? { marginBottom: 18 } : undefined}
              >
                <FeedCard
                  item={item}
                  colors={colors}
                  isDark={isDark}
                  onToggleReaction={handleToggleReaction}
                  onAddComment={handleAddComment}
                  onShare={handleSharePost}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {activeTab === "personal" ? "No personal posts yet" : "No community posts yet"}
              </Text>
              <Text style={styles.emptyBody}>
                {activeTab === "personal"
                  ? "Your workout shares will show up here once you start posting them."
                  : "The community feed will fill with workout posts here."}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const pillStyles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  rail: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 14,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    minWidth: 78,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BorderWidth.default,
  },
  pillText: {
    fontSize: 13,
    letterSpacing: -0.05,
  },
});

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
    fillAlt: string;
  },
  isDark: boolean,
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: Spacing.xl,
    },
    pad: {
      paddingHorizontal: Spacing.md,
    },
    feedWrap: {
      paddingHorizontal: Spacing.md,
      paddingTop: 2,
    },
    emptyCard: {
      borderRadius: 24,
      padding: 18,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },
    emptyBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.muted,
    },
    bottomSpacer: {
      height: 40,
    },
  });
}
