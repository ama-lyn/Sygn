import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../src/constants/theme';
import { getTodayTimetable, markAttendance, TimetableEntry, AttendanceResult } from '../../src/constants/apiService';

function ReceiptRow({ label, value, isOrange }: { label: string; value: string; isOrange?: boolean }) {
  return (
    <View style={s.receiptRow}>
      <Text style={s.receiptKey}>{label}</Text>
      <Text style={[s.receiptValue, isOrange && { color: Colors.orange }]}>{value}</Text>
    </View>
  );
}

const fmt12 = (t: string) => {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

// Find the class that is currently active or next upcoming
function findActiveClass(entries: TimetableEntry[]): TimetableEntry | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  // prefer a class currently in session
  const active = entries.find((e) => {
    const [sh, sm] = e.start_time.split(':').map(Number);
    const [eh, em] = e.end_time.split(':').map(Number);
    return nowMins >= sh * 60 + sm - 15 && nowMins <= eh * 60 + em + 30;
  });
  if (active) return active;
  // fallback: next upcoming
  return entries.find((e) => {
    const [sh, sm] = e.start_time.split(':').map(Number);
    return nowMins < sh * 60 + sm;
  }) ?? entries[0] ?? null;
}

export default function SygnScreen() {
  const [activeClass, setActiveClass] = useState<TimetableEntry | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [status, setStatus] = useState<'pending' | 'submitting' | 'success' | 'failed'>('pending');
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);

  // Load today's active class
  useEffect(() => {
    getTodayTimetable()
      .then((entries) => setActiveClass(findActiveClass(entries)))
      .catch(() => {})
      .finally(() => setLoadingClass(false));
  }, []);

  // Request GPS
  useEffect(() => {
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') { setGpsStatus('denied'); return; }
      setGpsStatus('granted');
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy ?? 0 });
    })();
  }, []);

  const handleVerify = async () => {
    if (!activeClass || !coords) return;
    const deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) { Alert.alert('Error', 'Device ID not found. Please log out and back in.'); return; }

    setStatus('submitting');
    try {
      const res = await markAttendance(activeClass.id, coords.lat, coords.lng, deviceId);
      setResult(res);
      setStatus(res.success ? 'success' : 'failed');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not submit attendance');
      setStatus('pending');
    }
  };

  const isReady = gpsStatus === 'granted' && coords !== null && activeClass !== null;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Check-in</Text>
        <Text style={s.subtitle}>VERIFY YOUR PRESENCE</Text>
      </View>

      {/* GPS Card */}
      <View style={s.gpsCard}>
        <View style={s.gpsTop}>
          <View style={[s.gpsIconWrap, { backgroundColor: gpsStatus === 'granted' ? '#1E2D24' : '#2D1E1E' }]}>
            <MaterialCommunityIcons
              name="map-marker-radius" size={20}
              color={gpsStatus === 'granted' ? '#4CAF50' : gpsStatus === 'denied' ? '#FF5252' : '#FFC107'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.row}>
              <Text style={s.gpsStatusText}>
                {gpsStatus === 'loading' ? 'Getting location...' : gpsStatus === 'denied' ? 'Location denied' : coords ? 'GPS Ready' : 'Locating...'}
              </Text>
              {gpsStatus === 'granted' && coords && (
                <MaterialCommunityIcons name="checkbox-marked-circle" size={16} color="#4CAF50" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={s.gpsSubText}>
              {gpsStatus === 'denied'
                ? 'Enable location in Settings'
                : coords
                ? `Accuracy: ±${Math.round(coords.accuracy)}m`
                : 'Waiting for GPS signal...'}
            </Text>
          </View>
        </View>

        <View style={s.mapPlaceholder}>
          {gpsStatus === 'loading' || !coords
            ? <ActivityIndicator color={Colors.orange} />
            : <MaterialCommunityIcons name="map-marker" size={32} color={Colors.orange} />
          }
          {coords && <Text style={s.accuracyText}>Accuracy: ±{Math.round(coords.accuracy)}m</Text>}
        </View>
      </View>

      {/* Active Class Card */}
      {loadingClass ? (
        <View style={[s.courseCard, { justifyContent: 'center' }]}>
          <ActivityIndicator color={Colors.orange} />
        </View>
      ) : activeClass ? (
        <View style={s.courseCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.courseTitle}>{activeClass.unit_code} — {activeClass.unit_name}</Text>
            <Text style={s.courseMeta}>
              {fmt12(activeClass.start_time)} - {fmt12(activeClass.end_time)}  •  {activeClass.room_code}
            </Text>
          </View>
          <View style={s.activeBadge}>
            <MaterialCommunityIcons name="shield-check-outline" size={12} color="#4CAF50" />
            <Text style={s.activeBadgeText}>Active</Text>
          </View>
        </View>
      ) : (
        <View style={s.courseCard}>
          <Text style={s.courseMeta}>No active class right now</Text>
        </View>
      )}

      {/* Action / Success / Failed */}
      {status === 'pending' || status === 'submitting' ? (
        <View style={s.actionArea}>
          <TouchableOpacity
            style={[s.verifyBtn, (!isReady || status === 'submitting') && { opacity: 0.5 }]}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={!isReady || status === 'submitting'}
          >
            {status === 'submitting'
              ? <ActivityIndicator color={Colors.white} />
              : <><MaterialCommunityIcons name="fingerprint" size={22} color="white" /><Text style={s.verifyBtnText}>Verify & Sygn</Text></>
            }
          </TouchableOpacity>
          <Text style={s.biometricText}>
            {!isReady ? 'Waiting for GPS and class data...' : 'Tap to mark your attendance'}
          </Text>
        </View>
      ) : (
        <View style={s.successArea}>
          <View style={[s.successCheck, { backgroundColor: status === 'success' ? '#4CAF50' : '#FF5252' }]}>
            <MaterialCommunityIcons name={status === 'success' ? 'check' : 'close'} size={40} color="white" />
          </View>
          <Text style={s.successTitle}>
            {status === 'success' ? "Sygn'd Successfully 🎉" : 'Check-in Rejected'}
          </Text>

          {result && (
            <View style={s.receiptCard}>
              <View style={s.receiptHeader}>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={16} color={Colors.orange} />
                <Text style={s.receiptLabel}>{status === 'success' ? 'DIGITAL RECEIPT' : 'REJECTION REASON'}</Text>
              </View>
              {status === 'success' ? (
                <>
                  <ReceiptRow label="Course" value={activeClass?.unit_code ?? '—'} />
                  <ReceiptRow label="Room" value={activeClass?.room_code ?? '—'} />
                  <ReceiptRow label="Time" value={new Date(result.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                </>
              ) : (
                <Text style={s.alertDesc}>{result.message}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 24 },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, letterSpacing: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  gpsCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 20, gap: 16 },
  gpsTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  gpsIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  gpsStatusText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  gpsSubText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  mapPlaceholder: { height: 120, backgroundColor: '#251A1A', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  accuracyText: { fontFamily: Fonts.regular, fontSize: 12, color: '#666', marginTop: 8 },
  courseCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 16, minHeight: 70 },
  courseTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  courseMeta: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 4 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E2D24', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  activeBadgeText: { fontFamily: Fonts.semiBold, fontSize: 12, color: '#4CAF50' },
  actionArea: { marginTop: 40, alignItems: 'center' },
  verifyBtn: { width: '100%', backgroundColor: Colors.orange, borderRadius: 50, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  verifyBtnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  biometricText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, marginTop: 16, textAlign: 'center' },
  successArea: { marginTop: 32, alignItems: 'center' },
  successCheck: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white, marginBottom: 24 },
  receiptCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 24, padding: 20, gap: 12 },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 12 },
  receiptLabel: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white, letterSpacing: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptKey: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.mutedText },
  receiptValue: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.white },
  alertDesc: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, lineHeight: 18 },
});
