import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function BarbataLoadingScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.985)).current;
  const translateY = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.lockup,
          {
            opacity,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <Text style={styles.wordmark}>BARBATA</Text>
        <Text style={styles.byline}>by Andrei Andrei</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  lockup: {
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    transform: [{ translateY: -8 }],
  },

  wordmark: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: 8,
    textTransform: "uppercase",
    textAlign: "center",
    marginLeft: 8,
  },

  byline: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 13,
    fontWeight: "600",
    letterSpacing: 1.3,
    textAlign: "center",
  },
});