import { router } from "expo-router";
import { Check, X } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEntitlements } from "./_providers/entitlements";

import { PressableScale } from "@/components/ui/PressableScale";
import { Colors } from "@/styles/colors";

import { styles } from "./paywall.styles";

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { setPro } = useEntitlements();

  const onClose = () => router.back();

  // DEV ONLY: simulate "web purchase"
  const onContinue = async () => {
    // Later: openURL("https://andreiandreifit.com/join?source=app")
    await setPro(true);
    router.back();
  };

  return (
    <View style={styles.backdrop}>
      {/* Tap outside to dismiss (iOS sheet behavior) */}
      <Pressable
        style={styles.backdropTap}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 12) + 12 },
        ]}
      >
        {/* Grabber */}
        <View style={styles.grabber} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.kicker}>AndreiAndreiFit</Text>
            <Text style={styles.headerTitle}>Join to continue</Text>
          </View>

          <PressableScale
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={18} color={Colors.text} />
          </PressableScale>
        </View>

        {/* Body copy */}
        <Text style={styles.title}>Full access to every program.</Text>
        <Text style={styles.subtitle}>
          Your plan is structured end-to-end. Upgrade when you’re ready — no
          pressure.
        </Text>

        {/* Benefits group */}
        <View style={styles.benefitsGroup}>
          <View style={styles.benefitRow}>
            <View style={styles.tick}>
              <Check size={16} color={Colors.text} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>All weeks, all sessions</Text>
              <Text style={styles.benefitMeta}>
                Complete the program exactly as designed.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitRow}>
            <View style={styles.tick}>
              <Check size={16} color={Colors.text} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Progress tracking</Text>
              <Text style={styles.benefitMeta}>
                Sessions, streaks, and completion.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitRow}>
            <View style={styles.tick}>
              <Check size={16} color={Colors.text} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Recipes library</Text>
              <Text style={styles.benefitMeta}>
                Macro-focused meals (coming soon).
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <PressableScale
          onPress={onContinue}
          style={styles.cta}
          accessibilityRole="button"
          accessibilityLabel="Continue on website"
        >
          <Text style={styles.ctaText}>Continue on website</Text>
        </PressableScale>

        <PressableScale
          onPress={onClose}
          style={styles.secondary}
          scaleTo={0.99}
          opacityTo={0.9}
        >
          <Text style={styles.secondaryText}>Not now</Text>
        </PressableScale>

        <Text style={styles.legal}>
          Payments are handled on the website. Manage your plan anytime in
          Profile.
        </Text>
      </View>
    </View>
  );
}
