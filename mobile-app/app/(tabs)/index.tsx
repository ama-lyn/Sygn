import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────
type SygnState = 'searching' | 'ready' | 'signed';

const classes = [
  { code: 'ICS 2301', time: '9:00 AM', room: 'CLB 102', attendance: 82, color: Colors.orange },
  { code: 'ICS 2205', time: '11:00 AM', room: 'LR 305', attendance: 91, color: '#4CAF50' },
  { code: 'SMA 2104', time: '2:00 PM', room: 'LR 102', attendance: 76, color: '#FFC107' },
];

// ── Sygn Button ────────────────────────────────────────────
function SygnButton({ state, onPress }: { state: SygnState; onPress: () => void }) {
  const configs = {
    searching: {
      bg: '#C8860A',
      label: 'Searching for class...',
      icon: <MaterialCommunityIcons name="wifi" size={22} color={Colors.white} />,
      badge: { color: '#C8860A', text: '● Searching GPS...' },
      sub: null,
    },
    ready: {
      bg: '#2E7D52',
      label: 'Ready to Sygn',
      icon: <MaterialCommunityIcons name="fingerprint" size={22} color={Colors.white} />,
      badge: { color: '#2E7D52', text: '● Inside CLB 102' },
      sub: null,
    },
    signed: {
      bg: '#2E7D52',
      label: "Sygn'd ✓",
      icon: <MaterialCommunityIcons name="check" size={22} color={Colors.white} />,
      badge: { color: '#2E7D52', text: '● Attendance recorded' },
      sub: 'ICS 2301  •  CLB 102  •  9:03 AM',
    },
  };

  const c = configs[state];

  return (
    <View>
      {/* Status badge */}
      <View style={[badge.wrap, { backgroundColor: c.badge.color + '22' }]}>
        <Text style={[badge.text, { color: c.badge.color === '#C8860A' ? '#FFA726' : '#4CAF50' }]}>
          {c.badge.text}
        </Text>
      </View>

      {/* Main button */}
      <TouchableOpacity
        style={[btn.base, { backgroundColor: c.bg }]}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={state === 'signed'}
      >
        {c.icon}
        <Text style={btn.label}>{c.label}</Text>
      </TouchableOpacity>

      {/* Sub-label after signed */}
      {c.sub && <Text style={btn.sub}>{c.sub}</Text>}
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  text: { fontFamily: Fonts.regular, fontSize: 13 },
});

const btn = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 50,
    paddingVertical: 18,
  },
  label: { fontFamily: Fonts.semiBold, fontSize: 18, color: Colors.white },
  sub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.mutedText,
    textAlign: 'center',
    marginTop: 10,
  },
});

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={stat.card}>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  value: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  label: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, marginTop: 2, letterSpacing: 0.5 },
});

// ── Class Row ──────────────────────────────────────────────
function ClassRow({ code, time, room, attendance, color }: typeof classes[0]) {
  return (
    <View style={row.wrap}>
      <View style={[row.icon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name="book-open-outline" size={20} color={color} />
      </View>
      <View style={row.info}>
        <Text style={row.code}>{code}</Text>
        <Text style={row.meta}>{time}  ·  {room}</Text>
      </View>
      <Text style={[row.pct, { color }]}>{attendance}%</Text>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  code: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, marginTop: 2 },
  pct: { fontFamily: Fonts.bold, fontSize: 15 },
});

// ── Home Screen ────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [sygnState, setSygnState] = useState<SygnState>('searching');

  const handleSygnPress = () => {
    if (sygnState === 'searching') setSygnState('ready');
    else if (sygnState === 'ready') setSygnState('signed');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING,' : hour < 17 ? 'GOOD AFTERNOON,' : 'GOOD EVENING,';

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.name}>Alex Johnson</Text>
          </View>
          <View style={s.streak}>
            <Text style={s.streakIcon}>🔥</Text>
            <Text style={s.streakNum}>7</Text>
          </View>
        </View>

        {/* Current Class Card */}
        <View style={[s.card, sygnState === 'signed' && s.cardSigned]}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.cardLabel}>CURRENT CLASS</Text>
              <Text style={s.cardCode}>ICS 2301</Text>
              <Text style={s.cardName}>Data Structures</Text>
            </View>
            <View style={s.cardMeta}>
              <View style={s.metaRow}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.mutedText} />
                <Text style={s.metaText}>9:00 AM</Text>
              </View>
              <View style={s.metaRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.mutedText} />
                <Text style={s.metaText}>CLB 102</Text>
              </View>
            </View>
          </View>

          <SygnButton state={sygnState} onPress={handleSygnPress} />
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>2/3</Text>
            <Text style={s.statLabel}>CLASSES TODAY</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>87%</Text>
            <Text style={s.statLabel}>AVG. ATTENDANCE</Text>
          </View>
        </View>


        {/* Today's Classes */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>TODAY'S CLASSES</Text>
            <TouchableOpacity style={s.timetableBtn} onPress={() => router.push('/(tabs)/schedule')}>
              <MaterialCommunityIcons name="calendar-month-outline" size={14} color={Colors.orange} />
              <Text style={s.timetableText}>Timetable</Text>
            </TouchableOpacity>
          </View>
          <View style={s.classList}>
            {classes.slice(0, 2).map((c) => <ClassRow key={c.code} {...c} />)}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  greeting: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, letterSpacing: 1 },
  name: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.white },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  streakIcon: { fontSize: 14 },
  streakNum: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white },
  card: { backgroundColor: '#1A1A1A', borderRadius: 18, padding: 18, gap: 16, borderWidth: 1, borderColor: 'transparent' },
  cardSigned: { borderColor: '#2E7D5244', paddingVertical: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: 4 },
  cardCode: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  cardName: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 2 },
  cardMeta: { alignItems: 'flex-end', gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#161616', borderRadius: 16, padding: 16, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  statValue: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  statLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.mutedText, marginTop: 4, letterSpacing: 0.5 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white, letterSpacing: 0.5 },
  timetableBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timetableText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.orange },
  classList: { gap: 10 },
});
