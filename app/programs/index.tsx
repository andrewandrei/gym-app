import { Colors } from '@/styles/colors';

import { useRouter } from 'expo-router';
import { ArrowLeft, Moon } from 'lucide-react-native';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ───────────────────────── DATA ───────────────────────── */

const programs = [
  {
    id: 'p1',
    title: 'Strength Foundations',
    meta: 'Intermediate · 8 weeks',
    workouts: '21 workouts',
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07d',
  },
  {
    id: 'p2',
    title: 'Yoga Flow',
    meta: 'Beginner · 4 weeks',
    workouts: '12 workouts',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a',
  },
  {
    id: 'p3',
    title: 'Lean Muscle Build',
    meta: 'Advanced · 10 weeks',
    workouts: '30 workouts',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
  },
  {
    id: 'p4',
    title: 'Mobility & Recovery',
    meta: 'All Levels · 4 weeks',
    workouts: '10 workouts',
    image: 'https://images.unsplash.com/photo-1540206276207-3af25c08d53e',
  },
];

/* ───────────────────────── SCREEN ───────────────────────── */

export default function AllProgramsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color={Colors.text} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Moon size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>All Programs</Text>
          <Text style={styles.subtitle}>
            Find the perfect program for your goals
          </Text>

          {/* LIST */}
          {programs.map(program => (
            <View key={program.id} style={styles.card}>
              <Image
                source={{ uri: program.image }}
                style={styles.image}
                resizeMode="cover"
              />

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  {program.title}
                </Text>

                <Text style={styles.cardMeta}>
                  {program.meta}
                </Text>

                <Text style={styles.cardSub}>
                  {program.workouts}
                </Text>
              </View>
            </View>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────────── STYLES ───────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 6,
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

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.muted,
    marginBottom: 28,
  },

  /* Program Card */
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardBody: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 16,
    color: Colors.muted,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 15,
    color: Colors.muted,
  },
});
