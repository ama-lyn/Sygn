import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../src/constants/theme';
import { useAppData } from '../../src/constants/AppContext';
import { TimetableEntry } from '../../src/constants/apiService';

const UNIT_COLORS = ['#4A9EFF', '#4CAF50', '#E040FB', '#FFC107', '#FF5252'];

type SygnState = 'searching' | 'ready' | 'signed';

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
      badge: { color: '#2E7D52', text: '● Inside classroom' },
      sub: null,
    },
    signed: {
      bg: '#2E7D52',
      label: "Sygn'd ✓",
      icon: <MaterialCommunityIcons name="check" size={22} color={Colors.white} />,
      badge: { color: '#2E7D52', text: '● Attendance recorded' },
      sub: null,
    },
  };
  const c = configs[state];
  return (
    <View>
      <View style={[badge.wrap, { backgroundColor: c.badge.color + '22' }]}>
        <Text style={[badge.text, { color: c.badge.color === '#C8860A' ? '#FFA726' : '#4CAF50' }]}>
          {c.badge.text}
        </Text>
      </View>
      <TouchableOpacity
        style={[btn.base, { backgroundColor: c.bg }]}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={state === 'signed'}
      >
        {c.icon}
        <Text style={btn.label}>{c.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  text: { fontFamily: Fonts.regular, fontSize: 13 },
});
const btn = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 50, paddingVertical: 18 },
  label: { fontFamily: Fonts.semiBold, fontSize: 18, color: Colors.white },
});

// ── Class Row ──────────────────────────────────────────────
function ClassRow({ entry, color }: { entry: TimetableEntry; color: string }) {
  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  return (
    <View style={row.wrap}>
      <View style={[row.icon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name="book-open-outline" size={20} color={color} />
      </View>
      <View style={row.info}>
        <Text style={row.code}>{entry.unit_code}</Text>
        <Text style={row.meta}>{fmt(entry.start_time)}  ·  {entry.room_code}</Text>
      </View>
    </View>
  );
}
const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  code: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, marginTop: 2 },
});

// ── Home Screen ────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { fullName, todayClasses, progress, loading, refresh } = useAppData();
  const [sygnState, setSygnState] = useState<SygnState>('searching');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  const handleSygnPress = () => {
    if (sygnState === 'searching') setSygnState('ready');
    else if (sygnState === 'ready') setSygnState('signed');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING,' : hour < 17 ? 'GOOD AFTERNOON,' : 'GOOD EVENING,';
  const firstName = fullName.split(' ')[0] || null;
  const stats = progress ? { streak: progress.streak, overall: progress.overall_percentage } : null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const currentClass = todayClasses.find((e) => {
    const [sh, sm] = e.start_time.split(':').map(Number);
    const [eh, em] = e.end_time.split(':').map(Number);
    return nowMins >= sh * 60 + sm - 15 && nowMins <= eh * 60 + em + 30;
  }) ?? todayClasses[0] ?? null;

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.orange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.orange} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.name}>{firstName ?? 'Student'}</Text>
          </View>
          <View style={s.streak}>
            <Text style={s.streakIcon}>🔥</Text>
            <Text style={s.streakNum}>{stats?.streak ?? 0}</Text>
          </View>
        </View>

        {/* Current Class Card */}
        {currentClass ? (
          <View style={[s.card, sygnState === 'signed' && s.cardSigned]}>
            <View style={s.cardTop}>
              <View>
                <Text style={s.cardLabel}>CURRENT CLASS</Text>
                <Text style={s.cardCode}>{currentClass.unit_code}</Text>
                <Text style={s.cardName}>{currentClass.unit_name}</Text>
              </View>
              <View style={s.cardMeta}>
                <View style={s.metaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.mutedText} />
                  <Text style={s.metaText}>{currentClass.start_time.slice(0, 5)}</Text>
                </View>
                <View style={s.metaRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.mutedText} />
                  <Text style={s.metaText}>{currentClass.room_code}</Text>
                </View>
              </View>
            </View>
            <SygnButton state={sygnState} onPress={handleSygnPress} />
          </View>
        ) : (
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="calendar-check-outline" size={40} color="#333" />
            <Text style={s.emptyTitle}>No classes today</Text>
            <Text style={s.emptySubtitle}>Enjoy your free time 🎉</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(tabs)/schedule')}>
              <Text style={s.emptyBtnText}>View full timetable</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{todayClasses.length}</Text>
            <Text style={s.statLabel}>CLASSES TODAY</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{stats?.overall ?? 0}%</Text>
            <Text style={s.statLabel}>AVG. ATTENDANCE</Text>
          </View>
        </View>

        {/* Today's Classes */}
        {todayClasses.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>TODAY'S CLASSES</Text>
              <TouchableOpacity style={s.timetableBtn} onPress={() => router.push('/(tabs)/schedule')}>
                <MaterialCommunityIcons name="calendar-month-outline" size={14} color={Colors.orange} />
                <Text style={s.timetableText}>Timetable</Text>
              </TouchableOpacity>
            </View>
            <View style={s.classList}>
              {todayClasses.map((c, i) => (
                <ClassRow key={c.id} entry={c} color={UNIT_COLORS[i % UNIT_COLORS.length]} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 16, paddingTop: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, letterSpacing: 1 },
  name: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  streak: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  streakIcon: { fontSize: 14 },
  streakNum: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white },
  card: { backgroundColor: '#1A1A1A', borderRadius: 18, padding: 18, gap: 16, borderWidth: 1, borderColor: 'transparent' },
  cardSigned: { borderColor: '#2E7D5244' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: 4 },
  cardCode: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  cardName: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 2 },
  cardMeta: { alignItems: 'flex-end', gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText },
  emptyCard: { backgroundColor: '#1A1A1A', borderRadius: 18, padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, marginTop: 8 },
  emptySubtitle: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText },
  emptyBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50, borderWidth: 1, borderColor: Colors.orange },
  emptyBtnText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.orange },
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
