import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';
import { useAppData } from '../../src/constants/AppContext';
import { TimetableEntry } from '../../src/constants/apiService';

const UNIT_COLORS = ['#4A9EFF', '#4CAF50', '#E040FB', '#FFC107', '#FF5252', '#4A9EFF'];

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const START_HOUR = 8;
const HOUR_HEIGHT = 100;
const TIME_COL_WIDTH = 55;
const SPINE_LEFT = 65;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
type Day = typeof DAYS[number];

const DAY_FULL: Record<Day, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday',
};

export default function Schedule() {
  const { weekClasses, loading, refresh } = useAppData();
  const [activeDay, setActiveDay] = useState<Day>('Mon');
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  // Build timetable and colorMap from shared context
  const timetable: Record<Day, TimetableEntry[]> = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
  const colorMap: Record<string, string> = {};
  let colorIdx = 0;
  weekClasses.forEach((e) => {
    const dayKey = (Object.keys(DAY_FULL) as Day[]).find((k) => DAY_FULL[k] === e.day_of_week);
    if (dayKey) timetable[dayKey].push(e);
    if (!colorMap[e.unit_code]) {
      colorMap[e.unit_code] = UNIT_COLORS[colorIdx % UNIT_COLORS.length];
      colorIdx++;
    }
  });

  const nowTop = () => {
    const decimal = now.getHours() + now.getMinutes() / 60;
    if (decimal < START_HOUR || decimal > 17) return -100;
    return (decimal - START_HOUR) * HOUR_HEIGHT;
  };

  const parseHour = (t: string) => parseInt(t.split(':')[0]) + parseInt(t.split(':')[1]) / 60;
  const duration = (e: TimetableEntry) => parseHour(e.end_time) - parseHour(e.start_time);

  const dayClasses = timetable[activeDay];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Timetable</Text>
        <Text style={s.subtitle}>SEMESTER 2</Text>
      </View>

      <View style={s.dayRowWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayRow}>
          {DAYS.map((d) => (
            <TouchableOpacity key={d} onPress={() => setActiveDay(d)} style={[s.dayBtn, activeDay === d && s.dayBtnActive]}>
              <Text style={[s.dayText, activeDay === d && s.dayTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.orange} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.timelineScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); setRefreshing(false); }} tintColor={Colors.orange} />}
        >
          <View style={s.timelineWrapper}>
            <View style={{ width: TIME_COL_WIDTH }}>
              {HOURS.map((h) => (
                <View key={h} style={{ height: HOUR_HEIGHT }}>
                  <Text style={s.hourText}>{h}:00</Text>
                </View>
              ))}
            </View>

            <View style={s.verticalLine} />

            <View style={{ flex: 1, position: 'relative' }}>
              {HOURS.map((h) => (
                <View key={h} style={[s.dotBase, { top: (h - START_HOUR) * HOUR_HEIGHT }]} />
              ))}

              {nowTop() >= 0 && (
                <View style={[s.nowLine, { top: nowTop() }]}>
                  <View style={s.nowDot} />
                </View>
              )}

              {dayClasses.length === 0 && (
                <Text style={s.emptyText}>No classes</Text>
              )}

              {dayClasses.map((c) => {
                const color = colorMap[c.unit_code] ?? '#4A9EFF';
                const top = (parseHour(c.start_time) - START_HOUR) * HOUR_HEIGHT + 10;
                const height = duration(c) * HOUR_HEIGHT - 20;
                return (
                  <View key={c.id} style={[s.card, { top, height, backgroundColor: color + '25', borderColor: color + '40' }]}>
                    <Text style={[s.cardCode, { color }]}>{c.unit_code}</Text>
                    <Text style={s.cardName}>{c.unit_name}</Text>
                    <View style={s.cardMeta}>
                      <MaterialCommunityIcons name="map-marker-outline" size={12} color={color} />
                      <Text style={[s.metaText, { color }]}>{c.room_code}</Text>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={color} style={{ marginLeft: 8 }} />
                      <Text style={[s.metaText, { color }]}>{duration(c).toFixed(1)} hr</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 22, paddingTop: 20, marginBottom: 20 },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, letterSpacing: 1.5 },
  dayRowWrap: { marginBottom: 20 },
  dayRow: { paddingHorizontal: 22, gap: 12 },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24, backgroundColor: '#1A1A1A' },
  dayBtnActive: { backgroundColor: Colors.orange },
  dayText: { fontFamily: Fonts.semiBold, fontSize: 15, color: '#666' },
  dayTextActive: { color: Colors.white },
  timelineScroll: { paddingBottom: 100 },
  timelineWrapper: { flexDirection: 'row', paddingHorizontal: 22 },
  hourText: { fontFamily: Fonts.regular, fontSize: 13, color: '#444', marginTop: -6 },
  verticalLine: { position: 'absolute', left: SPINE_LEFT, top: 0, bottom: 0, width: 1, backgroundColor: '#222' },
  dotBase: { position: 'absolute', left: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', zIndex: 5, marginTop: -4 },
  nowLine: { position: 'absolute', left: -10, right: 0, height: 1.5, backgroundColor: Colors.orange, zIndex: 10, marginTop: -1 },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange, position: 'absolute', left: -4, top: -3 },
  card: { position: 'absolute', left: 20, right: 0, borderRadius: 20, padding: 16, borderWidth: 1, justifyContent: 'center' },
  cardCode: { fontFamily: Fonts.bold, fontSize: 17, marginBottom: 2 },
  cardName: { fontFamily: Fonts.regular, fontSize: 14, color: '#A0A0A0', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontFamily: Fonts.regular, fontSize: 12, opacity: 0.8 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, textAlign: 'center', marginTop: 40 },
});
