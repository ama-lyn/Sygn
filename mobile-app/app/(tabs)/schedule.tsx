import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// ── Constants ──
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const START_HOUR = 8;
const HOUR_HEIGHT = 100; // Increased for better spacing
const TIME_COL_WIDTH = 55;
const SPINE_LEFT = 65; // Position of the vertical line

type ClassEntry = { code: string; name: string; room: string; hour: number; duration: number; color: string };

const timetable: Record<string, ClassEntry[]> = {
  Mon: [
    { code: 'SMA 2418', name: 'Mobile Computing', room: 'PAM LAB B', hour: 8, duration: 2, color: '#4A9EFF' },
    {code: 'ICS 2303', name: 'Multimedia Systems', room: 'Online', hour: 15, duration: 1.5, color: '#E040FB' },
  ],
  Tue: [
    {code: 'SMA 2453', name: 'Simulation and Modelling', room: 'PAM LAB B', hour: 8, duration: 1.5, color: '#4CAF50' },
    { code: 'SMA 2419', name: 'Cloud Computing', room: 'PAM LAB B', hour: 11, duration: 2, color: '#E040FB' },
  ],
  Wed: [
    { code: 'STA 2401', name: 'Time Series Analysis', room: 'HRD 108', hour: 8, duration: 2.5, color: '#FFC107' },
    { code: 'SMA 2423', name: 'PDE 2', room: 'CLB 106', hour: 11, duration: 2.5, color: '#4A9EFF' },
  ],
  Thu: [{ code: 'SMA 2456', name: 'Artificial Intelligence', room: 'PAM LAB B', hour: 8, duration: 2, color: '#4CAF50' },],
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
type Day = typeof DAYS[number];

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<Day>('Mon');
  const [now, setNow] = useState(new Date());

  // Update current time line every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateNowTop = () => {
    const hours = now.getHours();
    const mins = now.getMinutes();
    const decimal = hours + mins / 60;
    if (decimal < START_HOUR || decimal > 17) return -100; // Hide if out of range
    return (decimal - START_HOUR) * HOUR_HEIGHT;
  };

  const dayClasses = timetable[activeDay] ?? [];

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Timetable</Text>
        <Text style={s.subtitle}>WEEK 12 · SEMESTER 2</Text>
      </View>

      {/* Day Tabs */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayRow}>
          {DAYS.map((d) => (
            <TouchableOpacity 
              key={d} 
              onPress={() => setActiveDay(d)} 
              style={[s.dayBtn, activeDay === d && s.dayBtnActive]}
            >
              <Text style={[s.dayText, activeDay === d && s.dayTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Timeline Scroll View */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.timelineScroll}>
        <View style={s.timelineWrapper}>
          
          {/* 1. Time Labels Column */}
          <View style={{ width: TIME_COL_WIDTH }}>
            {HOURS.map((h) => (
              <View key={h} style={{ height: HOUR_HEIGHT }}>
                <Text style={s.hourText}>{h}:00</Text>
              </View>
            ))}
          </View>

          {/* 2. Vertical Spine (The Line) */}
          <View style={s.verticalLine} />

          {/* 3. Dots & Cards Container */}
          <View style={{ flex: 1, position: 'relative' }}>
            {/* Dots */}
            {HOURS.map((h) => (
              <View key={h} style={[s.dotBase, { top: (h - START_HOUR) * HOUR_HEIGHT }]} />
            ))}

            {/* Orange "Now" Indicator */}
            {calculateNowTop() >= 0 && (
              <View style={[s.nowLine, { top: calculateNowTop() }]}>
                <View style={s.nowDot} />
              </View>
            )}

            {/* Class Cards */}
            {dayClasses.map((c, idx) => (
              <View
                key={idx}
                style={[
                  s.card,
                  { 
                    top: (c.hour - START_HOUR) * HOUR_HEIGHT + 10, 
                    height: c.duration * HOUR_HEIGHT - 20,
                    backgroundColor: c.color + '25', // 15% opacity for frosted look
                    borderColor: c.color + '40'
                  }
                ]}
              >
                <Text style={[s.cardCode, { color: c.color }]}>{c.code}</Text>
                <Text style={s.cardName}>{c.name}</Text>
                <View style={s.cardMeta}>
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color={c.color} />
                  <Text style={[s.metaText, { color: c.color }]}>{c.room}</Text>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={c.color} style={{ marginLeft: 8 }} />
                  <Text style={[s.metaText, { color: c.color }]}>{c.duration} hr</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 22, paddingTop: 10, marginBottom: 20 },
  title: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, letterSpacing: 1.5, textTransform: 'uppercase' },
  
  dayRow: { paddingHorizontal: 22, gap: 12, marginBottom: 20 },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24, backgroundColor: '#1A1A1A' },
  dayBtnActive: { backgroundColor: Colors.orange },
  dayText: { fontFamily: Fonts.semiBold, fontSize: 15, color: '#666' },
  dayTextActive: { color: Colors.white },

  timelineScroll: { paddingBottom: 100 },
  timelineWrapper: { flexDirection: 'row', paddingHorizontal: 22 },
  
  hourText: { fontFamily: Fonts.regular, fontSize: 13, color: '#444', marginTop: -6 },
  
  verticalLine: { 
    position: 'absolute', left: SPINE_LEFT, top: 0, bottom: 0, 
    width: 1, backgroundColor: '#222' 
  },
  
  dotBase: {
    position: 'absolute', left: -4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#333', zIndex: 5, marginTop: -4,
  },

  nowLine: { position: 'absolute', left: -10, right: 0, height: 1.5, backgroundColor: Colors.orange, zIndex: 10, marginTop: -1 },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange, position: 'absolute', left: -4, top: -3 },

  card: {
    position: 'absolute',
    left: 20,
    right: 0,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  cardCode: { fontFamily: Fonts.bold, fontSize: 17, marginBottom: 2 },
  cardName: { fontFamily: Fonts.regular, fontSize: 14, color: '#A0A0A0', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, opacity: 0.8 },
});