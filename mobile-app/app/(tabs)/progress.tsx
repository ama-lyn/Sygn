import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Fonts } from '../../src/constants/theme';
import { useAppData } from '../../src/constants/AppContext';

function CircularProgress({ size, strokeWidth, percentage, color }: { size: number; strokeWidth: number; percentage: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#222" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" fill="none"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.circleText}>{percentage}%</Text>
      </View>
    </View>
  );
}

function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <View style={s.barBackground}>
      <View style={[s.barFill, { width: `${percentage}%` as any, backgroundColor: color }]} />
    </View>
  );
}

export default function Progress() {
  const { progress: data, loading, refresh } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator color={Colors.orange} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); setRefreshing(false); }} tintColor={Colors.orange} />}
      >
        <View style={s.header}>
          <Text style={s.title}>Progress</Text>
          <Text style={s.subtitle}>ATTENDANCE ANALYTICS</Text>
        </View>

        {/* Overall Card */}
        <View style={s.overallCard}>
          <CircularProgress size={100} strokeWidth={8} percentage={data?.overall_percentage ?? 0} color="#4CAF50" />
          <View style={s.overallInfo}>
            <Text style={s.overallTitle}>Overall Attendance</Text>
            <View style={s.trendRow}>
              <MaterialCommunityIcons name="trending-up" size={18} color="#4CAF50" />
              <Text style={s.trendText}>{data?.total_attended ?? 0}/{data?.total_classes ?? 0} classes</Text>
            </View>
          </View>
        </View>

        {/* Single summary alert */}
        {(data?.alerts ?? []).length > 0 && (() => {
          const count = data!.alerts.length;
          const hasRed = data!.units.some(u => u.percentage < 60);
          const alertColor  = hasRed ? '#FF5252' : '#FFC107';
          const alertBg     = hasRed ? '#2A1818' : '#2A2410';
          const alertBorder = hasRed ? '#422'    : '#443300';
          const summary = `${count} unit${count > 1 ? 's' : ''} below 80% attendance. Check your progress below.`;
          return (
            <View style={[s.alertCard, { backgroundColor: alertBg, borderColor: alertBorder }]}>
              <MaterialCommunityIcons name="triangle-outline" size={20} color={alertColor} />
              <View style={s.alertContent}>
                <Text style={[s.alertTitle, { color: alertColor }]}>Attendance Alert</Text>
                <Text style={s.alertDesc}>{summary}</Text>
              </View>
            </View>
          );
        })()}

        <Text style={s.sectionLabel}>BY COURSE</Text>

        {(data?.units ?? []).map((item) => (
          <View key={item.unit_code} style={s.courseCard}>
            <View style={s.courseHeader}>
              <View>
                <Text style={s.courseCode}>{item.unit_code}</Text>
                <Text style={s.courseName}>{item.unit_name}</Text>
              </View>
              <Text style={[s.coursePct, { color: item.color }]}>{item.percentage}%</Text>
            </View>
            <ProgressBar percentage={item.percentage} color={item.color} />
            <Text style={s.courseFooter}>{item.attended}/{item.total} classes attended</Text>
          </View>
        ))}

        {data?.units.length === 0 && (
          <Text style={s.emptyText}>No attendance data yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 20 },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, letterSpacing: 1.5 },
  overallCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  overallInfo: { flex: 1 },
  overallTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  trendText: { fontFamily: Fonts.regular, fontSize: 14, color: '#4CAF50' },
  circleText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  alertCard: { backgroundColor: '#2A1818', borderColor: '#422', borderWidth: 1, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, marginBottom: 16 },
  alertContent: { flex: 1 },
  alertTitle: { fontFamily: Fonts.bold, fontSize: 16, color: '#FF5252', marginBottom: 4 },
  alertDesc: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, lineHeight: 18 },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: 16 },
  courseCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginBottom: 16 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  courseCode: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.white },
  courseName: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  coursePct: { fontFamily: Fonts.bold, fontSize: 18 },
  barBackground: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  courseFooter: { fontFamily: Fonts.regular, fontSize: 12, color: '#666', marginTop: 12 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, textAlign: 'center', paddingVertical: 40 },
});
