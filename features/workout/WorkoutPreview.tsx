
//app/workout/WorkoutPreview.tsx
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";

import {
  ChevronLeft,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ───────────────────────── Types ───────────────────────── */

export type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type TrackingMode =
  | "weight_reps"
  | "bodyweight_reps"
  | "time"
  | "reps_only"
  | "calories";

export type Exercise = {
  id: string;
  name: string;
  tempo: string;
  image: string;
  unitLabel: "LBS" | "KG" | "REPS";
  trackingMode?: TrackingMode;
  sets: SetRow[];
  videoUrl?: string;
  description?: string;
  tutorial?: string[];
  musclesWorked?: string[];
};

export type ExerciseAlternative = {
  id: string;
  name: string;
  category: string;
  image: string;
};

export type ExerciseHistorySession = {
  id: string;
  dateLabel: string;
  sets: Array<{
    set: number;
    weight: string;
    reps: string;
    rest: string;
    done: boolean;
  }>;
};

export type StrengthBlock = {
  id: string;
  type: "single" | "superset" | "giant" | "circuit";
  title?: string;
  rounds?: number;
  exerciseIds: string[];
};

type Props = {
  workoutTitle: string;
  exercises: Exercise[];
  blocks: StrengthBlock[];
  exerciseById: Record<string, Exercise>;
  estimatedTime: number;
  totalSets: number;
  onStartWorkout: () => void;
  onBack: () => void;
};

/* ───────────────────────── Helpers ───────────────────────── */

function getTrackingMode(exercise: Exercise): TrackingMode {
  return exercise.trackingMode ?? "weight_reps";
}

function formatPreviewTime(value?: string) {
  const totalSeconds = parseInt(value ?? "", 10);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "00:00";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function getExerciseMeta(exercise: Exercise) {
  const mode = getTrackingMode(exercise);
  const firstSet = exercise.sets[0];

  if (mode === "time") {
    return `${exercise.sets.length} sets · ${formatPreviewTime(firstSet?.weight)}`;
  }

  if (mode === "reps_only") {
    return `${exercise.sets.length} sets · ${firstSet?.reps || "—"} reps`;
  }

  if (mode === "bodyweight_reps") {
    return `${exercise.sets.length} sets · ${firstSet?.reps || "—"} reps`;
  }

  if (mode === "calories") {
    return `${exercise.sets.length} sets · ${firstSet?.weight || "—"} cal`;
  }

  return `${exercise.sets.length} sets · ${firstSet?.reps || "—"} reps`;
}

function getExerciseHeaderMeta(exercise: Exercise) {
  const mode = getTrackingMode(exercise);

  if (mode === "time") {
    return `${exercise.sets.length} sets · Tempo ${exercise.tempo} · Time`;
  }

  if (mode === "reps_only") {
    return `${exercise.sets.length} sets · Tempo ${exercise.tempo} · Reps`;
  }

  if (mode === "bodyweight_reps") {
    return `${exercise.sets.length} sets · Tempo ${exercise.tempo} · Bodyweight`;
  }

  if (mode === "calories") {
    return `${exercise.sets.length} sets · Tempo ${exercise.tempo} · Calories`;
  }

  return `${exercise.sets.length} sets · Tempo ${exercise.tempo} · ${exercise.unitLabel}`;
}

/* ───────────────────────── Video helpers ───────────────────────── */

type VideoSource = {
  type: "youtube" | "vimeo" | "mp4";
  uri: string;
  useHtml: boolean;
  html?: string;
};

function parseVideoUrl(url?: string): VideoSource | null {
  if (!url) return null;

  const ytLong = url.match(
    /(?:youtube\.com\/watch\?.*v=|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  );
  const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  const ytId = ytLong?.[1] ?? ytShort?.[1];
  if (ytId) {
    return {
      type: "youtube",
      uri: `https://m.youtube.com/watch?v=${ytId}`,
      useHtml: false,
    };
  }

  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      uri: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`,
      useHtml: false,
    };
  }

  if (url.match(/\.(mp4|m4v|mov|webm)(\?.*)?$/i)) {
    return {
      type: "mp4",
      uri: url,
      useHtml: true,
      html: `<!DOCTYPE html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
        <style>*{margin:0;padding:0}body{background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden}
        video{max-width:100%;max-height:100%;object-fit:contain}</style>
        </head><body><video src="${url}" autoplay controls playsinline></video></body></html>`,
    };
  }

  return null;
}

/* ───────────────────────── WebView (lazy) ───────────────────────── */

let WebViewComponent: any = null;
try {
  WebViewComponent = require("react-native-webview").WebView;
} catch {}

/* ───────────────────────── Fullscreen video modal ───────────────────────── */

function FullscreenVideoModal({
  visible,
  videoSource,
  onClose,
}: {
  visible: boolean;
  videoSource: VideoSource | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!videoSource) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={vidStyles.container}>
        <Pressable
          onPress={onClose}
          style={[vidStyles.closeBtn, { top: Math.max(insets.top, 16) + 4 }]}
          hitSlop={12}
        >
          <X size={20} color="#fff" />
        </Pressable>

        {Platform.OS === "web" ? (
          <iframe
            src={videoSource.uri}
            style={{ width: "100%", height: "100%", border: "none" } as any}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : WebViewComponent ? (
          <WebViewComponent
            source={
              videoSource.useHtml
                ? { html: videoSource.html! }
                : { uri: videoSource.uri }
            }
            style={vidStyles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            javaScriptEnabled
            scrollEnabled={videoSource.type === "youtube"}
            bounces={false}
            originWhitelist={["*"]}
          />
        ) : (
          <View style={vidStyles.fallback}>
            <Text style={vidStyles.fallbackText}>
              Install react-native-webview for video playback
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const vidStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  closeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  webview: { flex: 1, backgroundColor: "#000" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallbackText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
});

/* ───────────────────────── Exercise detail modal ───────────────────────── */

const SWIPE_THRESHOLD = 120;

function ExerciseDetailModal({
  exercise,
  visible,
  onClose,
  onPlayVideo,
  colors,
  isDark,
}: {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
  onPlayVideo: (s: VideoSource) => void;
  colors: any;
  isDark: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) =>
          gs.dy > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderMove: (_, gs) => {
          if (gs.dy > 0) {
            translateY.setValue(gs.dy);
            backdropOpacity.setValue(1 - gs.dy / screenHeight);
          }
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dy > SWIPE_THRESHOLD || gs.vy > 0.5) {
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: screenHeight,
                duration: 250,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start(() => onClose());
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 20,
                mass: 0.8,
                stiffness: 200,
                useNativeDriver: true,
              }),
              Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
    [translateY, backdropOpacity, screenHeight, onClose],
  );

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          mass: 0.9,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
    }
  }, [visible, translateY, backdropOpacity, screenHeight]);

  if (!exercise) return null;

  const BORDER = colors.borderSubtle ?? colors.border;
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const videoSource = parseVideoUrl(exercise.videoUrl);
  const hasVideo = !!videoSource;
  const hasDescription = !!exercise.description;
  const hasTutorial = exercise.tutorial && exercise.tutorial.length > 0;
  const hasMuscles = exercise.musclesWorked && exercise.musclesWorked.length > 0;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? "rgba(0,0,0,0.80)" : "rgba(0,0,0,0.50)",
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          marginTop: insets.top + 10,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            alignSelf: "center",
            width: 40,
            height: 4,
            borderRadius: 999,
            backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
            marginTop: 10,
            marginBottom: 8,
          }}
        />

        <Pressable
          onPress={handleClose}
          style={{
            position: "absolute",
            top: 10,
            right: 16,
            zIndex: 10,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: SOFT,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: BORDER,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <X size={16} color={colors.text} />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 24) + 24,
          }}
          bounces
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: colors.text,
              letterSpacing: -0.35,
              lineHeight: 30,
              paddingRight: 44,
            }}
            numberOfLines={3}
          >
            {exercise.name}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              fontWeight: "700",
              color: colors.muted,
            }}
          >
            {getExerciseHeaderMeta(exercise)}
          </Text>

          <View style={{ marginTop: 18 }}>
            {hasVideo ? (
              <Pressable
                onPress={() => onPlayVideo(videoSource)}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 18,
                  backgroundColor: "#000",
                  height: 210,
                }}
              >
                <Image source={{ uri: exercise.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: "rgba(255,255,255,0.95)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        marginLeft: 3,
                        borderLeftWidth: 18,
                        borderTopWidth: 11,
                        borderBottomWidth: 11,
                        borderLeftColor: "#111",
                        borderTopColor: "transparent",
                        borderBottomColor: "transparent",
                      }}
                    />
                  </View>
                  <Text style={{ marginTop: 10, fontSize: 13, fontWeight: "800", color: "#fff" }}>
                    Watch tutorial
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Image
                source={{ uri: exercise.image }}
                style={{
                  width: "100%",
                  height: 210,
                  borderRadius: 16,
                  marginBottom: 18,
                  backgroundColor: SOFT,
                }}
                resizeMode="cover"
              />
            )}
          </View>

          {hasDescription && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: colors.muted,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                About
              </Text>
              <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: colors.text }}>
                {exercise.description}
              </Text>
            </View>
          )}

          {hasTutorial && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: colors.muted,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                How to perform
              </Text>
              {exercise.tutorial!.map((step, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: i < exercise.tutorial!.length - 1 ? 14 : 0,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.text,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "900", color: colors.surface }}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, fontWeight: "600", color: colors.text }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {hasMuscles && (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: colors.muted,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Muscles worked
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {exercise.musclesWorked!.map((m) => (
                  <View
                    key={m}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: SOFT,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: BORDER,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/* ───────────────────────── Main preview ───────────────────────── */

export function WorkoutPreview({
  workoutTitle,
  exercises,
  blocks,
  exerciseById,
  estimatedTime,
  totalSets,
  onStartWorkout,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const sessionMeta = `${exercises.length} exercises · ~${estimatedTime} min · ${totalSets} sets`;
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  const playVideo = useCallback((source: VideoSource) => {
    setVideoSource(source);
    setVideoVisible(true);
  }, []);

  const closeVideo = useCallback(() => {
    setVideoVisible(false);
    setTimeout(() => setVideoSource(null), 300);
  }, []);

  const openDetail = useCallback((ex: Exercise) => {
    setSelectedExercise(ex);
    setModalVisible(true);
  }, []);

  const closeDetail = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedExercise(null), 300);
  }, []);

  const blockKickerFor = (block: StrengthBlock) => {
    if (block.type === "superset") return "SUPERSET";
    if (block.type === "giant") return "GIANT SET";
    if (block.type === "circuit") return "CIRCUIT";
    return "SINGLE";
  };

  const blockCountLabel = (block: StrengthBlock) => {
    const count = block.exerciseIds.length;
    if (block.type === "circuit") return `${count} exercises · ${block.rounds ?? 3} rounds`;
    if (block.type === "single") return "";
    return `${count} exercises`;
  };

  const letter = (i: number) => String.fromCharCode("A".charCodeAt(0) + i);

  const tagFor = (block: StrengthBlock, idx: number) => {
    if (block.type === "superset" || block.type === "giant") return letter(idx);
    if (block.type === "circuit") return String(idx + 1);
    return undefined;
  };

  const railColor = (block: StrengthBlock) => {
    if (block.type === "superset") return colors.premium;
    if (block.type === "giant") return colors.text;
    if (block.type === "circuit") {
      return isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)";
    }
    return isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  };

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 100 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 4 }]}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <ChevronLeft size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {workoutTitle}
            </Text>
            <Text style={styles.headerMeta}>{sessionMeta}</Text>
          </View>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.body}>
          {blocks.map((block) => {
            const countLabel = blockCountLabel(block);

            return (
              <View key={block.id} style={styles.blockWrap}>
                <View style={[styles.blockRail, { backgroundColor: railColor(block) }]} />

                <View style={styles.blockHeader}>
                  <Text style={styles.blockKicker}>{blockKickerFor(block)}</Text>
                  {countLabel !== "" && (
                    <Text style={styles.blockCount}>{countLabel}</Text>
                  )}
                </View>

                {block.exerciseIds.map((exId, idx) => {
                  const ex = exerciseById[exId];
                  if (!ex) return null;
                  const blockTag = tagFor(block, idx);
                  const isLast = idx === block.exerciseIds.length - 1;

                  return (
                    <View key={ex.id}>
                      <Pressable
                        onPress={() => openDetail(ex)}
                        style={({ pressed }) => [styles.exerciseRow, pressed && styles.exerciseRowPressed]}
                      >
                        <View style={styles.thumbWrap}>
                          <Image source={{ uri: ex.image }} style={styles.thumb} />
                          {blockTag ? (
                            <View style={styles.tagBadge}>
                              <Text style={styles.tagBadgeText}>{blockTag}</Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.exerciseText}>
                          <Text style={styles.exerciseName} numberOfLines={1}>
                            {ex.name}
                          </Text>
                          <Text style={styles.exerciseMeta}>{getExerciseMeta(ex)}</Text>
                        </View>
                      </Pressable>

                      {!isLast && <View style={styles.rowDivider} />}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomWrap, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <Pressable onPress={onStartWorkout} style={styles.startBtn}>
          <Text style={styles.startBtnText}>Start Workout</Text>
        </Pressable>
      </View>

      <ExerciseDetailModal
        exercise={selectedExercise}
        visible={modalVisible}
        onClose={closeDetail}
        onPlayVideo={playVideo}
        colors={colors}
        isDark={isDark}
      />

      <FullscreenVideoModal
        visible={videoVisible}
        videoSource={videoSource}
        onClose={closeVideo}
      />
    </View>
  );
}

/* ───────────────────────── Styles ───────────────────────── */

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
  },
  isDark: boolean,
) {
  const BORDER = colors.borderSubtle ?? colors.border;
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: SOFT,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    headerText: { flex: 1, minWidth: 0 },
    headerTitle: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },
    headerMeta: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: 0.1,
    },
    headerDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginHorizontal: 16,
      marginBottom: 16,
    },

    body: {
      paddingHorizontal: 16,
      gap: 14,
    },

    blockWrap: {
      position: "relative",
      paddingLeft: 14,
    },
    blockRail: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 4,
      borderRadius: 999,
    },
    blockHeader: {
      marginBottom: 6,
      gap: 2,
    },
    blockKicker: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    blockCount: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)",
      letterSpacing: -0.05,
    },

    exerciseRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 9,
    },
    exerciseRowPressed: { opacity: 0.8 },

    thumbWrap: {
      position: "relative",
      width: 48,
      height: 48,
      flexShrink: 0,
    },
    thumb: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: SOFT,
    },
    tagBadge: {
      position: "absolute",
      bottom: -3,
      right: -3,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    tagBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.surface,
    },

    exerciseText: { flex: 1, minWidth: 0 },
    exerciseName: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },
    exerciseMeta: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    rowDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginLeft: 58,
    },

    bottomWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      backgroundColor: colors.background,
    },
    startBtn: {
      height: 56,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    startBtnText: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.15,
    },
  });
}