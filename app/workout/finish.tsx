// app/workout/finish.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Share2 } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import ViewShot from "react-native-view-shot";

import BarbataContentLoading from "@/components/BarbataContentLoading";
import { useAppTheme } from "@/providers/theme";
import {
  appendWorkoutSharePost,
  hasCommunityPostForSession,
} from "@/features/community/communityFeed";
import { BorderWidth } from "@/styles/hairline";
import { getFinishFeedback, type FinishSummary } from "../../features/workout/finishFeedback";
import { formatSecondsToClock, type TrackingMode } from "../../features/workout/workout.types";

const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";
const SHARE_PREVIEW_WIDTH = 243;
const SHARE_PREVIEW_HEIGHT = 432;
const SHARE_STATUS_SUGGESTIONS = [
  "Feeling strong today",
  "That one hit hard",
  "Proud I showed up",
  "Locked in and focused",
];

const SHARE_TARGETS = [
  {
    key: "instagram_story",
    label: "Instagram",
    subLabel: "Story",
    circleStyle: "instagram",
    iconSet: "ant",
    iconName: "instagram",
    darkText: false,
  },
  {
    key: "instagram_messages",
    label: "Instagram",
    subLabel: "Messages",
    circleStyle: "instagram",
    iconSet: "ant",
    iconName: "instagram",
    darkText: false,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    subLabel: "",
    circleStyle: "snapchat",
    iconSet: "mci",
    iconName: "ghost",
    darkText: true,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    subLabel: "",
    circleStyle: "whatsapp",
    iconSet: "mci",
    iconName: "whatsapp",
    darkText: false,
  },
  {
    key: "messages",
    label: "Messages",
    subLabel: "",
    circleStyle: "messages",
    iconSet: "ion",
    iconName: "chatbubble-outline",
    darkText: true,
  },
] as const;

type ShareTargetKey = (typeof SHARE_TARGETS)[number]["key"];
type ShareTemplateCard = {
  id: string;
  layout: "corner" | "stacked" | "hero" | "challenge";
  kicker: string;
  headline: string;
  subhead?: string;
  metaLine?: string;
  workoutLine: string;
  metrics: { label: string; value: string }[];
};

function getShareTemplateGlow(
  layout: ShareTemplateCard["layout"],
) {
  switch (layout) {
    case "corner":
      return ["rgba(239,177,74,0.24)", "rgba(201,94,43,0.14)", "rgba(0,0,0,0.12)"];
    case "stacked":
      return ["rgba(239,177,74,0.18)", "rgba(255,255,255,0.04)", "rgba(0,0,0,0.10)"];
    case "hero":
      return ["rgba(239,177,74,0.20)", "rgba(154,93,255,0.12)", "rgba(0,0,0,0.10)"];
    case "challenge":
      return ["rgba(255,124,92,0.20)", "rgba(239,177,74,0.12)", "rgba(0,0,0,0.08)"];
  }
}

function getShareTemplateBottomTint(
  layout: ShareTemplateCard["layout"],
) {
  switch (layout) {
    case "corner":
      return ["rgba(0,0,0,0.00)", "rgba(92,52,18,0.16)", "rgba(14,14,14,0.84)"];
    case "stacked":
      return ["rgba(0,0,0,0.00)", "rgba(82,58,26,0.14)", "rgba(10,10,10,0.80)"];
    case "hero":
      return ["rgba(0,0,0,0.00)", "rgba(92,49,138,0.16)", "rgba(8,8,8,0.82)"];
    case "challenge":
      return ["rgba(0,0,0,0.00)", "rgba(115,54,25,0.15)", "rgba(10,10,10,0.82)"];
  }
}

function ShareWordmark({ color }: { color: string }) {
  return <Text style={[stylesShared.wordmark, { color }]}>BARBATA</Text>;
}

type SetComparison = {
  previous?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  deltaVsPrevious?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  best?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  deltaVsBest?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  state: "no_data" | "same" | "better" | "mixed" | "pr";
  isWeightPR: boolean;
  isRepPR: boolean;
  isVolumePR: boolean;
};

type RichFinishSummary = FinishSummary & {
  exercises: (
    FinishSummary["exercises"][number] & {
      trackingMode?: TrackingMode;
      sets: (
        FinishSummary["exercises"][number]["sets"][number] & {
          comparison?: SetComparison;
        }
      )[];
    }
  )[];
};

function PRBadge({
  color,
  backgroundColor,
  borderColor,
}: {
  color: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View
      style={[
        stylesShared.prBadgeWrap,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Svg width={10} height={10} viewBox="0 0 18 18">
        <Path
          d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z"
          fill={color}
        />
      </Svg>
      <Text style={[stylesShared.prBadgeText, { color }]}>PR</Text>
    </View>
  );
}

const stylesShared = StyleSheet.create({
  prBadgeWrap: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  prBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  wordmark: {
    fontSize: 11,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    textAlign: "center",
    color: "#FFFFFF",
  },
});

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) return null;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function formatSigned(value?: number | null, suffix = "") {
  if (value == null || Number.isNaN(value) || value === 0) return null;
  const abs = Number.isInteger(value)
    ? String(Math.abs(value))
    : Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : "-"}${abs}${suffix}`;
}

function getTrackingMode(ex: RichFinishSummary["exercises"][number]): TrackingMode {
  return ex.trackingMode ?? "weight_reps";
}

function getHeadersForMode(mode: TrackingMode) {
  if (mode === "time") return ["SET", "TIME", "REST", "STATUS"] as const;
  if (mode === "reps_only") return ["SET", "REPS", "REST", "STATUS"] as const;
  if (mode === "calories") return ["SET", "CAL", "REST", "STATUS"] as const;
  if (mode === "bodyweight_reps") return ["SET", "LOAD", "REPS", "VS LAST"] as const;
  return ["SET", "WEIGHT", "REPS", "VS LAST"] as const;
}

function getPrimaryValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time") return formatSecondsToClock(set.weight) || "—";
  if (mode === "reps_only") return set.reps || "—";
  if (mode === "calories") return set.weight ? `${set.weight} cal` : "—";
  if (mode === "bodyweight_reps") return set.weight || "BW";
  return set.weight || "—";
}

function getSecondValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time") return set.rest || "—";
  if (mode === "reps_only") return set.rest || "—";
  if (mode === "calories") return set.rest || "—";
  return set.reps || "—";
}

function getRichSetDelta(
  comparison?: SetComparison,
): {
  label: string | null;
  positive: boolean;
  pr: boolean;
} {
  if (!comparison) return { label: null, positive: false, pr: false };

  if (comparison.isWeightPR && comparison.deltaVsBest?.weight) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.weight)} kg`,
      positive: true,
      pr: true,
    };
  }

  if (comparison.isRepPR && comparison.deltaVsBest?.reps) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.reps)} reps`,
      positive: true,
      pr: true,
    };
  }

  if (comparison.isVolumePR && comparison.deltaVsBest?.volume) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.volume)} vol`,
      positive: true,
      pr: true,
    };
  }

  const weightText = formatSigned(comparison.deltaVsPrevious?.weight, " kg");
  const repsText = formatSigned(comparison.deltaVsPrevious?.reps, " reps");
  const volumeText = formatSigned(comparison.deltaVsPrevious?.volume, " vol");

  if (weightText) {
    return { label: weightText, positive: weightText.startsWith("+"), pr: false };
  }
  if (repsText) {
    return { label: repsText, positive: repsText.startsWith("+"), pr: false };
  }
  if (volumeText) {
    return { label: volumeText, positive: volumeText.startsWith("+"), pr: false };
  }
  if (comparison.state === "same") {
    return { label: "—", positive: false, pr: false };
  }

  return { label: null, positive: false, pr: false };
}

function getFourthValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time" || mode === "reps_only" || mode === "calories") {
    return set.done ? "✓" : "";
  }

  return getRichSetDelta(set.comparison).label ?? "";
}

function getExerciseStatus(completedSets: number, totalSets: number) {
  const isCompleted = completedSets === totalSets;
  const isPartial = completedSets > 0 && completedSets < totalSets;

  if (isCompleted) return "Completed";
  if (isPartial) return "Partial";
  return "Skipped";
}

function formatCompletionMeta(completedAt?: string) {
  if (!completedAt) return null;

  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const dayDiff = Math.max(
    0,
    Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) /
        86400000,
    ),
  );

  const dayLabel =
    dayDiff === 0 ? "Today" : dayDiff === 1 ? "1 day ago" : `${dayDiff} days ago`;

  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${dayLabel} · ${timeLabel}`;
}

export default function FinishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionStatus?: string | string[];
    workoutImage?: string | string[];
    supabaseWorkoutId?: string | string[];
    supabaseWorkoutOwnerType?: string | string[];
  }>();
  const { colors, isDark } = useAppTheme();

  const sessionStatusParam = Array.isArray(params.sessionStatus)
    ? params.sessionStatus[0]
    : params.sessionStatus;
  const workoutImageParam = Array.isArray(params.workoutImage)
    ? params.workoutImage[0]
    : params.workoutImage;
  const supabaseWorkoutIdParam = Array.isArray(params.supabaseWorkoutId)
    ? params.supabaseWorkoutId[0]
    : params.supabaseWorkoutId;
  const supabaseWorkoutOwnerTypeParam = Array.isArray(
    params.supabaseWorkoutOwnerType,
  )
    ? params.supabaseWorkoutOwnerType[0]
    : params.supabaseWorkoutOwnerType;

  const [summary, setSummary] = useState<RichFinishSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [communityPosted, setCommunityPosted] = useState(false);
  const [shareComposerOpen, setShareComposerOpen] = useState(false);
  const [postingToCommunity, setPostingToCommunity] = useState(false);
  const [sharingToSocial, setSharingToSocial] = useState(false);
  const [communityJustPosted, setCommunityJustPosted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [shareImageUri, setShareImageUri] = useState<string | null>(
    workoutImageParam || null,
  );
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareTemplateIndex, setShareTemplateIndex] = useState(0);
  const { width: viewportWidth } = useWindowDimensions();
  const shareCarouselRef = useRef<ScrollView | null>(null);
  const shareCardRefs = useRef<(ViewShot | null)[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        const raw = await AsyncStorage.getItem(FINISH_SUMMARY_STORAGE_KEY);

        if (!mounted) return;

        if (!raw) {
          setSummary(null);
          setLoading(false);
          return;
        }

        try {
          const parsed = JSON.parse(raw) as RichFinishSummary;
          setSummary(parsed);
        } catch {
          setSummary(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkPostState = async () => {
      if (!summary?.sessionId) {
        if (mounted) setCommunityPosted(false);
        return;
      }

      const exists = await hasCommunityPostForSession(summary.sessionId);

      if (mounted) {
        setCommunityPosted(exists);
        if (!exists) {
          setCommunityJustPosted(false);
        }
      }
    };

    void checkPostState();

    return () => {
      mounted = false;
    };
  }, [summary]);

  const feedback = useMemo(() => {
    if (!summary) return null;
    return getFinishFeedback(summary);
  }, [summary]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const completionPct = Math.round((summary?.insights.completionRate ?? 0) * 100);
  const completionMeta = formatCompletionMeta(summary?.completedAt);
  const isSubmittingShare = postingToCommunity || sharingToSocial;
  const durationMin = Math.max(1, Math.round((summary?.durationSec ?? 0) / 60));
  const isPartialSession =
    sessionStatusParam === "partial" || summary?.status === "partial";
  const prCount = summary?.prs.length ?? 0;
  const isFirstLoggedSession = !summary?.insights.previousSessionFound;
  const celebrationAccent = useMemo(() => {
    if (isFirstLoggedSession) {
      return {
        icon: "sparkles-outline" as const,
        label: completionPct >= 95 ? "First full session" : "First step taken",
        bg: colors.premiumSoft,
        border: colors.premiumBorder,
        text: colors.premiumText,
      };
    }

    if (prCount > 0) {
      return {
        icon: "trophy-outline" as const,
        label: "Breakthrough",
        bg: colors.premiumSoft,
        border: colors.premiumBorder,
        text: colors.premiumText,
      };
    }

    if (isPartialSession) {
      return {
        icon: "flame-outline" as const,
        label: "Habit protected",
        bg: colors.warningSoft,
        border: colors.warningBorder,
        text: colors.warningText,
      };
    }

    return {
      icon: "checkmark-circle-outline" as const,
      label: "Session complete",
      bg: colors.successSoft,
      border: colors.successBorder,
      text: colors.successText,
    };
  }, [colors, completionPct, isFirstLoggedSession, isPartialSession, prCount]);
  const accomplishmentHighlights = useMemo(() => {
    if (!summary) return [];
    const items: string[] = [];

    if (prCount > 0) {
      items.push(`${prCount} ${prCount === 1 ? "PR" : "PRs"} unlocked`);
    }
    if (summary.insights.improvedExerciseCount > 0) {
      items.push(
        `${summary.insights.improvedExerciseCount} ${
          summary.insights.improvedExerciseCount === 1 ? "exercise" : "exercises"
        } improved`,
      );
    }
    if (isFirstLoggedSession) {
      items.push("Starting point created");
    } else if (completionPct === 100) {
      items.push("Full session done");
    }

    return items.slice(0, 3);
  }, [completionPct, isFirstLoggedSession, prCount, summary]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <BarbataContentLoading
          title="Loading summary"
          subtitle="Putting your session highlights together."
          variant="detail"
        />
      </SafeAreaView>
    );
  }

  if (!summary || !feedback) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No workout summary found</Text>
          <Text style={styles.emptyBody}>
            This session summary could not be loaded.
          </Text>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  const shareButtonLabel =
    prCount > 0
      ? `Share ${prCount === 1 ? "your PR" : `${prCount} PRs`}`
      : isPartialSession
        ? "Share your progress"
        : "Share your win";
  const shareButtonSubLabel = communityPosted
    ? "Open the share sheet again"
    : "Post it to community or social";
  const shareTemplateCards: ShareTemplateCard[] = (() => {
    const workoutLine = summary.workoutTitle.trim();
    const primaryPrName =
      prCount > 0 ? summary.prs[0]?.exerciseName ?? "Strong session" : "Workout complete";
    const primaryPrWeight = prCount > 0 ? summary.prs[0]?.weight?.trim() ?? "" : "";
    const socialMood =
      shareStatus.trim() || (isPartialSession ? "Still showed up" : "Felt strong today");
    const setsLine = `${summary.totals.completedSets}/${summary.totals.totalSets}`;
    const cards: ShareTemplateCard[] = [
      {
        id: "corner",
        layout: "corner",
        kicker: "Workout Session",
        headline: workoutLine,
        subhead: socialMood,
        workoutLine,
        metrics: [
          { label: "Complete", value: `${completionPct}%` },
          { label: "Time", value: `${durationMin}m` },
          { label: "Sets", value: setsLine },
        ],
      },
      {
        id: "stacked",
        layout: "stacked",
        kicker: "",
        headline: "",
        workoutLine,
        metrics: [
          { label: "Complete", value: `${completionPct}%` },
          { label: "Time", value: `${durationMin}m` },
          ...(prCount > 0 ? [{ label: "PRs", value: String(prCount) }] : []),
        ],
      },
    ];

    if (prCount > 0) {
      cards.push({
        id: "hero",
        layout: "hero",
        kicker: "New Personal Best",
        headline: `${prCount} ${prCount === 1 ? "PR" : "PRs"}`,
        subhead: `PR on ${primaryPrName}${primaryPrWeight ? ` · ${primaryPrWeight}` : ""}`,
        workoutLine,
        metaLine: "Train with me on Barbata app",
        metrics: [
          { label: "Time", value: `${durationMin}m` },
          { label: "Sets", value: setsLine },
        ],
      });
    }

    cards.push({
      id: "challenge",
      layout: "challenge",
      kicker: "Today's Work",
      headline: workoutLine,
      subhead: shareStatus.trim() || "You in?",
      metaLine: `${durationMin} min · ${setsLine} sets`,
      workoutLine,
      metrics: [
        { label: "Time", value: `${durationMin}m` },
        { label: "Sets", value: setsLine },
      ],
    });

    return cards;
  })();
  const shareCarouselPageWidth = viewportWidth;
  const activeShareTemplateIndex = Math.max(
    0,
    Math.min(shareTemplateCards.length - 1, shareTemplateIndex),
  );

  const postToCommunity = async () => {
    if (communityPosted) return;
    setShareError(null);
    setPostingToCommunity(true);

    try {
      await appendWorkoutSharePost(summary, "You", {
        userStatus: shareStatus,
        imageUrl: shareImageUri ?? workoutImageParam,
        workoutSupabaseId: supabaseWorkoutIdParam,
        workoutOwnerType:
          supabaseWorkoutOwnerTypeParam === "program_workout" ||
          supabaseWorkoutOwnerTypeParam === "individual_workout"
            ? supabaseWorkoutOwnerTypeParam
            : undefined,
      });
      setCommunityPosted(true);
      setCommunityJustPosted(true);
    } finally {
      setPostingToCommunity(false);
    }
  };

  const openCommunityFeed = () => {
    setShareComposerOpen(false);
    router.push("/(tabs)/community");
  };

  const buildSocialShareMessage = () => {
    const statusLine = shareStatus.trim().length > 0 ? `Feeling: ${shareStatus.trim()}` : null;
    const completionLine = `${completionPct}% complete • ${durationMin} min • ${summary.totals.completedSets}/${summary.totals.totalSets} sets`;
    const resultLine = isPartialSession ? "Partial session completed" : "Workout completed";

    return [
      `Just finished ${summary.workoutTitle} on Barbata.`,
      resultLine,
      completionLine,
      statusLine,
      "Train with me on Barbata.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const captureCurrentShareCard = async () => {
    const activeCard = shareCardRefs.current[activeShareTemplateIndex];
    if (!activeCard?.capture) {
      return shareImageUri ?? undefined;
    }

    try {
      return await activeCard.capture?.();
    } catch {
      return shareImageUri ?? undefined;
    }
  };

  const openExternalTarget = async (
    url: string,
    fallback?: () => Promise<void>,
  ) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {}

    if (fallback) {
      await fallback();
    }

    return false;
  };

  const shareToSystemSheet = async () => {
    setShareError(null);
    setSharingToSocial(true);

    try {
      const shareAssetUri = await captureCurrentShareCard();
      const payload: { title: string; message: string; url?: string } = {
        title: `Workout shared from Barbata`,
        message: buildSocialShareMessage(),
      };

      if (shareAssetUri && Platform.OS !== "web") {
        payload.url = shareAssetUri;
      }

      await Share.share(payload);
    } catch {
      setShareError("That social share could not be completed.");
    } finally {
      setSharingToSocial(false);
    }
  };

  const shareImageToSystemSheet = async () => {
    const shareAssetUri = await captureCurrentShareCard();

    if (
      Platform.OS !== "web" &&
      shareAssetUri &&
      shareAssetUri.startsWith("file:") &&
      (await Sharing.isAvailableAsync())
    ) {
      await Sharing.shareAsync(shareAssetUri, {
        dialogTitle: "Share your Barbata story",
      });
      return;
    }

    await shareToSystemSheet();
  };

  const shareToInstagramStory = async () => {
    setShareError(null);
    await shareImageToSystemSheet();
  };

  const shareToInstagramMessages = async () => {
    setShareError(null);
    await shareImageToSystemSheet();
  };

  const shareToSnapchat = async () => {
    setShareError(
      "Direct Snapchat export needs Snap Creative Kit wiring. Opening your share sheet for now.",
    );
    await shareImageToSystemSheet();
  };

  const shareToWhatsApp = async () => {
    const message = encodeURIComponent(buildSocialShareMessage());
    const nativeUrl = `whatsapp://send?text=${message}`;
    const webUrl = `https://wa.me/?text=${message}`;
    await openExternalTarget(Platform.OS === "web" ? webUrl : nativeUrl, shareToSystemSheet);
  };

  const shareToMessages = async () => {
    const message = encodeURIComponent(buildSocialShareMessage());
    const smsUrl = Platform.OS === "ios" ? `sms:&body=${message}` : `sms:?body=${message}`;
    await openExternalTarget(smsUrl, shareToSystemSheet);
  };

  const shareToTarget = async (target: ShareTargetKey) => {
    switch (target) {
      case "instagram_story":
        await shareToInstagramStory();
        return;
      case "snapchat":
        await shareToSnapchat();
        return;
      case "instagram_messages":
        await shareToInstagramMessages();
        return;
      case "whatsapp":
        await shareToWhatsApp();
        return;
      case "messages":
        await shareToMessages();
        return;
    }
  };

  const pickShareImage = async (mode: "camera" | "library") => {
    setShareError(null);

    try {
      if (mode === "camera") {
        if (Platform.OS !== "web") {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            setShareError("Camera access is needed to take a photo.");
            return;
          }
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
          mediaTypes: ["images"],
        });

        if (!result.canceled && result.assets[0]?.uri) {
          setShareImageUri(result.assets[0].uri);
        }

        return;
      }

      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setShareError("Photo library access is needed to choose an image.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.8,
        mediaTypes: ["images"],
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setShareImageUri(result.assets[0].uri);
      }
    } catch {
      setShareError("That image action could not be completed.");
    }
  };

  const openPhotoChooser = () => {
    if (Platform.OS === "web") {
      void pickShareImage("library");
      return;
    }

    Alert.alert("Add photo", "Choose how you want to add your post-workout image.", [
      {
        text: "Take photo",
        onPress: () => {
          void pickShareImage("camera");
        },
      },
      {
        text: "Choose from library",
        onPress: () => {
          void pickShareImage("library");
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const renderSharePreviewCard = (template: ShareTemplateCard, index: number) => (
    <ViewShot
      ref={(node) => {
        shareCardRefs.current[index] = node;
      }}
      options={{
        format: "jpg",
        quality: 0.92,
        result: "tmpfile",
      }}
      style={styles.sharePreviewCaptureWrap}
    >
      <View style={styles.sharePreview}>
        {shareImageUri ? (
          <Image
            source={{ uri: shareImageUri }}
            style={styles.sharePreviewImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={["#2A2A2A", "#151515"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.82)"]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <LinearGradient
          colors={getShareTemplateGlow(template.layout)}
          locations={[0, 0.34, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <LinearGradient
          colors={getShareTemplateBottomTint(template.layout)}
          locations={[0, 0.56, 1]}
          start={{ x: 0.15, y: 0.08 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {template.layout === "corner" ? (
          <View style={styles.sharePreviewCornerLayout}>
            <Text style={styles.sharePreviewCornerKicker}>{template.kicker}</Text>
            <Text style={styles.sharePreviewCornerTitle}>{template.headline}</Text>
            <View style={styles.sharePreviewCornerStatsRow}>
              {template.metrics.map((metric) => (
                <View key={metric.label} style={styles.sharePreviewCornerStat}>
                  <Text style={styles.sharePreviewCornerStatLabel}>{metric.label}</Text>
                  <Text style={styles.sharePreviewCornerStatValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sharePreviewCornerBrandRow}>
              <Text style={styles.sharePreviewCornerFeeling}>{template.subhead}</Text>
              <ShareWordmark color={colors.premium} />
            </View>
          </View>
        ) : null}

        {template.layout === "stacked" ? (
          <View style={styles.sharePreviewStackedLayout}>
            <View style={styles.sharePreviewStackedStats}>
              {template.metrics.map((metric, metricIndex) => (
                <View
                  key={metric.label}
                  style={metricIndex > 0 ? styles.sharePreviewStackedStatGap : undefined}
                >
                  <Text style={styles.sharePreviewStackedStatLabel}>{metric.label}</Text>
                  <Text style={styles.sharePreviewStackedStatValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sharePreviewStackedFooter}>
              <ShareWordmark color={colors.premium} />
              <Text style={styles.sharePreviewStackedWorkout}>{template.workoutLine}</Text>
            </View>
          </View>
        ) : null}

        {template.layout === "hero" ? (
          <View style={styles.sharePreviewHeroLayout}>
            <View style={styles.sharePreviewHeroContent}>
              <Text style={styles.sharePreviewHeroKicker}>{template.kicker}</Text>
              <Text style={styles.sharePreviewHeroNumber}>{template.headline}</Text>
              <Text style={styles.sharePreviewHeroSubline}>{template.subhead}</Text>
              <View style={styles.sharePreviewHeroStatsInline}>
                {template.metrics.map((metric) => (
                  <View key={metric.label} style={styles.sharePreviewHeroInlineStat}>
                    <Text style={styles.sharePreviewHeroInlineLabel}>{metric.label}</Text>
                    <Text style={styles.sharePreviewHeroInlineValue}>{metric.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sharePreviewHeroLogoWrap}>
                <ShareWordmark color={colors.premium} />
              </View>
              <Text style={styles.sharePreviewHeroWorkout}>{template.workoutLine}</Text>
              <Text style={styles.sharePreviewHeroCaption}>{template.metaLine}</Text>
            </View>
          </View>
        ) : null}

        {template.layout === "challenge" ? (
          <View style={styles.sharePreviewChallengeLayout}>
            <Text style={styles.sharePreviewChallengeKicker}>{template.kicker}</Text>
            <Text style={styles.sharePreviewChallengeTitle}>{template.headline}</Text>
            <Text style={styles.sharePreviewChallengeMeta}>{template.metaLine}</Text>
            <Text style={styles.sharePreviewChallengeFeeling}>{template.subhead}</Text>
            <View style={styles.sharePreviewChallengeFooter}>
              <ShareWordmark color={colors.premium} />
              <Text style={styles.sharePreviewChallengeCaption}>Train with me on Barbata</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ViewShot>
  );

  const handleTemplateScrollEnd = (offsetX: number) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        shareTemplateCards.length - 1,
        Math.round(offsetX / shareCarouselPageWidth),
      ),
    );
    setShareTemplateIndex(nextIndex);
  };

  const jumpToTemplate = (index: number) => {
    shareCarouselRef.current?.scrollTo({
      x: index * shareCarouselPageWidth,
      animated: true,
    });
    setShareTemplateIndex(index);
  };

  const renderShareTargetIcon = (option: (typeof SHARE_TARGETS)[number]) => {
    const color = option.darkText ? "#111111" : "#FFFFFF";
    const size = option.key === "messages" ? 34 : option.key === "snapchat" ? 42 : 38;

    if (option.iconSet === "ant") {
      return <AntDesign name={option.iconName as "instagram"} size={size} color={color} />;
    }
    if (option.iconSet === "mci") {
      return (
        <MaterialCommunityIcons
          name={option.iconName as "ghost" | "whatsapp"}
          size={size}
          color={color}
        />
      );
    }

    return (
      <Ionicons
        name={option.iconName as "chatbubble-outline"}
        size={size}
        color={color}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>
            {isPartialSession ? "Partial session" : "Workout complete"}
          </Text>
          <Text style={styles.title}>{summary.workoutTitle}</Text>
          {completionMeta ? <Text style={styles.completionMeta}>{completionMeta}</Text> : null}
        </View>

        <View style={styles.overviewCard}>
          <LinearGradient
            colors={[
              celebrationAccent.bg,
              isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.72)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.celebrationHero}
          >
            <View style={styles.celebrationHeroTopRow}>
              <View
                style={[
                  styles.celebrationPill,
                  {
                    backgroundColor: celebrationAccent.bg,
                    borderColor: celebrationAccent.border,
                  },
                ]}
              >
                <Ionicons name={celebrationAccent.icon} size={14} color={celebrationAccent.text} />
                <Text style={[styles.celebrationPillText, { color: celebrationAccent.text }]}>
                  {celebrationAccent.label}
                </Text>
              </View>

              {summary.prs.length > 0 ? (
                <PRBadge
                  color={colors.premiumText}
                  backgroundColor={colors.premiumSoft}
                  borderColor={colors.premiumBorder}
                />
              ) : null}
            </View>

            <View style={styles.celebrationHeroBody}>
              <View
                style={[
                  styles.celebrationIconOrb,
                  {
                    backgroundColor: celebrationAccent.bg,
                    borderColor: celebrationAccent.border,
                  },
                ]}
              >
                <Ionicons name={celebrationAccent.icon} size={22} color={celebrationAccent.text} />
              </View>

              <View style={styles.celebrationHeroCopy}>
                <Text style={styles.cardEyebrow}>{feedback.kicker}</Text>
                <Text style={styles.feedbackTitle}>{feedback.title}</Text>
                <Text style={styles.feedbackBody}>{feedback.body}</Text>
              </View>
            </View>

            {accomplishmentHighlights.length > 0 ? (
              <View style={styles.accomplishmentChipRow}>
                {accomplishmentHighlights.map((highlight) => (
                  <View key={highlight} style={styles.accomplishmentChip}>
                    <Text style={styles.accomplishmentChipText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </LinearGradient>

          <View style={styles.overviewStatRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{completionPct}%</Text>
              <Text style={styles.overviewStatLabel}>complete</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{durationMin} min</Text>
              <Text style={styles.overviewStatLabel}>duration</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>
                {summary.totals.completedSets}/{summary.totals.totalSets}
              </Text>
              <Text style={styles.overviewStatLabel}>sets</Text>
            </View>
          </View>

          {summary.prs.length > 0 ? (
            <Text style={styles.overviewFootnote}>
              {summary.prs.length > 1
                ? `${summary.prs.length} PRs unlocked today`
                : `PR unlocked on ${summary.prs[0]?.exerciseName}`}
            </Text>
          ) : null}
        </View>

        <View style={styles.communityActionWrap}>
          <Pressable
            onPress={() => setShareComposerOpen(true)}
            style={[
              styles.communityButton,
              communityPosted && styles.communityButtonShared,
            ]}
          >
            <View style={styles.communityButtonInner}>
              <View style={styles.communityButtonIconWrap}>
                <Share2
                  size={18}
                  color={communityPosted ? colors.successText : colors.surface}
                />
              </View>
              <View style={styles.communityButtonCopy}>
                <Text
                  style={[
                    styles.communityButtonText,
                    communityPosted && styles.communityButtonTextShared,
                  ]}
                >
                  {communityPosted ? "Share again" : shareButtonLabel}
                </Text>
                <Text
                  style={[
                    styles.communityButtonSubText,
                    communityPosted && styles.communityButtonSubTextShared,
                  ]}
                >
                  {shareButtonSubLabel}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={communityPosted ? colors.successText : colors.surface}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.exerciseList}>
          {summary.exercises.map((ex) => {
            const totalSets = ex.totalSetsPlanned;
            const completedSets = ex.completedSets;
            const statusLabel = getExerciseStatus(completedSets, totalSets);
            const isNewPrExercise = summary.prs.some((pr) => pr.exerciseId === ex.id);
            const mode = getTrackingMode(ex);
            const headers = getHeadersForMode(mode);
            const isStatusMode =
              mode === "time" || mode === "reps_only" || mode === "calories";

            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseHeaderLeft}>
                    <View style={styles.exerciseTitleRow}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      {isNewPrExercise ? (
                        <PRBadge
                          color={colors.premiumText}
                          backgroundColor={colors.premiumSoft}
                          borderColor={colors.premiumBorder}
                        />
                      ) : null}
                    </View>

                    <Text style={styles.exerciseMeta}>
                      {completedSets}/{totalSets} sets logged
                    </Text>
                  </View>

                  <View style={styles.exerciseHeaderRightStatic}>
                    <Text
                      style={[
                        styles.exerciseBadge,
                        statusLabel === "Completed"
                          ? styles.exerciseBadgeCompleted
                          : statusLabel === "Partial"
                            ? styles.exerciseBadgePartial
                            : styles.exerciseBadgeSkipped,
                      ]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colSet]}>{headers[0]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>{headers[1]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>{headers[2]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colDelta]}>{headers[3]}</Text>
                </View>

                {ex.sets.map((set) => {
                  const richDelta = getRichSetDelta(set.comparison);
                  const isPositive = richDelta.label != null ? richDelta.positive : false;
                  const isPr = richDelta.pr;

                  return (
                    <View key={set.set} style={styles.setRow}>
                      <Text style={[styles.setCell, styles.colSet]}>S{set.set}</Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {getPrimaryValue(mode, set)}
                      </Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {getSecondValue(mode, set)}
                      </Text>

                      <Text
                        style={[
                          styles.deltaText,
                          styles.colDelta,
                          !isStatusMode && isPositive && styles.deltaPositive,
                          !isStatusMode && isPr && styles.deltaPr,
                          isStatusMode && set.done && styles.deltaPositive,
                        ]}
                      >
                        {getFourthValue(mode, set)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)/progress")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>View Progress</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>Back to Home</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={shareComposerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setShareComposerOpen(false)}
      >
        <View style={styles.shareSheetBackdrop}>
          <View style={styles.shareSheetHeader}>
            <Pressable onPress={() => setShareComposerOpen(false)}>
              <Text style={styles.shareSheetCloseText}>Close</Text>
            </Pressable>
            <Text style={styles.shareSheetTitle}>Share Activity</Text>
            <View style={{ width: 48 }} />
          </View>

          <ScrollView
            style={styles.shareSheetBody}
            contentContainerStyle={styles.shareSheetBodyContent}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              ref={shareCarouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) =>
                handleTemplateScrollEnd(event.nativeEvent.contentOffset.x)
              }
              style={styles.shareSheetPreviewSlider}
            >
              {shareTemplateCards.map((template, index) => (
                <View
                  key={template.id}
                  style={[
                    styles.shareSheetPreviewStage,
                    { width: shareCarouselPageWidth },
                  ]}
                >
                  {renderSharePreviewCard(template, index)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.templateDotsRow}>
              {shareTemplateCards.map((template, index) => {
                const active = activeShareTemplateIndex === index;

                return (
                  <Pressable
                    key={template.id}
                    onPress={() => jumpToTemplate(index)}
                    style={[
                      styles.templateDot,
                      active && styles.templateDotActive,
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.shareEditRow}>
              <Pressable onPress={openPhotoChooser} style={styles.shareEditPill}>
                <Text style={styles.shareEditPillText}>
                  {shareImageUri ? "Change photo" : "Add photo"}
                </Text>
              </Pressable>
            </View>

            {shareError ? (
              <Text style={styles.shareErrorText}>{shareError}</Text>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusChipRailDark}
            >
              {SHARE_STATUS_SUGGESTIONS.map((option) => {
                const selected = shareStatus.trim() === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setShareStatus(option)}
                    disabled={isSubmittingShare}
                    style={[
                      styles.statusChipDark,
                      selected && styles.statusChipDarkSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipDarkText,
                        selected && styles.statusChipDarkTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TextInput
              value={shareStatus}
              onChangeText={setShareStatus}
              editable={!isSubmittingShare}
              placeholder="Add a comment"
              placeholderTextColor="rgba(255,255,255,0.42)"
              multiline
              style={styles.shareStatusInput}
              textAlignVertical="top"
            />

            <View style={styles.shareSection}>
              <Text style={styles.shareSectionTitle}>Share to</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shareOptionsTopRow}
              >
                <Pressable
                  onPress={() =>
                    communityPosted ? openCommunityFeed() : void postToCommunity()
                  }
                  disabled={isSubmittingShare}
                  style={styles.shareOptionPrimary}
                >
                  <View
                    style={[
                      styles.shareOptionCircle,
                      styles.shareOptionCommunityCircle,
                      communityPosted && styles.shareOptionCommunityCirclePosted,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={communityPosted ? "check-bold" : "account-group"}
                      size={30}
                      color={communityPosted ? colors.successText : colors.onPremium}
                    />
                  </View>
                  <Text style={styles.shareOptionPrimaryLabel}>Community</Text>
                  <Text style={styles.shareOptionPrimarySubLabel}>
                    {communityPosted ? "View post" : "In app"}
                  </Text>
                </Pressable>
                {SHARE_TARGETS.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => void shareToTarget(option.key)}
                    disabled={isSubmittingShare}
                    style={styles.shareOptionPrimary}
                  >
                    <View
                      style={[
                        styles.shareOptionCircle,
                        option.circleStyle === "instagram" && styles.shareOptionInstagramCircle,
                        option.circleStyle === "snapchat" && styles.shareOptionSnapCircle,
                        option.circleStyle === "whatsapp" && styles.shareOptionWhatsappCircle,
                        option.circleStyle === "tiktok" && styles.shareOptionTiktokCircle,
                        option.circleStyle === "messages" && styles.shareOptionMessagesCircle,
                      ]}
                    >
                      {renderShareTargetIcon(option)}
                    </View>
                    <Text style={styles.shareOptionPrimaryLabel}>{option.label}</Text>
                    {option.subLabel ? (
                      <Text style={styles.shareOptionPrimarySubLabel}>{option.subLabel}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>

              {communityPosted ? (
                <View style={styles.communityPostedNotice}>
                  <View style={styles.communityPostedNoticeCopy}>
                    <View style={styles.communityPostedNoticeIcon}>
                      <Ionicons name="checkmark" size={15} color={colors.successText} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.communityPostedNoticeTitle}>
                        {communityJustPosted
                          ? "Posted to Community"
                          : "Already posted to Community"}
                      </Text>
                      <Text style={styles.communityPostedNoticeBody}>
                        {communityJustPosted
                          ? "Your workout share is live in the Barbata feed."
                          : "This workout share is already live in the Barbata feed."}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={openCommunityFeed}
                    style={styles.communityPostedNoticeButton}
                  >
                    <Text style={styles.communityPostedNoticeButtonText}>View Community</Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.shareOptionsBottomRow}>
                <Pressable
                  onPress={openPhotoChooser}
                  style={styles.shareUtilityOption}
                >
                  <View style={styles.shareUtilityCircle}>
                    <Feather name="image" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.shareUtilityLabel}>Photo</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setShareError("Copy link will connect to a real Barbata share URL next.");
                  }}
                  style={styles.shareUtilityOption}
                >
                  <View style={styles.shareUtilityCircle}>
                    <Feather name="link-2" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.shareUtilityLabel}>Copy Link</Text>
                </Pressable>

                <Pressable
                  onPress={() => void shareToSystemSheet()}
                  disabled={isSubmittingShare}
                  style={styles.shareUtilityOption}
                >
                  <View style={styles.shareUtilityCircle}>
                    <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.shareUtilityLabel}>More</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: {
  surface: string;
  background: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  borderSubtle: string;
  borderStrong: string;
  hairline: string;
  fill: string;
  fillAlt: string;
  premium: string;
  danger: string;
  success: string;
  warning: string;
  ink: string;
  inkSoft: string;
  card: string;
  premiumSoft: string;
  premiumBorder: string;
  premiumText: string;
  successSoft: string;
  successBorder: string;
  successText: string;
  warningSoft: string;
  warningBorder: string;
  warningText: string;
}, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
    },
    headerBlock: {
      marginTop: 4,
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    title: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.5,
    },
    completionMeta: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "700",
      color: colors.subtle,
    },
    overviewCard: {
      marginTop: 16,
      padding: 18,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    celebrationHero: {
      borderRadius: 18,
      padding: 16,
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(17,17,17,0.04)",
      overflow: "hidden",
    },
    celebrationHeroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    celebrationPill: {
      minHeight: 30,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    celebrationPillText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.25,
      textTransform: "uppercase",
    },
    overviewHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    celebrationHeroBody: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    celebrationIconOrb: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: BorderWidth.default,
      flexShrink: 0,
    },
    celebrationHeroCopy: {
      flex: 1,
    },
    overviewStatRow: {
      marginTop: 16,
      flexDirection: "row",
      gap: 10,
    },
    overviewStat: {
      flex: 1,
      minHeight: 62,
      borderRadius: 14,
      padding: 10,
      backgroundColor: colors.fillAlt,
      justifyContent: "space-between",
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    overviewStatValue: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },
    overviewStatLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    overviewFootnote: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },
    accomplishmentChipRow: {
      marginTop: 14,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    accomplishmentChip: {
      minHeight: 32,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(17,17,17,0.04)",
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(17,17,17,0.05)",
    },
    accomplishmentChipText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.text,
    },
    cardEyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    prRow: {
      marginTop: 8,
    },
    prExercise: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },
    prValue: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    feedbackTitle: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 24,
    },
    feedbackBody: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
      lineHeight: 20,
    },
    communityInput: {
      minHeight: 88,
      marginTop: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.fillAlt,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 20,
    },
    statusChipRail: {
      paddingTop: 12,
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    statusChip: {
      minHeight: 36,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    statusChipSelected: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    statusChipText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.05,
    },
    statusChipTextSelected: {
      color: colors.surface,
    },
    communityActionWrap: {
      marginTop: 12,
    },
    communityButton: {
      marginTop: 12,
      minHeight: 66,
      borderRadius: 22,
      backgroundColor: colors.text,
      paddingHorizontal: 16,
      alignItems: "stretch",
      justifyContent: "center",
      borderWidth: BorderWidth.default,
      borderColor: colors.text,
      shadowColor: colors.text,
      shadowOpacity: 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    communityButtonShared: {
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
    },
    communityButtonDisabled: {
      opacity: 0.6,
    },
    communityButtonInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    communityButtonIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.14)",
    },
    communityButtonCopy: {
      flex: 1,
    },
    communityButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },
    communityButtonTextShared: {
      color: colors.successText,
    },
    communityButtonSubText: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "rgba(15,15,16,0.62)" : "rgba(255,255,255,0.72)",
    },
    communityButtonSubTextShared: {
      color: colors.successText,
      opacity: 0.9,
    },
    exerciseList: {
      marginTop: 24,
      gap: 18,
    },
    exerciseCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    exerciseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    exerciseHeaderLeft: {
      flex: 1,
    },
    exerciseHeaderRight: {
      alignItems: "flex-end",
      gap: 6,
    },
    exerciseHeaderRightStatic: {
      alignItems: "flex-end",
    },
    exerciseTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },
    exerciseMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },
    exerciseBadge: {
      fontSize: 12,
      fontWeight: "800",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: BorderWidth.default,
    },
    exerciseBadgeCompleted: {
      color: colors.successText,
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
    },
    exerciseBadgePartial: {
      color: colors.warningText,
      backgroundColor: colors.warningSoft,
      borderColor: colors.warningBorder,
    },
    exerciseBadgeSkipped: {
      color: colors.muted,
      backgroundColor: colors.fillAlt,
      borderColor: colors.borderSubtle,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.hairline,
    },
    tableHeaderText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
    },
    setRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.hairline,
    },
    setCell: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },
    colSet: {
      width: 44,
    },
    colValue: {
      flex: 1,
      textAlign: "left",
    },
    colDelta: {
      width: 96,
      textAlign: "right",
    },
    deltaText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
    },
    deltaPositive: {
      color: colors.successText,
    },
    deltaPr: {
      color: colors.premiumText,
    },
    primaryButton: {
      marginTop: 24,
      height: 54,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },
    secondaryLink: {
      marginTop: 14,
      alignItems: "center",
    },
    secondaryLinkText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },
    shareSheetBackdrop: {
      flex: 1,
      backgroundColor: "#141414",
    },
    shareSheetHeader: {
      paddingTop: 56,
      paddingHorizontal: 18,
      paddingBottom: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#232321",
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: "rgba(255,255,255,0.08)",
    },
    shareSheetCloseText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    shareSheetTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.2,
    },
    shareSheetBody: {
      flex: 1,
      backgroundColor: "#141414",
    },
    shareSheetBodyContent: {
      paddingBottom: 28,
    },
    shareSheetPreviewSlider: {
      marginTop: 8,
    },
    shareSheetPreviewStage: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 18,
      paddingHorizontal: 18,
    },
    sharePreviewCaptureWrap: {
      width: SHARE_PREVIEW_WIDTH,
      height: SHARE_PREVIEW_HEIGHT,
    },
    sharePreview: {
      width: SHARE_PREVIEW_WIDTH,
      height: SHARE_PREVIEW_HEIGHT,
      borderRadius: 0,
      overflow: "hidden",
      backgroundColor: "#171717",
    },
    sharePreviewImage: {
      width: "100%",
      height: "100%",
    },
    sharePreviewCornerLayout: {
      position: "absolute",
      top: 18,
      left: 18,
      right: 18,
      bottom: 18,
    },
    sharePreviewCornerKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.7,
      textTransform: "uppercase",
    },
    sharePreviewCornerTitle: {
      marginTop: 10,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.6,
    },
    sharePreviewCornerStatsRow: {
      marginTop: 18,
      flexDirection: "row",
      gap: 16,
    },
    sharePreviewCornerStat: {
      flex: 1,
    },
    sharePreviewCornerStatLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(255,255,255,0.62)",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    sharePreviewCornerStatValue: {
      marginTop: 6,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
    },
    sharePreviewCornerBrandRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    sharePreviewCornerFeeling: {
      flex: 1,
      marginRight: 12,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
    },
    sharePreviewStackedLayout: {
      position: "absolute",
      left: 26,
      right: 26,
      top: 42,
      bottom: 34,
      alignItems: "center",
      justifyContent: "space-between",
    },
    sharePreviewStackedStats: {
      alignItems: "center",
    },
    sharePreviewStackedStatGap: {
      marginTop: 22,
    },
    sharePreviewStackedStatLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    sharePreviewStackedStatValue: {
      marginTop: 7,
      fontSize: 27,
      lineHeight: 29,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.8,
      textAlign: "center",
    },
    sharePreviewStackedFooter: {
      alignItems: "center",
      gap: 12,
    },
    sharePreviewStackedWorkout: {
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
      textAlign: "center",
    },
    sharePreviewHeroLayout: {
      position: "absolute",
      left: 22,
      right: 22,
      top: 28,
      bottom: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    sharePreviewHeroContent: {
      width: "100%",
      maxWidth: 188,
      alignItems: "center",
    },
    sharePreviewHeroKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      textAlign: "center",
    },
    sharePreviewHeroNumber: {
      marginTop: 18,
      fontSize: 42,
      lineHeight: 42,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -1,
      textAlign: "center",
    },
    sharePreviewHeroSubline: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "800",
      color: "rgba(255,255,255,0.92)",
      textAlign: "center",
    },
    sharePreviewHeroStatsInline: {
      flexDirection: "row",
      gap: 24,
      marginTop: 24,
      alignSelf: "stretch",
    },
    sharePreviewHeroInlineStat: {
      flex: 1,
      alignItems: "center",
    },
    sharePreviewHeroInlineLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.premiumText,
      textTransform: "uppercase",
      letterSpacing: 0.72,
      textAlign: "center",
    },
    sharePreviewHeroInlineValue: {
      marginTop: 6,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
      textAlign: "center",
    },
    sharePreviewHeroLogoWrap: {
      marginTop: 28,
      marginBottom: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignItems: "center",
    },
    sharePreviewHeroWorkout: {
      fontSize: 16,
      lineHeight: 19,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.3,
      textAlign: "center",
      maxWidth: 180,
    },
    sharePreviewHeroCaption: {
      marginTop: 10,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
      textAlign: "center",
      maxWidth: 164,
    },
    sharePreviewChallengeLayout: {
      position: "absolute",
      left: 22,
      right: 22,
      bottom: 24,
      alignItems: "center",
    },
    sharePreviewChallengeKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      textAlign: "center",
    },
    sharePreviewChallengeTitle: {
      marginTop: 10,
      fontSize: 24,
      lineHeight: 27,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.7,
      textAlign: "center",
      maxWidth: 196,
    },
    sharePreviewChallengeMeta: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "800",
      color: "rgba(255,255,255,0.88)",
      textAlign: "center",
    },
    sharePreviewChallengeFeeling: {
      marginTop: 14,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.4,
      textAlign: "center",
      maxWidth: 188,
    },
    sharePreviewChallengeFooter: {
      marginTop: 24,
      alignItems: "center",
      gap: 10,
    },
    sharePreviewChallengeCaption: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
      textAlign: "center",
      maxWidth: 170,
    },
    templateDotsRow: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    templateDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "rgba(255,255,255,0.3)",
    },
    templateDotActive: {
      backgroundColor: "#FFFFFF",
    },
    shareEditRow: {
      marginTop: 14,
      paddingHorizontal: 18,
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    },
    shareEditPill: {
      minHeight: 40,
      paddingHorizontal: 14,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#232321",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.08)",
    },
    shareEditPillText: {
      fontSize: 13,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.05,
    },
    shareStatusInput: {
      minHeight: 76,
      marginTop: 14,
      marginHorizontal: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: "#232321",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.08)",
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 20,
    },
    statusChipRailDark: {
      paddingTop: 12,
      paddingHorizontal: 18,
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    statusChipDark: {
      minHeight: 36,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#232321",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.08)",
    },
    statusChipDarkSelected: {
      backgroundColor: "#FFFFFF",
      borderColor: "#FFFFFF",
    },
    statusChipDarkText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.05,
    },
    statusChipDarkTextSelected: {
      color: "#111111",
    },
    shareSection: {
      marginTop: 22,
      paddingTop: 18,
      paddingHorizontal: 18,
      borderTopWidth: BorderWidth.default,
      borderTopColor: "rgba(255,255,255,0.08)",
    },
    shareSectionTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.08,
    },
    shareOptionsTopRow: {
      marginTop: 18,
      flexDirection: "row",
      gap: 18,
      paddingRight: 18,
    },
    shareOptionPrimary: {
      width: 104,
      alignItems: "center",
    },
    shareOptionCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    shareOptionInstagramCircle: {
      backgroundColor: "#D93A80",
    },
    shareOptionCommunityCircle: {
      backgroundColor: colors.premium,
      borderWidth: BorderWidth.default,
      borderColor: colors.premium,
    },
    shareOptionCommunityCirclePosted: {
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
    },
    shareOptionSnapCircle: {
      backgroundColor: "#F8ED5C",
    },
    shareOptionWhatsappCircle: {
      backgroundColor: "#4AC959",
    },
    shareOptionMessagesCircle: {
      backgroundColor: "#E7E7EA",
    },
    shareOptionPrimaryLabel: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFFFFF",
      textAlign: "center",
    },
    shareOptionPrimarySubLabel: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: "rgba(255,255,255,0.76)",
      textAlign: "center",
    },
    communityPostedNotice: {
      marginTop: 20,
      padding: 14,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.08)",
      gap: 14,
    },
    communityPostedNoticeCopy: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    communityPostedNoticeIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.successSoft,
      borderWidth: BorderWidth.default,
      borderColor: colors.successBorder,
      marginTop: 1,
    },
    communityPostedNoticeTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.08,
    },
    communityPostedNoticeBody: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "700",
      color: "rgba(255,255,255,0.72)",
    },
    communityPostedNoticeButton: {
      minHeight: 42,
      borderRadius: 999,
      backgroundColor: colors.successSoft,
      borderWidth: BorderWidth.default,
      borderColor: colors.successBorder,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      alignSelf: "flex-start",
    },
    communityPostedNoticeButtonText: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.successText,
      letterSpacing: -0.08,
    },
    shareOptionsBottomRow: {
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 12,
    },
    shareUtilityOption: {
      width: 76,
      alignItems: "center",
    },
    shareUtilityCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#3B3B39",
      marginBottom: 10,
    },
    shareUtilityLabel: {
      fontSize: 12,
      lineHeight: 15,
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
    },
    shareErrorText: {
      marginTop: 10,
      marginHorizontal: 18,
      fontSize: 13,
      fontWeight: "700",
      color: colors.danger,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
    },
    emptyBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 20,
    },
  });
}
