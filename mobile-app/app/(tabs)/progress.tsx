import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Fonts } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// ── Components ─────────────────────────────────────────────

/**
 * Simple Circular Progress Ring
 */
function CircularProgress({ size, strokeWidth, percentage, color }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#222"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.circleText}>{percentage}%</Text>
    </View>
  );
}

/**
 * Linear Progress Bar for Courses
 */
function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <View style={s.barBackground}>
      <View style={[s.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────

const courses = [
  { id: '1', code: 'ICS 2301', name: 'Data Structures', attended: 18, total: 22, color: '#4CAF50' },
  { id: '2', code: 'ICS 2205', name: 'Operating Systems', attended: 20, total: 22, color: '#4CAF50' },
  { id: '3', code: 'SMA 2104', name: 'Linear Algebra', attended: 15, total: 20, color: '#FFB300' },
  { id: '4', code: 'ICS 2106', name: 'Computer Networks', attended: 19, total: 22, color: '#4CAF50' },
];

export default function Progress() {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        <View style={s.header}>
          <Text style={s.title}>Progress</Text>
          <Text style={s.subtitle}>ATTENDANCE ANALYTICS</Text>
        </View>

        {/* Overall Attendance Card */}
        <View style={s.overallCard}>
          <CircularProgress size={100} strokeWidth={8} percentage={84} color="#4CAF50" />
          <View style={s.overallInfo}>
            <Text style={s.overallTitle}>Overall Attendance</Text>
            <View style={s.trendRow}>
              <MaterialCommunityIcons name="trending-up" size={18} color="#4CAF50" />
              <Text style={s.trendText}>+2% from last week</Text>
            </View>
          </View>
        </View>

        {/* Attendance Alert */}
        <View style={s.alertCard}>
          <MaterialCommunityIcons name="triangle-outline" size={24} color="#FF5252" />
          <View style={s.alertContent}>
            <Text style={s.alertTitle}>Attendance Alert</Text>
            <Text style={s.alertDesc}>
              You're at 75% in Linear Algebra. Attend the next 3 classes to reach 80%.
            </Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>BY COURSE</Text>

        {/* Course List */}
        {courses.map((item) => {
          const pct = Math.round((item.attended / item.total) * 100);
          return (
            <View key={item.id} style={s.courseCard}>
              <View style={s.courseHeader}>
                <View>
                  <Text style={s.courseCode}>{item.code}</Text>
                  <Text style={s.courseName}>{item.name}</Text>
                </View>
                <Text style={[s.coursePct, { color: item.color }]}>{pct}%</Text>
              </View>
              
              <ProgressBar percentage={pct} color={item.color} />
              
              <Text style={s.courseFooter}>{item.attended}/{item.total} classes attended</Text>
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText, letterSpacing: 1 },

  // Overall Stats
  overallCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  overallInfo: { flex: 1 },
  overallTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  trendText: { fontFamily: Fonts.regular, fontSize: 14, color: '#4CAF50' },
  circleText: { position: 'absolute', fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },

  // Alert Card
  alertCard: {
    backgroundColor: '#2A1818',
    borderColor: '#422',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  alertContent: { flex: 1 },
  alertTitle: { fontFamily: Fonts.bold, fontSize: 16, color: '#FF5252', marginBottom: 4 },
  alertDesc: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, lineHeight: 18 },

  sectionLabel: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.mutedText, letterSpacing: 1, marginBottom: 16 },

  // Course Card
  courseCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginBottom: 16 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  courseCode: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  courseName: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  coursePct: { fontFamily: Fonts.bold, fontSize: 18 },

  // Progress Bars
  barBackground: { height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  courseFooter: { fontFamily: Fonts.regular, fontSize: 12, color: '#666', marginTop: 12 },
});