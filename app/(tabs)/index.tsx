import { Colors } from '@/styles/colors';
import { useRouter } from 'expo-router';
import { Moon } from 'lucide-react-native';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CtaState = 'start' | 'resume' | 'completed' | 'rest';

export default function HomeScreen() {
  const router = useRouter();

  /* ─────────────── DEMO STATE (swap with data later) ─────────────── */
  const weeklyDone = 0;
  const weeklyTotal = 3;

  const programTitle = 'Strength Foundations';
  const programMeta = 'Intermediate · Gym';
  const phaseLabel = 'Foundation Phase';
  const focusLabel = 'Upper Body Focus';

  const weekLabel = 'Week 2';
  const workoutLabel = 'Workout 4';
  const workoutName = 'Hypertrophy Focus';

  const programCompleted = 3;
  const programTotal = 21;

  const estMinutes = 25;
  const streakDays = 3;

  // CTA state demo:
  // - 'start'     => start workout
  // - 'resume'    => resume workout (in progress)
  // - 'completed' => completed today
  // - 'rest'      => rest day (no workout)
  const ctaState: CtaState = 'start';

  /* ─────────────── Derived values ─────────────── */
  const weeklyProgress = weeklyTotal > 0 ? weeklyDone / weeklyTotal : 0;
  const programProgress = programTotal > 0 ? programCompleted / programTotal : 0;
  const progressPct = Math.round(Math.max(0, Math.min(1, programProgress)) * 100);

  const greetingTitle = getLuxuryGreetingTitle({ ctaState, streakDays, weeklyDone });
  const greetingSub = `${weeklyDone} of ${weeklyTotal} workouts completed this week`;

  const todayLine =
    ctaState === 'rest'
      ? 'Today · Recovery'
      : `Today · ${focusLabel}`;

  const cta = getCtaCopy({ ctaState, workoutLabel });
  const heroHint =
    ctaState === 'completed'
      ? 'You earned it. Recovery keeps you sharp.'
      : ctaState === 'rest'
      ? 'Stay loose. Keep the engine warm.'
      : 'One session. Clean execution.';

  const onPressCta = () => {
    if (ctaState === 'completed') return;
    if (ctaState === 'rest') return;
    router.push('/workout');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingTitle}>{greetingTitle}</Text>
            <Text style={styles.greetingSub}>{greetingSub}</Text>

            <View style={styles.weekProgressBg}>
              <View
                style={[
                  styles.weekProgressFill,
                  { width: `${Math.max(0, Math.min(1, weeklyProgress)) * 100}%` },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
            <Moon size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Today row */}
        <View style={styles.todayRow}>
          <Text style={styles.todayTitle}>Today</Text>
          <TouchableOpacity style={styles.planLink} activeOpacity={0.8}>
            <Text style={styles.planLinkText}>Plan overview →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.todaySub}>Your current plan</Text>

        {/* Elite Hero */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={{
              uri: 'https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/685bf886d23017768f4614b5_img%20(1).png',
            }}
            style={styles.heroImage}
            imageStyle={styles.heroImageRadius}
          >
            <View style={styles.heroOverlay} />

            {/* Top chips */}
            <View style={styles.heroTop}>
              <View style={styles.leftChips}>
                <View style={styles.chipLight}>
                  <Text style={styles.chipLightText}>
                    {phaseLabel} · {progressPct}%
                  </Text>
                </View>

                <View style={styles.chipDark}>
                  <Text style={styles.chipDarkText}>{todayLine}</Text>
                </View>
              </View>

              <View style={styles.chipOutline}>
                <Text style={styles.chipOutlineText}>Elite</Text>
              </View>
            </View>

            {/* Bottom content */}
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>{programTitle}</Text>
              <Text style={styles.heroMeta}>
                {weekLabel} · {workoutLabel} · {programMeta}
              </Text>

              {/* Progress bar */}
              <View style={styles.heroProgressBg}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${Math.max(0, Math.min(1, programProgress)) * 100}%` },
                  ]}
                />
              </View>

              {/* Metrics row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {programCompleted} / {programTotal} complete
                  </Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>~{estMinutes} min</Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>{streakDays}-day streak</Text>
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[
                  styles.heroCta,
                  ctaState === 'completed' ? styles.heroCtaDisabled : null,
                  ctaState === 'rest' ? styles.heroCtaDisabled : null,
                ]}
                onPress={onPressCta}
                activeOpacity={0.9}
              >
                <Text style={styles.heroCtaIcon}>{cta.icon}</Text>
                <Text style={styles.heroCtaText}>{cta.text}</Text>
              </TouchableOpacity>

              {/* Next up / hint */}
              <Text style={styles.heroHint}>{heroHint}</Text>

              {ctaState !== 'rest' && (
                <Text style={styles.heroNextUp}>
                  Next up: {workoutLabel} · {workoutName}
                </Text>
              )}

              {ctaState === 'rest' && (
                <Text style={styles.heroNextUp}>
                  Suggested: Mobility · 12 min
                </Text>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* Switch program */}
        <TouchableOpacity style={styles.switchProgram} activeOpacity={0.85}>
          <Text style={styles.switchText}>Switch Program</Text>
        </TouchableOpacity>

        {/* Quick Access */}
        <Text style={styles.quickTitle}>Quick Access</Text>

        <TouchableOpacity style={styles.quickCard} activeOpacity={0.86}>
          <View style={styles.quickIcon}>
            <Text style={styles.quickIconText}>≡</Text>
          </View>
          <Text style={styles.quickText}>Programs</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function getLuxuryGreetingTitle({
  ctaState,
  streakDays,
  weeklyDone,
}: {
  ctaState: CtaState;
  streakDays: number;
  weeklyDone: number;
}) {
  if (ctaState === 'completed') return 'Executed.';
  if (ctaState === 'rest') return 'Reset. Refine. Return.';
  if (streakDays >= 3) return 'Momentum looks good.';
  if (weeklyDone === 0) return 'Welcome back.';
  return 'Stay sharp.';
}

function getCtaCopy({
  ctaState,
  workoutLabel,
}: {
  ctaState: CtaState;
  workoutLabel: string;
}) {
  if (ctaState === 'resume') return { icon: '▶', text: 'Resume workout' };
  if (ctaState === 'completed') return { icon: '✓', text: 'Workout complete' };
  if (ctaState === 'rest') return { icon: '•', text: 'Recovery day' };
  return { icon: '▶', text: `Start workout: ${workoutLabel}` };
}

/* ───────────────────────── Styles ───────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    backgroundColor: Colors.surface,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  greetingSub: {
    fontSize: 15,
    color: Colors.muted,
    marginTop: 6,
    fontWeight: '600',
  },
  weekProgressBg: {
    marginTop: 12,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  weekProgressFill: {
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 999,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Today row */
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  todayTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  planLink: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  planLinkText: {
    fontSize: 15,
    color: Colors.muted,
    fontWeight: '700',
  },
  todaySub: {
    fontSize: 16,
    color: Colors.muted,
    marginTop: 8,
    marginBottom: 14,
    fontWeight: '700',
  },

  /* Hero */
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  heroImage: {
    width: '100%',
    height: 540,
    justifyContent: 'space-between',
  },
  heroImageRadius: {
    borderRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  heroTop: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftChips: {
    gap: 10,
  },
  chipLight: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipLightText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '800',
  },
  chipDark: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipDarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  chipOutline: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  chipOutlineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  heroBottom: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroMeta: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    fontWeight: '700',
  },

  heroProgressBg: {
    marginTop: 14,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },

  metricsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricPill: {
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  metricPillText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '800',
  },

  heroCta: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  heroCtaDisabled: {
    opacity: 0.82,
  },
  heroCtaIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '900',
  },
  heroCtaText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.1,
  },

  heroHint: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    fontWeight: '700',
  },
  heroNextUp: {
    marginTop: 10,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Switch program */
  switchProgram: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 26,
  },
  switchText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },

  /* Quick Access */
  quickTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    color: Colors.text,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  quickText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    color: Colors.muted,
    fontWeight: '800',
  },

  bottomSpacer: {
    height: 32,
  },
});
