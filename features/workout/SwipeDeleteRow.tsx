import * as Haptics from "expo-haptics";
import React, { ReactNode, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const DELETE_REVEAL_WIDTH = 82;
const OPEN_THRESHOLD = 34;
const SWIPE_ACTIVATION_DISTANCE = 8;

type Props = {
  children: ReactNode;
  onDelete: () => void;
  disabled?: boolean;
};

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

export default function SwipeDeleteRow({
  children,
  onDelete,
  disabled = false,
}: Props) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const close = useCallback(() => {
    translateX.value = withSpring(0, {
      damping: 22,
      stiffness: 260,
      mass: 0.8,
    });
    isOpen.value = false;
  }, [isOpen, translateX]);

  const open = useCallback(() => {
    translateX.value = withSpring(-DELETE_REVEAL_WIDTH, {
      damping: 22,
      stiffness: 260,
      mass: 0.8,
    });
    isOpen.value = true;
  }, [isOpen, translateX]);

  const triggerLightHaptic = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const triggerDeleteHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const handleDelete = useCallback(() => {
    triggerDeleteHaptic();
    onDelete();
  }, [onDelete, triggerDeleteHaptic]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-SWIPE_ACTIVATION_DISTANCE, SWIPE_ACTIVATION_DISTANCE])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const next = startX.value + event.translationX;

      /**
       * This is the important fix:
       * The row can only move between:
       * 0 = closed
       * -DELETE_REVEAL_WIDTH = open
       *
       * It can no longer slide all the way left.
       */
      translateX.value = clamp(next, -DELETE_REVEAL_WIDTH, 0);
    })
    .onEnd((event) => {
      const shouldOpen =
        translateX.value < -OPEN_THRESHOLD || event.velocityX < -450;

      const shouldClose =
        event.velocityX > 350 || translateX.value > -OPEN_THRESHOLD;

      if (shouldOpen && !shouldClose) {
        translateX.value = withSpring(-DELETE_REVEAL_WIDTH, {
          damping: 22,
          stiffness: 260,
          mass: 0.8,
        });
        isOpen.value = true;
        runOnJS(triggerLightHaptic)();
      } else {
        translateX.value = withSpring(0, {
          damping: 22,
          stiffness: 260,
          mass: 0.8,
        });
        isOpen.value = false;
      }
    });

  const rowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.deleteLayer} pointerEvents="box-none">
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Delete set"
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.rowLayer, rowAnimatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
  },

  deleteLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  deleteButton: {
    width: DELETE_REVEAL_WIDTH - 10,
    height: "82%",
    marginRight: 0,
    borderRadius: 999,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  rowLayer: {
    backgroundColor: "transparent",
  },
});