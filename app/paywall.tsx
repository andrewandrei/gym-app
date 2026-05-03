import { router, useLocalSearchParams } from "expo-router";
import { Check, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getPaywallConfig,
  type PaywallConfig,
} from "@/features/paywall/paywall.supabase";

import { PressableScale } from "@/components/ui/PressableScale";
import { Colors } from "@/styles/colors";

import { styles } from "../styles/screens/paywall.styles";

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ paywall?: string }>();

  const [config, setConfig] = useState<PaywallConfig | null>(null);

  const paywallKey = params.paywall || "all_access";

  useEffect(() => {
    let mounted = true;

    async function loadPaywall() {
      const nextConfig = await getPaywallConfig(paywallKey);

      if (mounted) {
        setConfig(nextConfig);
      }
    }

    loadPaywall();

    return () => {
      mounted = false;
    };
  }, [paywallKey]);

  const onClose = () => router.back();

  const onContinue = async () => {
    const checkoutUrl = config?.checkoutUrl || "https://barbata.app/join";

    const canOpen = await Linking.canOpenURL(checkoutUrl);

    if (canOpen) {
      await Linking.openURL(checkoutUrl);
      return;
    }

    await Linking.openURL("https://barbata.app/join");
  };

  const benefits =
    config?.benefits && config.benefits.length > 0
      ? config.benefits
      : [
          "All weeks, all sessions",
          "Premium individual workouts",
          "Progress tracking",
          "Recipes library",
        ];

  return (
    <View style={styles.backdrop}>
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
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.kicker}>BARBATA</Text>
            <Text style={styles.headerTitle}>
              {config?.title || "Join to continue"}
            </Text>
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

        <Text style={styles.title}>
          {config?.subtitle ||
            "Full access to every program, premium workout, and recipe."}
        </Text>

        <Text style={styles.subtitle}>
          One subscription unlocks everything in the app — programs, individual
          workouts, recipes, and progress tools.
        </Text>

        <View style={styles.benefitsGroup}>
          {benefits.map((benefit, index) => (
            <React.Fragment key={`${benefit}-${index}`}>
              <View style={styles.benefitRow}>
                <View style={styles.tick}>
                  <Check size={16} color={Colors.text} />
                </View>

                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit}</Text>
                </View>
              </View>

              {index !== benefits.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        <PressableScale
          onPress={onContinue}
          style={styles.cta}
          accessibilityRole="button"
          accessibilityLabel={config?.ctaText || "Continue on website"}
        >
          <Text style={styles.ctaText}>
            {config?.ctaText || "Continue on website"}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={onClose}
          style={styles.secondary}
          scaleTo={0.99}
          opacityTo={0.9}
        >
          <Text style={styles.secondaryText}>
            {config?.secondaryText || "Not now"}
          </Text>
        </PressableScale>

        <Text style={styles.legal}>
          {config?.legalText ||
            "Payments are handled on the website. Manage your plan anytime in Profile."}
        </Text>
      </View>
    </View>
  );
}