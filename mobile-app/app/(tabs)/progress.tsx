import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';

const courses = [
  { code: 'ICS 2301', name: 'Data Structures',    attended: 18, total: 22, color: '#4CAF50' },
  { code: 'ICS 2205', name: 'Operating Systems',  attended: 20, total: 22, color: '#4CAF50' },
  { code: 'SMA 2104', name: 'Linear Algebra',     attended: 15, total: 20, color: '#FFC107' },
  { code: 'ICS 2106', name: 'Computer Networks',  attended: 19, total: 22, color: '#4CAF50' },
];

// ── Circular display using donut icon ─────────────────────
function CircularProgress({ percentage }: { percentage: number }) {
  return (
    <View style={ring.container}>
      <MaterialCommunityIcons name="chart-donut" size={90} color="#4CAF50" />
      <Text style={ring.label}>{percentage}%</Text>
    </View>
  );
}

const ring = StyleSheet.create({
  container: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  label: { position: 'absolute', fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
});

// ── Linear progress bar ────────────────────────────────────
function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${percentage}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const bar = StyleSheet.create({
  track: { height: 6, backgroundColor: '#2A2A2A', borderRadius: 4, overflow: 'hidden', marginVertical: 10 },
  fill:  { height: '100%', borderRadius: 4 },
});

// ── Main screen ────────────────────────────────────────────
export default function Progress() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <Text style={s.title}>Progress</Text>
        <Text style={s.subtitle}>ATTENDANCE ANALYTICS</Text>

        {/* Overall card */}
        <View style={s.overallCard}>
          <CircularProgress percentage={84} />
          <View style={s.overallRight}>
            <Text style={s.overallTitle}>Overall Attendance</Text>
            <View style={s.trendRow}>
              <MaterialCommunityIcons name="trending-up" size={16} color="#4CAF50" />
              <Text style={s.trendText}>+2% from last week</Text>
            </View>
          </View>
        </View>

        {/* Alert card */}
        <View style={s.alertCard}>
          <MaterialCommunityIcons name="alert-outline" size={22} color="#FF5252" />
          <View style={{ flex: 1 }}>
            <Text style={s.alertTitle}>Attendance Alert</Text>
            <Text style={s.alertDesc}>
              You're at 75% in Linear Algebra. Attend the next 3 classes to reach 80%.
            </Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>BY COURSE</Text>

        {courses.map((c) => {
          const pct = Math.round((c.attended / c.total) * 100);
          return (
            <View key={c.code} style={s.courseCard}>
              <View style={s.courseHeader}>
                <View>
                  <Text style={s.courseCode}>{c.code}</Text>
                  <Text style={s.courseName}>{c.name}</Text>
                </View>
                <Text style={[s.coursePct, { color: c.color }]}>{pct}%</Text>
              </View>
              <ProgressBar percentage={pct} color={c.color} />
              <Text style={s.courseFooter}>{c.attended}/{c.total} classes attended</Text>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, paddingTop: 8 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginTop: -8 },
  overallCard: {
    backgroundColor: '#1A1A1A', borderRadius: 20,
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20,
  },
  overallRight: { flex: 1 },
  overallTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  trendText: { fontFamily: Fonts.regular, fontSize: 13, color: '#4CAF50' },
  alertCard: {
    backgroundColor: '#2A1515', borderWidth: 1, borderColor: '#3D2020',
    borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  alertTitle: { fontFamily: Fonts.bold, fontSize: 15, color: '#FF5252', marginBottom: 4 },
  alertDesc: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, lineHeight: 18 },
  sectionLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1 },
  courseCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  courseCode: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  courseName: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 2 },
  coursePct: { fontFamily: Fonts.bold, fontSize: 16 },
  courseFooter: { fontFamily: Fonts.regular, fontSize: 12, color: '#555' },
});
