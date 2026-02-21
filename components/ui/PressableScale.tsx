import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

type Props = PressableProps & {
  scaleTo?: number;
  opacityTo?: number;
  durationMs?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  scaleTo = 0.98,
  opacityTo = 0.92,
  durationMs = 120,
  ...props
}: Props) {
  const pressed = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => {
    const t = pressed.value;
    return {
      transform: [{ scale: withTiming(t ? scaleTo : 1, { duration: durationMs }) }],
      opacity: withTiming(t ? opacityTo : 1, { duration: durationMs }),
    };
  });

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        pressed.value = 1;
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = 0;
        props.onPressOut?.(e);
      }}
      style={[props.style, aStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
