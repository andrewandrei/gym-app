// app/(tabs)/progress.tsx
//
// All data comes from useProgressData().
// To wire Supabase: update the swap points inside useProgressData.ts.
// This file only handles UI.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { FontSize, FontWeight, Typography } from "@/styles/typography";
import { useAppTheme } from "../_providers/theme";
import {
  useProgressData,
  type CheckIn,
  type WeekEntry,
  type WeekSession,
} from "./useProgressData";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "program" | "performance" | "body";
type ProgramView = "week" | "month";

const MEAS_FIELDS = [
  { key:"waist" as const, label:"Waist", good:"down" as const },
  { key:"chest" as const, label:"Chest", good:"up"   as const },
  { key:"arm"   as const, label:"Arm",   good:"up"   as const },
];

// ─── SVG Sparkline ────────────────────────────────────────────────────────────

function Spark({
  data, color, width, height, strokeWidth = 1.8,
}: {
  data: number[]; color: string; width: number; height: number; strokeWidth?: number;
}) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 0.5, p = 3;
  const pts = data.map((v, i) => ({
    x: p + (i / (data.length - 1)) * (width - p * 2),
    y: height - p - ((v - min) / range) * (height - p * 2),
  }));
  const line = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <Svg width={width} height={height} style={{ overflow:"visible" }}>
      <Path d={line} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={3.5} fill={color} />
    </Svg>
  );
}

// ─── PR Toast ─────────────────────────────────────────────────────────────────

function PRToast({ name, gain, onDone }: { name:string; gain:string; onDone:()=>void }) {
  const { colors } = useAppTheme();
  const ty = useRef(new Animated.Value(-80)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue:0,   duration:380, easing:Easing.out(Easing.back(1.3)), useNativeDriver:true }),
      Animated.timing(op, { toValue:1,   duration:300, useNativeDriver:true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(ty, { toValue:-80, duration:280, useNativeDriver:true }),
        Animated.timing(op, { toValue:0,   duration:260, useNativeDriver:true }),
      ]).start(() => onDone());
    }, 4200);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View pointerEvents="none"
      style={[S.toast, { backgroundColor:colors.card, borderColor:colors.premium+"55", transform:[{translateY:ty}], opacity:op }]}>
      <View style={[S.toastIcon, { backgroundColor:colors.premium+"20", borderColor:colors.borderSubtle }]}>
        <Svg width={15} height={15} viewBox="0 0 18 18">
          <Path d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z" fill={colors.premium} />
        </Svg>
      </View>
      <View style={{ flex:1 }}>
        <Text style={[S.toastTitle, { color:colors.text }]}>New personal record</Text>
        <Text style={[S.toastSub, { color:colors.muted }]}>
          {name} — <Text style={{ color:"#22C55E", fontWeight:FontWeight.heavy }}>+{gain} kg</Text>
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Session detail panel ─────────────────────────────────────────────────────

function WeekDetailPanel({
  week, colors, isDark, onSessionPress,
}: {
  week: WeekEntry; colors:any; isDark:boolean;
  onSessionPress: (s: WeekSession) => void;
}) {
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const done  = week.sessions.filter(s => !s.planned && s.complete).length;
  const total = week.sessions.length;
  const statusLabel = week.upcoming ? "PLANNED" : week.current ? "IN PROGRESS" : "COMPLETED";
  const statusColor = week.upcoming ? colors.muted : colors.premium;

  return (
    <View style={{ paddingTop:16, borderTopWidth:StyleSheet.hairlineWidth, borderTopColor:colors.borderSubtle, marginTop:4 }}>
      {/* Header */}
      <View style={[S.row, { marginBottom:14 }]}>
        <View>
          <Text style={[S.eyebrow, { color:statusColor, marginBottom:3 }]}>{statusLabel}</Text>
          <Text style={[S.title3, { color:colors.text }]}>Week {week.n} — {week.label}</Text>
          <Text style={[S.caption, { color:colors.muted, marginTop:2 }]}>{week.dates}</Text>
        </View>
        <View style={{ alignItems:"flex-end" }}>
          <Text style={[S.caption, { color:colors.muted }]}>Sessions</Text>
          <Text style={{ fontSize:20, fontWeight:FontWeight.black, color:statusColor }}>
            {week.upcoming ? total : done}
            {!week.upcoming && <Text style={[S.caption, { color:colors.muted }]}>/{total}</Text>}
          </Text>
        </View>
      </View>

      {/* Sessions */}
      {week.sessions.map((s, i) => {
        const prs   = s.lifts.filter(l => l.includes("🏆"));
        const hasPR = prs.length > 0;
        return (
          <Pressable key={i}
            onPress={() => !s.planned && onSessionPress(s)}
            style={({ pressed }) => [{
              paddingVertical:12,
              borderTopWidth:StyleSheet.hairlineWidth,
              borderTopColor:colors.borderSubtle,
              opacity: s.planned ? 0.62 : pressed ? 0.76 : 1,
            }]}>
            <View style={[S.row, { alignItems:"flex-start", marginBottom:3 }]}>
              <Text style={[S.headline, {
                color: s.planned ? colors.muted : colors.text,
                fontWeight: s.complete ? FontWeight.heavy : FontWeight.bold,
                flex:1,
              }]}>{s.type}</Text>
              <View style={[S.pill, {
                backgroundColor: s.planned ? soft : s.complete ? "#22C55E" : "#F59E0B",
                borderColor:     s.planned ? colors.borderSubtle : "transparent",
                marginLeft:10,
                paddingHorizontal: s.planned ? 9 : 14,
                paddingVertical:   s.planned ? 3 : 6,
              }]}>
                <Text style={[S.pillText, {
                  color: s.planned ? colors.muted : "#FFFFFF",
                  fontSize: s.planned ? 10 : 13,
                  fontWeight: s.planned ? FontWeight.bold : FontWeight.heavy,
                }]}>{s.planned ? "Planned" : s.complete ? "Complete" : "Partial"}</Text>
              </View>
            </View>
            <Text style={[S.caption, { color:colors.muted, marginBottom: hasPR||s.planned ? 7 : 0 }]}>
              {s.date}{!s.planned && " · tap to view"}
            </Text>
            {s.planned ? (
              <View style={{ gap:2 }}>
                {s.lifts.map((l, j) => (
                  <Text key={j} style={[S.caption, { color:colors.muted }]}>{l}</Text>
                ))}
              </View>
            ) : hasPR ? (
              <View style={{ gap:4 }}>
                {prs.map((l, j) => (
                  <View key={j} style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                    <View style={{ width:4, height:4, borderRadius:2, backgroundColor:colors.premium }} />
                    <Text style={[S.caption, { color:colors.premium, fontWeight:FontWeight.bold }]}>
                      {l.replace("🏆", "").trim()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[S.caption, { color:colors.muted }]}>No PRs</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Program tab ──────────────────────────────────────────────────────────────

function ProgramTab({ router, colors, isDark, data }: {
  router:any; colors:any; isDark:boolean;
  data: ReturnType<typeof useProgressData>;
}) {
  const [view, setView]         = useState<ProgramView>("week");
  const [selWeek, setSelWeek]   = useState<number | null>(data.currentWeek);
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const {
    currentWeek, totalWeeks, phaseLabel,
    thisWeekDays, thisWeekDone, thisWeekTotal,
    weekHistory, monthData,
  } = data;

  const selectedWk = selWeek !== null ? weekHistory.find(w => w.n === selWeek) ?? null : null;

  async function handleSessionPress(s: WeekSession) {
    const prs = s.lifts.filter(l => l.includes("🏆")).map((l, i) => ({
      exerciseId: `ex-${i}`,
      exerciseName: l.split(" ").slice(0,2).join(" "),
      weight: l.match(/[\d.]+kg/)?.[0]?.replace("kg","") ?? "0",
      reps: l.match(/×(\d+)/)?.[1] ?? "3",
      type: "weight",
    }));
    const summary = {
      workoutTitle: s.type,
      durationSec: 2700,
      status: s.complete ? "completed" : "partial",
      totals: { completedSets:s.complete?12:7, totalSets:12, completedExercises:s.complete?4:3, totalExercises:4, totalVolume:4200, trackedStrengthVolume:4200 },
      insights: { completionRate:s.complete?1:0.58, prCount:prs.length, missingLoadCount:0, strengthSetCount:12, avgTrackedLoad:85, improvedExerciseCount:Math.max(prs.length,1), matchedExerciseCount:1, previousSessionFound:true },
      prs, wins: [],
      exercises: [{ id:"ex-1", name:s.type.includes("Upper")?"Bench Press":"Back Squat", completedSets:s.complete?4:3, totalSetsPlanned:4, unitLabel:"KG", sessionVolume:1200, comparedToLast:{ result:prs.length>0?"better":"same" }, sets:Array.from({length:s.complete?4:3},(_,i)=>({ set:i+1, weight:String(80+i*2.5), reps:"5", rest:"2:00", done:true })) }],
    };
    await AsyncStorage.setItem("aa_fit_finish_summary", JSON.stringify(summary));
    router.push("/workout/finish");
  }

  return (
    <View>
      {/* Toggle */}
      <View style={[S.row, { marginBottom:20 }]}>
        <Text style={[S.subhead, { color:colors.text }]}>Attendance</Text>
        <View style={[S.toggle, { backgroundColor:soft }]}>
          {(["week","month"] as const).map(v => (
            <Pressable key={v} onPress={() => setView(v)}
              style={[S.togBtn, view===v && { backgroundColor:colors.card, borderWidth:0.5, borderColor:colors.borderSubtle }]}>
              <Text style={[S.meta, { color:view===v?colors.text:colors.muted, fontWeight:view===v?FontWeight.heavy:FontWeight.bold }]}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── WEEK VIEW ── */}
      {view === "week" && (
        <View>
          <View style={[S.row, { marginBottom:13 }]}>
            <Text style={[S.caption, { color:colors.muted }]}>
              Week {currentWeek} · {phaseLabel} phase
            </Text>
            <Text style={[S.subhead, { color:colors.text }]}>
              {thisWeekDone}<Text style={[S.caption, { color:colors.muted }]}>/{thisWeekTotal} sessions</Text>
            </Text>
          </View>

          {/* Day blocks — derived from real schedule */}
          <View style={[S.daysRow, { marginBottom:26 }]}>
            {thisWeekDays.map((s, i) => {
              const isRest  = s.status === "rest";
              const isDone  = s.status === "done";
              const isToday = s.status === "today";
              return (
                <View key={i} style={S.dayCol}>
                  <Text style={[S.dayLetter, {
                    color: isToday ? colors.premium : colors.muted,
                    fontWeight: isToday ? FontWeight.black : FontWeight.bold,
                  }]}>{s.d}</Text>
                  <View style={[S.daySq, {
                    backgroundColor: isRest ? "transparent" : isDone ? colors.text : isToday ? colors.premium+"22" : soft,
                    borderWidth: isRest||isDone ? 0 : 0.5,
                    borderColor: isToday ? colors.premium+"80" : colors.borderSubtle,
                  }]}>
                    {isDone && (
                      <Svg width={11} height={11} viewBox="0 0 12 12">
                        <Path d="M2 6L5 9L10 3" stroke={isDark?"#111":"#fff"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </Svg>
                    )}
                    {isToday && <View style={{ width:4, height:4, borderRadius:2, backgroundColor:colors.premium }} />}
                    {s.status === "planned" && <View style={{ width:4, height:4, borderRadius:2, backgroundColor:colors.muted }} />}
                  </View>
                  <Text style={[S.dayType, {
                    color: isRest ? colors.muted : isDone ? colors.muted : isToday ? colors.premium : colors.muted,
                  }]}>{isRest ? "–" : s.type}</Text>
                </View>
              );
            })}
          </View>

          {/* Rule */}
          <View style={[S.divider, { backgroundColor:colors.borderSubtle, marginBottom:20 }]} />

          {/* Block dots */}
          <View style={[S.row, { marginBottom:14 }]}>
            <Text style={[S.caption, { color:colors.muted }]}>Block progress</Text>
            <Text style={[S.eyebrow, { color:colors.muted, letterSpacing:0.03 }]}>Tap a week</Text>
          </View>

          <View style={{ position:"relative", paddingBottom:26 }}>
            <View style={[S.dotTrackBg, { backgroundColor:colors.borderSubtle }]} />
            <View style={[S.dotTrackFg, {
              backgroundColor:colors.premium,
              width:`${((currentWeek-1)/(totalWeeks-1))*88+6}%`,
            }]} />
            <View style={{ flexDirection:"row" }}>
              {weekHistory.map((w, i) => {
                const done    = w.n < currentWeek;
                const current = w.n === currentWeek;
                const sel     = selWeek === w.n;
                return (
                  <Pressable key={i}
                    onPress={() => (done||current) ? setSelWeek(sel ? null : w.n) : null}
                    style={S.dotCol}>
                    <View style={[S.dot, {
                      width:  current||sel ? 14 : 10,
                      height: current||sel ? 14 : 10,
                      borderRadius:7,
                      backgroundColor: done ? colors.premium : current ? colors.background : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
                      borderWidth: current||sel ? 2.5 : 0,
                      borderColor: colors.premium,
                    }]} />
                    <Text style={[S.dotLabel, {
                      color: done||current ? colors.premium : colors.muted,
                      fontWeight: current||sel ? FontWeight.black : FontWeight.bold,
                    }]}>W{w.n}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {selWeek !== null && selectedWk && (
            <WeekDetailPanel
              week={selectedWk}
              colors={colors}
              isDark={isDark}
              onSessionPress={handleSessionPress}
            />
          )}

          {/* History link */}
          <Pressable onPress={() => router.push("/workout-history")}
            style={({ pressed }) => [S.linkRow, { borderTopColor:colors.borderSubtle, opacity:pressed?0.75:1, marginTop:10 }]}>
            <Text style={[S.body, { color:colors.muted }]}>View workout history</Text>
            <Svg width={7} height={12} viewBox="0 0 7 12">
              <Path d="M1 1L6 6L1 11" stroke={colors.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Pressable>
        </View>
      )}

      {/* ── MONTH VIEW ── */}
      {view === "month" && (
        <View>
          {/* Stats */}
          <View style={{ flexDirection:"row", gap:24, paddingBottom:18, borderBottomWidth:0.5, borderBottomColor:colors.borderSubtle, marginBottom:18 }}>
            {[
              { label:"Sessions",    value:String(monthData.totalSessions), color:colors.premium },
              { label:"This week",   value:`${monthData.thisWeekDone}/${monthData.thisWeekTotal}`, color:colors.text },
              { label:"Consistency", value:`${monthData.consistency}%`, color:"#22C55E" },
            ].map((s, i) => (
              <View key={i}>
                <Text style={{ fontSize:22, fontWeight:FontWeight.black, color:s.color, letterSpacing:-0.3 }}>{s.value}</Text>
                <Text style={[S.caption, { color:colors.muted, marginTop:3 }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[S.subhead, { color:colors.text, marginBottom:14 }]}>{monthData.label}</Text>

          {/* Day headers */}
          <View style={{ flexDirection:"row", marginBottom:5 }}>
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <Text key={i} style={[S.eyebrow, { flex:1, textAlign:"center", color:colors.muted }]}>{d}</Text>
            ))}
          </View>

          {/* Circle calendar — row-by-row for proper gaps */}
          {(() => {
            const { offset, daysInMonth, today } = monthData;
            const count = Math.ceil((daysInMonth + offset) / 7) * 7;
            const cells = Array.from({ length:count }, (_, i) => i - offset + 1);
            const rows: number[][] = [];
            for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i+7));
            return rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection:"row", gap:4, marginBottom:4 }}>
                {row.map((d, ci) => {
                  if (d < 1 || d > daysInMonth) return <View key={ci} style={S.calCircle} />;
                  const cell = monthData.days.find(c => c.dayNum === d);
                  const tr  = cell?.trained ?? false;
                  const isT = cell?.isToday ?? false;
                  const fut = cell?.future  ?? false;
                  return (
                    <View key={ci} style={[S.calCircle, {
                      backgroundColor: tr ? colors.premium : isT ? colors.premium+"22" : soft,
                      borderWidth: isT&&!tr ? 0.5 : 0,
                      borderColor: colors.premium,
                      opacity: fut ? 0.3 : 1,
                    }]}>
                      <Text style={[S.calNum, {
                        color: tr ? "#111" : isT ? colors.premium : colors.muted,
                        fontWeight: tr||isT ? FontWeight.bold : FontWeight.medium,
                        fontSize: 9,
                      }]}>{d}</Text>
                      {tr && cell?.type && (
                        <Text style={{ fontSize:5, color:"#111", fontWeight:FontWeight.black }}>{cell.type}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ));
          })()}

          {/* Legend */}
          <View style={{ flexDirection:"row", gap:16, marginTop:12 }}>
            {[
              { color:colors.premium, label:"Trained" },
              { color:colors.premium+"22", border:colors.premium, label:"Today" },
              { color:soft, label:"Rest" },
            ].map((l, i) => (
              <View key={i} style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                <View style={{ width:10, height:10, borderRadius:5, backgroundColor:l.color, borderWidth:l.border?0.5:0, borderColor:l.border }} />
                <Text style={[S.caption, { color:colors.muted }]}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Performance tab ──────────────────────────────────────────────────────────

function PerformanceTab({ exerciseCards, colors, isDark }: {
  exerciseCards: any[]; colors:any; isDark:boolean;
}) {
  const [openId, setOpenId] = useState<string|null>(null);
  const soft = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const prCount = exerciseCards.filter(e => (e.trend?.prCount??0) > 0).length;

  return (
    <View>
      <View style={[S.row, { marginBottom:5 }]}>
        <Text style={[S.subhead, { color:colors.text }]}>All Exercises</Text>
        <View style={[S.pill, { backgroundColor:colors.premium+"18", borderColor:colors.premium+"30" }]}>
          <Text style={[S.pillText, { color:colors.premium }]}>{prCount} PRs this block</Text>
        </View>
      </View>
      <Text style={[S.caption, { color:colors.muted, marginBottom:5 }]}>Tap to expand</Text>

      {exerciseCards.length === 0 ? (
        <View style={[S.card, { backgroundColor:colors.card, borderColor:colors.borderSubtle, padding:24, alignItems:"center" }]}>
          <Text style={[S.body, { color:colors.muted, textAlign:"center" }]}>
            Complete workouts to see your exercise progress here.
          </Text>
        </View>
      ) : exerciseCards.map((ex, i) => {
        const open    = openId === ex.exerciseId;
        const hasPR   = (ex.trend?.prCount??0) > 0;
        const gain    = ex.recentDelta?.weight ?? 0;
        const gainPct = ex.bestWeight && gain ? Math.round((gain/(ex.bestWeight-gain))*100) : 0;
        const chart   = ex.bestWeight ? [ex.bestWeight-gain*2, ex.bestWeight-gain, ex.bestWeight] : [];

        return (
          <Pressable key={ex.exerciseId ?? i} onPress={() => setOpenId(open ? null : ex.exerciseId)}
            style={[S.exCard, {
              backgroundColor: hasPR ? colors.premium+"10" : colors.card,
              borderColor:     hasPR ? colors.premium+"40" : colors.borderSubtle,
              marginBottom:8,
            }]}>
            <View style={[S.exRow, { padding:14 }]}>
              <View style={[S.exDot, { backgroundColor:hasPR ? colors.premium : isDark?"rgba(255,255,255,0.20)":"rgba(0,0,0,0.15)" }]} />
              <View style={{ flex:1 }}>
                <Text style={[S.headline, { color:colors.text, fontWeight:hasPR?FontWeight.heavy:FontWeight.bold }]}>
                  {ex.exerciseName}
                </Text>
                <Text style={[S.caption, { color:colors.muted, marginTop:3 }]}>
                  {ex.sessionsLogged} sessions
                </Text>
              </View>
              {!open && chart.length > 1 && <Spark data={chart} color={colors.premium} width={56} height={26} strokeWidth={1.5} />}
              <View style={{ alignItems:"flex-end", marginRight:4 }}>
                {gain !== 0 && <Text style={{ fontSize:FontSize.subhead, fontWeight:FontWeight.heavy, color:"#22C55E" }}>{gain>0?"+":""}{gain.toFixed(1)} kg</Text>}
                {gainPct !== 0 && <Text style={[S.caption, { color:colors.muted, marginTop:2 }]}>{gainPct>0?"+":""}{gainPct}%</Text>}
              </View>
              <Text style={[S.caption, { color:colors.muted }]}>{open ? "▴" : "▾"}</Text>
            </View>
            {open && (
              <View style={[S.exExpanded, { borderTopColor:colors.borderSubtle, padding:14 }]}>
                {chart.length > 1 && (
                  <>
                    <Spark data={chart} color={colors.premium} width={310} height={52} strokeWidth={2} />
                    <View style={{ flexDirection:"row", justifyContent:"space-between", marginTop:6, marginBottom:14 }}>
                      {chart.map((v, j) => (
                        <View key={j} style={{ alignItems:"center" }}>
                          <Text style={{ fontSize:8, color:j===chart.length-1?colors.premium:colors.muted }}>W{ex.sessionsLogged-chart.length+j+1}</Text>
                          <Text style={{ fontSize:9, color:j===chart.length-1?colors.premium:colors.muted, fontWeight:j===chart.length-1?FontWeight.heavy:FontWeight.medium, marginTop:2 }}>{v}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
                <View style={{ flexDirection:"row", gap:8 }}>
                  {ex.bestWeight && (
                    <View style={[S.statTile, { backgroundColor:soft, flex:1 }]}>
                      <Text style={[S.eyebrow, { color:colors.muted, marginBottom:6 }]}>Best weight</Text>
                      <Text style={[S.title3, { color:colors.text }]}>{ex.bestWeight} kg</Text>
                    </View>
                  )}
                  {gain !== 0 && (
                    <View style={[S.statTile, { backgroundColor:soft, flex:1 }]}>
                      <Text style={[S.eyebrow, { color:colors.muted, marginBottom:6 }]}>Gain</Text>
                      <Text style={[S.title3, { color:"#22C55E" }]}>{gain>0?"+":""}{gain.toFixed(1)} kg</Text>
                    </View>
                  )}
                  {ex.latestSession && (
                    <View style={[S.statTile, { backgroundColor:soft, flex:1 }]}>
                      <Text style={[S.eyebrow, { color:colors.muted, marginBottom:6 }]}>Last session</Text>
                      <Text style={[S.title3, { color:colors.text }]}>{ex.latestSession.completedSets}/{ex.latestSession.totalSetsPlanned}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Body tab ─────────────────────────────────────────────────────────────────

function BodyTab({
  checkins, onNewCheckin, colors, isDark,
}: {
  checkins: CheckIn[]; onNewCheckin:()=>void; colors:any; isDark:boolean;
}) {
  const [compareIdx, setCompareIdx] = useState<number|null>(null);
  const [angleIdx,   setAngleIdx]   = useState(0);
  const ANGLES = ["Front","Side","Back"];
  const soft   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const latest = checkins[checkins.length-1];
  const first  = checkins[0];
  const wDelta = +(latest.weight - first.weight).toFixed(1);
  const wDown  = wDelta < 0;

  return (
    <View style={{ gap:14 }}>

      {/* Weight card */}
      <View style={[S.bCard, { backgroundColor:colors.card, borderColor:colors.borderSubtle }]}>
        <Text style={[S.eyebrow, { color:colors.muted, marginBottom:10 }]}>BODY WEIGHT</Text>
        <View style={[S.row, { marginBottom:14, alignItems:"flex-end" }]}>
          <View>
            <View style={{ flexDirection:"row", alignItems:"baseline", gap:7 }}>
              <Text style={[S.weightBig, { color:colors.text }]}>{latest.weight}</Text>
              <Text style={[S.caption, { color:colors.muted }]}>kg</Text>
              <View style={[S.pill, { backgroundColor:wDown?"#22C55E18":"#EF444418", borderColor:wDown?"#22C55E40":"#EF444440" }]}>
                <Text style={[S.pillText, { color:wDown?"#22C55E":"#EF4444" }]}>{wDelta>0?"+":""}{wDelta} kg</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems:"flex-end" }}>
            <Text style={[S.caption, { color:colors.muted }]}>Block start</Text>
            <Text style={[S.subhead, { color:colors.muted, marginTop:2 }]}>{first.weight} kg</Text>
          </View>
        </View>
        <Spark data={checkins.map(c=>c.weight)} color={colors.text} width={315} height={52} strokeWidth={2} />
        <View style={[S.row, { marginTop:6 }]}>
          {checkins.map((c,i) => (
            <Text key={i} style={[S.caption, { color:i===checkins.length-1 ? colors.text : colors.muted }]}>{c.date}</Text>
          ))}
        </View>
      </View>

      {/* Measurements card */}
      <View style={[S.bCard, { backgroundColor:colors.card, borderColor:colors.borderSubtle }]}>
        <Text style={[S.subhead, { color:colors.text, marginBottom:14 }]}>Measurements</Text>
        {MEAS_FIELDS.map((f, i) => {
          const vals  = checkins.map(c => c.meas[f.key]);
          const delta = +(vals[vals.length-1] - vals[0]).toFixed(1);
          const good  = f.good==="down" ? delta<0 : delta>0;
          const col   = delta===0 ? colors.muted : good ? "#22C55E" : "#EF4444";
          return (
            <View key={f.key} style={[S.measRow, {
              borderTopColor:colors.borderSubtle,
              borderTopWidth: i===0 ? 0 : StyleSheet.hairlineWidth,
              paddingTop: i===0 ? 0 : 11,
            }]}>
              <View style={{ width:72, flexShrink:0 }}>
                <Text style={[S.caption, { color:colors.muted }]}>{f.label}</Text>
                <Text style={[S.headline, { color:colors.text, marginTop:2 }]}>
                  {vals[vals.length-1]}<Text style={[S.caption, { color:colors.muted }]}> cm</Text>
                </Text>
              </View>
              <View style={{ flex:1, alignItems:"center" }}>
                <Spark data={vals} color={colors.text} width={100} height={28} strokeWidth={1.6} />
              </View>
              <View style={{ width:44, alignItems:"flex-end", flexShrink:0 }}>
                <Text style={[S.subhead, { color:col, fontWeight:FontWeight.heavy }]}>{delta>0?"+":""}{delta}</Text>
                <Text style={[S.caption, { color:colors.muted }]}>cm</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Photos card */}
      <View style={[S.bCard, { backgroundColor:colors.card, borderColor:colors.borderSubtle }]}>
        <View style={[S.row, { marginBottom:16 }]}>
          <Text style={[S.subhead, { color:colors.text }]}>Progress Photos</Text>
          <Text style={[S.caption, { color:colors.muted }]}>{checkins.length} check-ins</Text>
        </View>

        {/* Angle tabs */}
        <View style={{ flexDirection:"row", gap:6, marginBottom:18 }}>
          {ANGLES.map((a, i) => (
            <Pressable key={i} onPress={() => setAngleIdx(i)}
              style={[S.angleTab, { backgroundColor:angleIdx===i?soft:"transparent", borderWidth:angleIdx===i?0.5:0, borderColor:colors.borderSubtle }]}>
              <Text style={[S.caption, { color:angleIdx===i?colors.text:colors.muted, fontWeight:angleIdx===i?FontWeight.heavy:FontWeight.bold }]}>{a}</Text>
            </Pressable>
          ))}
        </View>

        {/* Before / Now */}
        <View style={{ flexDirection:"row", gap:10, marginBottom:14 }}>
          {([
            { label:"BEFORE", accent:false },
            { label:"NOW",    accent:true  },
          ] as const).map((slot, j) => (
            <View key={j} style={{ flex:1 }}>
              <Text style={[S.eyebrow, { textAlign:"center", color:slot.accent?colors.premium:colors.muted, marginBottom:8 }]}>{slot.label}</Text>
              <View style={[S.photoSlot, {
                backgroundColor:soft,
                borderColor: j===0 ? (compareIdx!==null?colors.borderSubtle:colors.premium+"50") : colors.premium+"50",
              }]}>
                {j===0 && compareIdx===null ? (
                  <>
                    <Svg width={22} height={22} viewBox="0 0 24 24" opacity={0.45}>
                      <Path d="M14.5 4h-5L8 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1h-4l-1.5-3z" stroke={colors.premium} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <Circle cx={12} cy={13} r={3} stroke={colors.premium} strokeWidth={1.6} fill="none" />
                    </Svg>
                    <Text style={[S.caption, { color:colors.premium, fontWeight:FontWeight.bold, textAlign:"center", paddingHorizontal:8 }]}>
                      Pick a date below
                    </Text>
                  </>
                ) : (
                  <>
                    <Svg width={22} height={22} viewBox="0 0 24 24" opacity={0.28}>
                      <Path d="M14.5 4h-5L8 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1h-4l-1.5-3z" stroke={colors.muted} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <Circle cx={12} cy={13} r={3} stroke={colors.muted} strokeWidth={1.6} fill="none" />
                    </Svg>
                    <Text style={[S.caption, { color:colors.muted, textAlign:"center", paddingHorizontal:10 }]}>
                      {j===0 ? `No photo\n${checkins[compareIdx!]?.date ?? ""}` : "No photo yet\nadd in check-in"}
                    </Text>
                    <Text style={{ fontSize:9, color:colors.muted, marginTop:2 }}>
                      {j===0 ? checkins[compareIdx!]?.date ?? "" : latest.date}
                    </Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Compare label + horizontal scroll pills */}
        <View style={[S.row, { marginBottom:10 }]}>
          <Text style={[S.subhead, { fontSize:13 }]}>{/* set color below */}
            <Text style={{ color:colors.text }}>Compare with</Text>
          </Text>
          {compareIdx !== null && (
            <Text style={[S.caption, { color:colors.muted }]}>{checkins[compareIdx]?.date} selected</Text>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap:8, paddingBottom:4 }}>
          {checkins.slice(0,-1).map((c, i) => {
            const sel = compareIdx === i;
            return (
              <Pressable key={i} onPress={() => setCompareIdx(sel ? null : i)}
                style={[S.comparePill, {
                  backgroundColor: sel ? colors.premium+"16" : isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",
                  borderColor: sel ? colors.premium+"50" : colors.borderSubtle,
                }]}>
                <Text style={{ fontSize:12, fontWeight:sel?FontWeight.heavy:FontWeight.bold, color:sel?colors.premium:colors.muted }}>
                  {c.date}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Selected detail */}
        {compareIdx !== null && (() => {
          const c = checkins[compareIdx];
          const delta = +(latest.weight - c.weight).toFixed(1);
          const isDown = delta < 0;
          return (
            <View style={[S.compareDetail, {
              backgroundColor:colors.premium+"10",
              borderColor:colors.premium+"35",
              marginTop:12,
            }]}>
              <View style={S.row}>
                <View>
                  <Text style={[S.subhead, { color:colors.premium, fontSize:13 }]}>{c.date}</Text>
                  <Text style={[S.caption, { color:colors.muted, marginTop:2 }]}>Week {compareIdx+1} · {c.weight} kg</Text>
                </View>
                <View style={{ alignItems:"flex-end" }}>
                  <Text style={[S.subhead, { color:isDown?"#22C55E":"#EF4444", fontWeight:FontWeight.heavy }]}>
                    {delta>0?"+":""}{delta} kg
                  </Text>
                  <Text style={[S.caption, { color:colors.muted }]}>since then</Text>
                </View>
              </View>
            </View>
          );
        })()}

        <Text style={[S.caption, { textAlign:"center", marginTop:10, fontSize:10, color:colors.muted }]}>
          Swipe photos left/right to change angle
        </Text>

        <Pressable onPress={onNewCheckin}
          style={[S.checkinBtn, { backgroundColor:colors.premium+"14", borderColor:colors.premium+"45", marginTop:14 }]}>
          <Text style={[S.subhead, { color:colors.premium }]}>+ New Check-in</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Check-in sheet ───────────────────────────────────────────────────────────

function CheckInSheet({ visible, onClose, onSubmit, last, colors, isDark }: {
  visible:boolean; onClose:()=>void; onSubmit:(c:Omit<CheckIn,"id">)=>void; last:CheckIn; colors:any; isDark:boolean;
}) {
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState("");
  const [meas, setMeas] = useState({ waist:"", chest:"", arm:"" });
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const now = new Date();
  const isoDate = now.toISOString().split("T")[0];
  const dateLabel = now.toLocaleDateString("en-US", { month:"short", day:"numeric" });

  function submit() {
    onSubmit({
      date: dateLabel,
      isoDate,
      weight: parseFloat(weight)||last.weight,
      meas: {
        waist: parseFloat(meas.waist)||last.meas.waist,
        chest: parseFloat(meas.chest)||last.meas.chest,
        arm:   parseFloat(meas.arm)  ||last.meas.arm,
      },
    });
    setStep(3);
  }
  function reset() { setStep(0); setWeight(""); setMeas({ waist:"", chest:"", arm:"" }); onClose(); }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={reset}>
      <Pressable style={S.modalBg} onPress={reset} />
      <View style={[S.sheet, { backgroundColor:colors.surface, borderColor:colors.borderSubtle }]}>
        <View style={[S.handle, { backgroundColor:isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.12)" }]} />

        {step < 3 && (
          <View style={{ paddingHorizontal:20, paddingTop:14 }}>
            <View style={S.row}>
              <View>
                <Text style={[S.eyebrow, { color:colors.muted, marginBottom:4 }]}>WEEKLY CHECK-IN</Text>
                <Text style={[S.title2, { color:colors.text }]}>{["Weight","Measurements","Photos"][step]}</Text>
              </View>
              <Pressable onPress={reset} style={[S.closeBtn, { backgroundColor:soft, borderColor:colors.borderSubtle }]}>
                <Text style={[S.body, { color:colors.muted, fontSize:18 }]}>×</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection:"row", gap:5, marginTop:12 }}>
              {[0,1,2].map(i => <View key={i} style={[S.progBar, { backgroundColor:i<=step?colors.premium:soft }]} />)}
            </View>
          </View>
        )}

        {step===0 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color:colors.muted, marginBottom:20 }]}>
              Last: <Text style={{ color:colors.text, fontWeight:FontWeight.heavy }}>{last.weight} kg</Text>
            </Text>
            <View style={{ flexDirection:"row", justifyContent:"center", alignItems:"center", gap:10, marginBottom:28 }}>
              <TextInput value={weight} onChangeText={setWeight} placeholder={String(last.weight)}
                placeholderTextColor={colors.muted} keyboardType="numeric"
                style={[S.bigInput, { backgroundColor:soft, borderColor:colors.borderSubtle, color:colors.text }]} />
              <Text style={[S.body, { color:colors.muted }]}>kg</Text>
            </View>
            <Pressable onPress={() => setStep(1)} style={[S.primaryBtn, { backgroundColor:colors.text }]}>
              <Text style={[S.btnText, { color:colors.surface }]}>Continue</Text>
            </Pressable>
          </View>
        )}

        {step===1 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color:colors.muted, marginBottom:16 }]}>All optional</Text>
            <View style={{ gap:10, marginBottom:24 }}>
              {MEAS_FIELDS.map(f => {
                const cur = parseFloat(meas[f.key]);
                const lastV = last.meas[f.key];
                const delta = cur ? +(cur - lastV).toFixed(1) : null;
                const good  = delta ? (f.good==="down" ? delta<0 : delta>0) : null;
                return (
                  <View key={f.key} style={[S.measInputRow, { backgroundColor:soft, borderColor:colors.borderSubtle }]}>
                    <View>
                      <Text style={[S.subhead, { color:colors.muted }]}>{f.label}</Text>
                      <Text style={[S.caption, { color:colors.muted }]}>Last: {lastV} cm</Text>
                    </View>
                    <View style={{ flexDirection:"row", alignItems:"center", gap:10 }}>
                      {delta !== null && <Text style={[S.caption, { color:good?"#22C55E":"#EF4444", fontWeight:FontWeight.heavy }]}>{delta>0?"+":""}{delta}</Text>}
                      <View style={[S.measWrap, { backgroundColor:colors.card, borderColor:colors.borderSubtle }]}>
                        <TextInput value={meas[f.key as keyof typeof meas]}
                          onChangeText={t => setMeas(m=>({...m,[f.key]:t}))}
                          placeholder={String(lastV)} placeholderTextColor={colors.muted}
                          keyboardType="numeric"
                          style={[S.measInput, { color:colors.text }]} />
                        <Text style={[S.caption, { color:colors.muted, paddingRight:10 }]}>cm</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection:"row", gap:10 }}>
              <Pressable onPress={() => setStep(0)} style={[S.ghostBtn, { flex:1, borderColor:colors.borderSubtle }]}>
                <Text style={[S.btnText, { color:colors.muted }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => setStep(2)} style={[S.primaryBtn, { flex:2, backgroundColor:colors.text }]}>
                <Text style={[S.btnText, { color:colors.surface }]}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step===2 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color:colors.muted, marginBottom:16 }]}>Private — visible only to you and your coach</Text>
            <View style={[S.photoPlaceholder, { backgroundColor:soft, borderColor:colors.borderSubtle }]}>
              <Text style={{ fontSize:26, color:colors.muted, marginBottom:8 }}>📷</Text>
              <Text style={[S.subhead, { color:colors.text }]}>Photo upload</Text>
              <Text style={[S.caption, { color:colors.muted, textAlign:"center", marginTop:4 }]}>
                Run: npx expo install expo-image-picker
              </Text>
            </View>
            <View style={{ flexDirection:"row", gap:10, marginTop:20 }}>
              <Pressable onPress={() => setStep(1)} style={[S.ghostBtn, { flex:1, borderColor:colors.borderSubtle }]}>
                <Text style={[S.btnText, { color:colors.muted }]}>Back</Text>
              </Pressable>
              <Pressable onPress={submit} style={[S.primaryBtn, { flex:2, backgroundColor:colors.text }]}>
                <Text style={[S.btnText, { color:colors.surface }]}>Save check-in</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step===3 && (
          <View style={[S.sheetBody, { alignItems:"center", paddingVertical:32 }]}>
            <View style={[S.doneCircle, { backgroundColor:colors.premium+"20", borderColor:colors.premium+"45" }]}>
              <Text style={{ fontSize:20, color:colors.premium }}>✓</Text>
            </View>
            <Text style={[S.title2, { color:colors.text, marginBottom:6 }]}>Check-in saved</Text>
            <Text style={[S.body, { color:colors.muted, marginBottom:28 }]}>Your coach will review shortly</Text>
            <Pressable onPress={reset} style={[S.primaryBtn, { backgroundColor:colors.text, width:"100%" }]}>
              <Text style={[S.btnText, { color:colors.surface }]}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Share modal ──────────────────────────────────────────────────────────────

function ShareModal({ visible, onClose, data, colors, isDark }: {
  visible:boolean; onClose:()=>void;
  data: ReturnType<typeof useProgressData>;
  colors:any; isDark:boolean;
}) {
  const [mode, setMode] = useState<"social"|"coach">("social");
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const { checkins, weekHistory, programTitle, programSubtitle, currentWeek, totalWeeks } = data;
  const first  = checkins[0];
  const latest = checkins[checkins.length-1];
  const wDelta = +(latest.weight - first.weight).toFixed(1);
  const wDown  = wDelta < 0;

  const allSessions  = weekHistory.flatMap(w => w.sessions.filter(s => !s.planned));
  const doneS        = allSessions.filter(s => s.complete).length;
  const totalS       = allSessions.length;
  const pct          = Math.round((doneS/totalS)*100);
  const topPRs       = weekHistory.flatMap(w => w.sessions.flatMap(s => s.lifts.filter(l => l.includes("🏆")).map(l => l.replace("🏆","").trim()))).slice(0,3);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <Pressable style={S.modalBg} onPress={onClose} />
      <View style={[S.sheet, { backgroundColor:colors.surface, borderColor:colors.borderSubtle }]}>
        <View style={[S.handle, { backgroundColor:isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.12)" }]} />
        <View style={[S.row, { paddingHorizontal:20, paddingTop:14 }]}>
          <Text style={[S.title2, { color:colors.text }]}>Share Progress</Text>
          <Pressable onPress={onClose} style={[S.closeBtn, { backgroundColor:soft, borderColor:colors.borderSubtle }]}>
            <Text style={[S.body, { color:colors.muted, fontSize:18 }]}>×</Text>
          </Pressable>
        </View>
        <View style={[S.modeToggle, { backgroundColor:soft, margin:16 }]}>
          {(["social","coach"] as const).map(m => (
            <Pressable key={m} onPress={() => setMode(m)}
              style={[S.modeBtn, { backgroundColor:mode===m?colors.card:"transparent", borderColor:mode===m?colors.borderSubtle:"transparent" }]}>
              <Text style={[S.caption, { color:mode===m?colors.text:colors.muted, fontWeight:mode===m?FontWeight.heavy:FontWeight.bold, fontSize:FontSize.subhead }]}>
                {m==="social"?"Share Card":"Send to Coach"}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingBottom:32 }}>
          {mode==="social" ? (
            <>
              <View style={[S.shareCard, { backgroundColor:isDark?colors.card:"#1A1A1A", borderColor:colors.premium+"40" }]}>
                <View style={S.row}>
                  <Text style={[S.eyebrow, { color:"rgba(255,255,255,0.4)" }]}>PROGRESS REPORT</Text>
                  <Text style={[S.eyebrow, { color:colors.premium }]}>GYM APP</Text>
                </View>
                <Text style={[S.title2, { color:"#FFFFFF", marginTop:14 }]}>{programTitle}</Text>
                <Text style={[S.caption, { color:"rgba(255,255,255,0.45)", marginTop:4, marginBottom:18 }]}>{programSubtitle}</Text>
                <View style={{ flexDirection:"row", gap:8, marginBottom:topPRs.length?16:0 }}>
                  {[
                    { label:"Body weight", value:`${wDelta>0?"+":""}${wDelta} kg`, color:wDown?"#22C55E":"#EF4444" },
                    { label:"Sessions",    value:`${doneS}/${totalS}`,             color:colors.premium },
                    { label:"PRs hit",     value:`${topPRs.length}+`,              color:colors.premium },
                  ].map((s, i) => (
                    <View key={i} style={[S.shareStatTile, { backgroundColor:"rgba(255,255,255,0.07)" }]}>
                      <Text style={[S.title3, { color:s.color, textAlign:"center" }]}>{s.value}</Text>
                      <Text style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:3, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                {topPRs.map((pr, i) => (
                  <View key={i} style={{ flexDirection:"row", alignItems:"center", gap:8, marginTop:6 }}>
                    <View style={{ width:5, height:5, borderRadius:3, backgroundColor:colors.premium }} />
                    <Text style={{ fontSize:11, color:"#EDEAE2" }}>{pr}</Text>
                  </View>
                ))}
                <View style={[S.shareConsistency, { borderTopColor:"rgba(255,255,255,0.08)" }]}>
                  <Text style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Consistency</Text>
                  <View style={{ flex:1, height:2, backgroundColor:"rgba(255,255,255,0.12)", borderRadius:1, overflow:"hidden" }}>
                    <View style={{ width:`${pct}%`, height:"100%", backgroundColor:colors.premium, borderRadius:1 } as any} />
                  </View>
                  <Text style={{ fontSize:11, fontWeight:FontWeight.heavy, color:colors.premium }}>{pct}%</Text>
                </View>
              </View>
              <Text style={[S.caption, { color:colors.muted, textAlign:"center", marginVertical:14 }]}>
                Screenshot this card to share on Instagram or WhatsApp
              </Text>
              <Pressable style={[S.primaryBtn, { backgroundColor:colors.text }]}>
                <Text style={[S.btnText, { color:colors.surface }]}>Share ↑</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[S.coachSummary, { backgroundColor:soft, borderColor:colors.borderSubtle }]}>
                <Text style={[S.eyebrow, { color:colors.muted, marginBottom:12 }]}>SUMMARY FOR COACH</Text>
                {[
                  { key:"Body weight", val:`${latest.weight} kg`, delta:`${wDelta>0?"+":""}${wDelta}`, good:wDown },
                  ...MEAS_FIELDS.map(f => { const d=+(latest.meas[f.key]-first.meas[f.key]).toFixed(1); return { key:f.label, val:`${latest.meas[f.key]} cm`, delta:`${d>0?"+":""}${d}`, good:f.good==="down"?d<0:d>0 }; }),
                  { key:"Attendance", val:`${doneS}/${totalS}`, delta:`${pct}%`, good:pct>=80 },
                ].map((r, i, arr) => (
                  <View key={i} style={[S.coachRow, { borderBottomColor:colors.borderSubtle, borderBottomWidth:i<arr.length-1?StyleSheet.hairlineWidth:0 }]}>
                    <Text style={[S.body, { color:colors.muted, flex:1 }]}>{r.key}</Text>
                    <Text style={[S.subhead, { color:colors.text }]}>{r.val}</Text>
                    <Text style={[S.subhead, { color:r.good?"#22C55E":"#EF4444", marginLeft:10, minWidth:44, textAlign:"right", fontWeight:FontWeight.heavy }]}>{r.delta}</Text>
                  </View>
                ))}
              </View>
              <TextInput value={note} onChangeText={setNote} multiline
                placeholder="Add a note for your coach... (optional)"
                placeholderTextColor={colors.muted}
                style={[S.noteInput, { backgroundColor:soft, borderColor:colors.borderSubtle, color:colors.text }]} />
              {sent ? (
                <View style={[S.primaryBtn, { backgroundColor:"#22C55E18", borderWidth:StyleSheet.hairlineWidth, borderColor:"#22C55E40" }]}>
                  <Text style={[S.btnText, { color:"#22C55E" }]}>✓ Sent to your coach</Text>
                </View>
              ) : (
                <Pressable onPress={() => { setSent(true); setTimeout(()=>{ setSent(false); onClose(); },2200); }}
                  style={[S.primaryBtn, { backgroundColor:colors.text }]}>
                  <Text style={[S.btnText, { color:colors.surface }]}>Send to Coach ›</Text>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [tab,         setTab]         = useState<TabKey>("program");
  const [showCheckin, setShowCheckin] = useState(false);
  const [showShare,   setShowShare]   = useState(false);
  const [prToast,     setPrToast]     = useState<{name:string;gain:string}|null>(null);

  const data = useProgressData("strength-foundations");
  const { checkins, addCheckin, loading, refresh, programTitle, programSubtitle } = data;

  // Demo PR toast — in production fire from workout/finish.tsx
  useEffect(() => {
    const t = setTimeout(() => setPrToast({ name:"Back Squat", gain:"7.5" }), 1600);
    return () => clearTimeout(t);
  }, []);

  const TABS: Array<{key:TabKey;label:string}> = [
    { key:"program",     label:"Program"     },
    { key:"performance", label:"Performance" },
    { key:"body",        label:"Body"        },
  ];

  return (
    <SafeAreaView style={[S.safe, { backgroundColor:colors.background }]} edges={["top"]}>

      {prToast && <PRToast name={prToast.name} gain={prToast.gain} onDone={() => setPrToast(null)} />}

      <CheckInSheet
        visible={showCheckin} onClose={() => setShowCheckin(false)}
        onSubmit={c => { addCheckin(c); setShowCheckin(false); }}
        last={checkins[checkins.length-1]} colors={colors} isDark={isDark}
      />

      <ShareModal
        visible={showShare} onClose={() => setShowShare(false)}
        data={data} colors={colors} isDark={isDark}
      />

      {/* Header */}
      <View style={[S.row, { paddingHorizontal:Spacing.md, paddingBottom:4 }]}>
        <ScreenHeader title={programTitle} subtitle={programSubtitle} />
        <Pressable onPress={() => setShowShare(true)}
          style={[S.shareBtn, {
            backgroundColor: isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)",
            borderColor: colors.borderSubtle,
          }]}>
          <Text style={[S.body, { color:colors.muted }]}>↑</Text>
        </Pressable>
      </View>

      {/* Tabs — underline, no pill */}
      <View style={[S.tabBar, { borderBottomColor:colors.borderSubtle, paddingHorizontal:Spacing.md }]}>
        {TABS.map(t => (
          <Pressable key={t.key} onPress={() => setTab(t.key)}
            style={[S.tabItem, tab===t.key && { borderBottomColor:colors.text }]}>
            <Text style={[S.tabText, { color:tab===t.key?colors.text:colors.muted, fontWeight:tab===t.key?FontWeight.heavy:FontWeight.medium }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ padding:Spacing.md, paddingBottom:48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.muted} />}
      >
        {tab==="program"     && <ProgramTab     router={router} colors={colors} isDark={isDark} data={data} />}
        {tab==="performance" && <PerformanceTab exerciseCards={data.exerciseCards} colors={colors} isDark={isDark} />}
        {tab==="body"        && <BodyTab        checkins={checkins} onNewCheckin={() => setShowCheckin(true)} colors={colors} isDark={isDark} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  safe:        { flex:1 },
  tabBar:      { flexDirection:"row", borderBottomWidth:0.5, marginBottom:0 },
  tabItem:     { flex:1, paddingVertical:10, alignItems:"center", borderBottomWidth:2, borderBottomColor:"transparent" },
  tabText:     { ...Typography.subhead },
  shareBtn:    { width:34, height:34, borderRadius:17, borderWidth:BorderWidth.default, alignItems:"center", justifyContent:"center", marginTop:4 },

  toast:       { position:"absolute", top:0, left:16, right:16, zIndex:200, flexDirection:"row", alignItems:"center", gap:12, padding:13, borderRadius:16, borderWidth:BorderWidth.default },
  toastIcon:   { width:34, height:34, borderRadius:10, borderWidth:BorderWidth.default, alignItems:"center", justifyContent:"center" },
  toastTitle:  { ...Typography.subhead, fontWeight:FontWeight.heavy },
  toastSub:    { ...Typography.caption, marginTop:1 },

  toggle:      { flexDirection:"row", borderRadius:9, padding:3, gap:3 },
  togBtn:      { paddingHorizontal:14, paddingVertical:5, borderRadius:7 },

  daysRow:     { flexDirection:"row", gap:7 },
  dayCol:      { flex:1, alignItems:"center", gap:5 },
  dayLetter:   { fontSize:10 },
  daySq:       { width:"100%", aspectRatio:1, borderRadius:999, alignItems:"center", justifyContent:"center" },
  dayType:     { fontSize:8, textAlign:"center" },
  divider:     { height:StyleSheet.hairlineWidth },

  dotTrackBg:  { position:"absolute", top:6, left:"3%", right:"3%", height:0.5 },
  dotTrackFg:  { position:"absolute", top:6, left:"3%", height:0.5 },
  dotCol:      { flex:1, alignItems:"center", gap:7 },
  dot:         { zIndex:1 },
  dotLabel:    { fontSize:9 },

  linkRow:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingTop:14, paddingBottom:4, borderTopWidth:0.5 },

  // Circle calendar
  calCircle:   { flex:1, aspectRatio:1, borderRadius:999, alignItems:"center", justifyContent:"center" },
  calNum:      { ...Typography.caption },

  // Performance
  card:        { borderRadius:14, borderWidth:BorderWidth.default, overflow:"hidden" },
  exCard:      { borderRadius:14, borderWidth:BorderWidth.default, overflow:"hidden" },
  exRow:       { flexDirection:"row", alignItems:"center", gap:12 },
  exDot:       { width:6, height:6, borderRadius:3, flexShrink:0 },
  exExpanded:  { borderTopWidth:StyleSheet.hairlineWidth },
  statTile:    { borderRadius:10, padding:10 },

  // Body
  bCard:       { borderRadius:18, borderWidth:BorderWidth.default, padding:18 },
  measRow:     { flexDirection:"row", alignItems:"center", paddingBottom:11, gap:12 },
  weightBig:   { fontSize:30, fontWeight:FontWeight.black, letterSpacing:-0.5 },
  angleTab:    { flex:1, paddingVertical:8, borderRadius:10, alignItems:"center" },
  photoSlot:   { aspectRatio:0.75, borderRadius:14, borderWidth:0.5, alignItems:"center", justifyContent:"center", gap:6, overflow:"hidden", position:"relative" },
  comparePill: { paddingHorizontal:14, paddingVertical:7, borderRadius:999, borderWidth:BorderWidth.default },
  compareDetail: { borderRadius:14, borderWidth:BorderWidth.default, padding:12 },
  checkinBtn:  { borderRadius:999, borderWidth:BorderWidth.default, padding:13, alignItems:"center" },

  // Sheets
  modalBg:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.5)" },
  sheet:       { position:"absolute", bottom:0, left:0, right:0, borderTopLeftRadius:24, borderTopRightRadius:24, borderTopWidth:BorderWidth.default, borderLeftWidth:BorderWidth.default, borderRightWidth:BorderWidth.default, maxHeight:"88%" },
  handle:      { width:36, height:4, borderRadius:2, alignSelf:"center", marginTop:10, marginBottom:4 },
  closeBtn:    { width:32, height:32, borderRadius:10, borderWidth:BorderWidth.default, alignItems:"center", justifyContent:"center" },
  progBar:     { flex:1, height:2, borderRadius:1 },
  sheetBody:   { paddingHorizontal:20, paddingTop:8, paddingBottom:16 },
  bigInput:    { borderRadius:14, borderWidth:BorderWidth.default, padding:14, fontSize:36, fontWeight:FontWeight.black, width:160, textAlign:"center" },
  primaryBtn:  { borderRadius:14, padding:15, alignItems:"center" },
  ghostBtn:    { borderRadius:14, padding:15, alignItems:"center", borderWidth:BorderWidth.default },
  btnText:     { ...Typography.button },
  measInputRow:{ borderRadius:14, borderWidth:BorderWidth.default, padding:13, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  measWrap:    { flexDirection:"row", alignItems:"center", borderRadius:10, borderWidth:BorderWidth.default },
  measInput:   { width:64, padding:10, fontSize:FontSize.headline, fontWeight:FontWeight.heavy, textAlign:"right" },
  photoPlaceholder: { borderRadius:14, borderWidth:1, padding:28, alignItems:"center" },
  doneCircle:  { width:56, height:56, borderRadius:28, borderWidth:BorderWidth.default, alignItems:"center", justifyContent:"center", marginBottom:14 },

  // Share
  modeToggle:  { flexDirection:"row", borderRadius:10, padding:3, gap:3 },
  modeBtn:     { flex:1, paddingVertical:8, borderRadius:7, borderWidth:1, alignItems:"center" },
  shareCard:   { borderRadius:16, borderWidth:BorderWidth.default, padding:20 },
  shareStatTile: { flex:1, borderRadius:10, padding:10, alignItems:"center" },
  shareConsistency: { flexDirection:"row", alignItems:"center", gap:10, marginTop:16, paddingTop:14, borderTopWidth:StyleSheet.hairlineWidth },
  coachSummary:{ borderRadius:14, borderWidth:BorderWidth.default, padding:14, marginBottom:14 },
  coachRow:    { flexDirection:"row", alignItems:"center", paddingVertical:11 },
  noteInput:   { borderRadius:14, borderWidth:BorderWidth.default, padding:14, fontSize:FontSize.body, height:88, textAlignVertical:"top", marginBottom:14 },

  // Typography
  row:         { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  pill:        { paddingHorizontal:9, paddingVertical:3, borderRadius:999, borderWidth:BorderWidth.default },
  pillText:    { ...Typography.meta },
  eyebrow:     { ...Typography.micro },
  caption:     { ...Typography.caption },
  meta:        { ...Typography.meta },
  subhead:     { ...Typography.subhead },
  headline:    { ...Typography.headline },
  body:        { ...Typography.body },
  title2:      { ...Typography.title2 },
  title3:      { ...Typography.title3 },
});