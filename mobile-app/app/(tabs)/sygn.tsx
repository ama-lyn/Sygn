import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, ScrollView, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../src/constants/theme';
import {
  getTodayTimetable, markAttendance, submitAbsenceRequest,
  TimetableEntry, AttendanceResult,
} from '../../src/constants/apiService';

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

function findActiveClass(entries: TimetableEntry[]): TimetableEntry | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const active = entries.find((e) => {
    const [sh, sm] = e.start_time.split(':').map(Number);
    const [eh, em] = e.end_time.split(':').map(Number);
    return nowMins >= sh * 60 + sm - 15 && nowMins <= eh * 60 + em + 30;
  });
  if (active) return active;
  return entries.find((e) => {
    const [sh, sm] = e.start_time.split(':').map(Number);
    return nowMins < sh * 60 + sm;
  }) ?? entries[0] ?? null;
}

function isClassActive(entry: TimetableEntry): boolean {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = entry.start_time.split(':').map(Number);
  const [eh, em] = entry.end_time.split(':').map(Number);
  return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
}

export default function SygnScreen() {
  const [allClasses, setAllClasses] = useState<TimetableEntry[]>([]);
  const [activeClass, setActiveClass] = useState<TimetableEntry | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [status, setStatus] = useState<'pending' | 'submitting' | 'success' | 'failed'>('pending');
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);

  // Absence request state
  const [showApology, setShowApology] = useState(false);
  const [apologyReason, setApologyReason] = useState('');
  const [apologyDoc, setApologyDoc] = useState<string | null>(null);
  const [submittingApology, setSubmittingApology] = useState(false);

  useEffect(() => {
    getTodayTimetable()
      .then((entries) => {
        setAllClasses(entries);
        setActiveClass(findActiveClass(entries));
      })
      .catch(() => {})
      .finally(() => setLoadingClass(false));
  }, []);

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

    // Biometric check
    const biometricAvailable = await LocalAuthentication.hasHardwareAsync();
    if (biometricAvailable) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to Sygn in',
        fallbackLabel: 'Use passcode',
      });
      if (!auth.success) {
        Alert.alert('Authentication Failed', 'Biometric verification is required to sign in.');
        return;
      }
    }

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

  const handlePickDoc = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') { Alert.alert('Permission needed', 'Allow access to your photos to attach a document.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setApologyDoc(result.assets[0].uri);
  };

  const handleSubmitApology = async () => {
    if (!activeClass) return;
    if (!apologyReason.trim()) { Alert.alert('Required', 'Please provide a reason for your absence.'); return; }
    setSubmittingApology(true);
    try {
      await submitAbsenceRequest(activeClass.id, apologyReason.trim(), apologyDoc);
      Alert.alert('Submitted', 'Your absence request has been sent to your lecturer.');
      setShowApology(false);
      setApologyReason('');
      setApologyDoc(null);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not submit absence request');
    } finally {
      setSubmittingApology(false);
    }
  };

  const classIsLive = activeClass ? isClassActive(activeClass) : false;
  const isReady = gpsStatus === 'granted' && coords !== null && activeClass !== null && classIsLive;

  const getButtonLabel = () => {
    if (!activeClass) return 'No active class';
    if (!classIsLive) return `Class starts at ${fmt12(activeClass.start_time)}`;
    if (!coords) return 'Waiting for GPS...';
    return 'Verify & Sygn';
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
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
            <View style={[s.activeBadge, { backgroundColor: classIsLive ? '#1E2D24' : '#2A2410' }]}>
              <MaterialCommunityIcons
                name={classIsLive ? 'shield-check-outline' : 'clock-outline'}
                size={12}
                color={classIsLive ? '#4CAF50' : '#FFC107'}
              />
              <Text style={[s.activeBadgeText, { color: classIsLive ? '#4CAF50' : '#FFC107' }]}>
                {classIsLive ? 'Active' : 'Upcoming'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={s.courseCard}>
            <Text style={s.courseMeta}>No classes today</Text>
          </View>
        )}

        {/* Sign In / Result */}
        {status === 'pending' || status === 'submitting' ? (
          <View style={s.actionArea}>
            <TouchableOpacity
              style={[s.verifyBtn, (!isReady || status === 'submitting') && { opacity: 0.4 }]}
              onPress={handleVerify}
              activeOpacity={0.8}
              disabled={!isReady || status === 'submitting'}
            >
              {status === 'submitting'
                ? <ActivityIndicator color={Colors.white} />
                : <><MaterialCommunityIcons name="fingerprint" size={22} color="white" /><Text style={s.verifyBtnText}>{getButtonLabel()}</Text></>
              }
            </TouchableOpacity>
            <Text style={s.biometricText}>Biometric verification required</Text>

            {/* Absence Request Toggle */}
            {activeClass && (
              <TouchableOpacity style={s.apologyToggle} onPress={() => setShowApology(!showApology)}>
                <MaterialCommunityIcons name="file-document-edit-outline" size={16} color={Colors.orange} />
                <Text style={s.apologyToggleText}>
                  {showApology ? 'Cancel absence request' : "Can't attend? Send an apology"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Absence Request Form */}
            {showApology && activeClass && (
              <View style={s.apologyCard}>
                <Text style={s.apologyTitle}>ABSENCE REQUEST</Text>
                <Text style={s.apologyUnit}>{activeClass.unit_code} — {activeClass.unit_name}</Text>

                <TextInput
                  style={s.apologyInput}
                  placeholder="Reason for absence..."
                  placeholderTextColor="#555"
                  multiline
                  numberOfLines={4}
                  value={apologyReason}
                  onChangeText={setApologyReason}
                />

                <TouchableOpacity style={s.docPickerBtn} onPress={handlePickDoc}>
                  <MaterialCommunityIcons name="paperclip" size={16} color={Colors.orange} />
                  <Text style={s.docPickerText}>
                    {apologyDoc ? 'Document attached ✓' : 'Attach supporting document (optional)'}
                  </Text>
                </TouchableOpacity>

                {apologyDoc && (
                  <Image source={{ uri: apologyDoc }} style={s.docPreview} resizeMode="cover" />
                )}

                <TouchableOpacity
                  style={[s.apologySubmitBtn, submittingApology && { opacity: 0.5 }]}
                  onPress={handleSubmitApology}
                  disabled={submittingApology}
                >
                  {submittingApology
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <Text style={s.apologySubmitText}>Submit Absence Request</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
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
                  <>
                    <ReceiptRow label="⏱ Temporal" value={result.validation.temporal_valid ? '✓ Pass' : '✗ Fail'} isOrange={!result.validation.temporal_valid} />
                    <ReceiptRow label="📍 Spatial" value={result.validation.spatial_valid ? '✓ Pass' : '✗ Fail'} isOrange={!result.validation.spatial_valid} />
                    <ReceiptRow label="🔐 Identity" value={result.validation.identity_valid ? '✓ Pass' : '✗ Fail'} isOrange={!result.validation.identity_valid} />
                  </>
                )}
              </View>
            )}

            <TouchableOpacity style={s.retryBtn} onPress={() => { setStatus('pending'); setResult(null); }}>
              <Text style={s.retryText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
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
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  activeBadgeText: { fontFamily: Fonts.semiBold, fontSize: 12 },
  actionArea: { marginTop: 32, alignItems: 'center', width: '100%' },
  verifyBtn: { width: '100%', backgroundColor: Colors.orange, borderRadius: 50, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  verifyBtnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  biometricText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 10, textAlign: 'center' },
  apologyToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  apologyToggleText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.orange },
  apologyCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginTop: 16, gap: 14 },
  apologyTitle: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1 },
  apologyUnit: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  apologyInput: { backgroundColor: '#111', borderRadius: 12, padding: 14, color: Colors.white, fontFamily: Fonts.regular, fontSize: 14, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#2A2A2A' },
  docPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 12, paddingHorizontal: 14 },
  docPickerText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.orange },
  docPreview: { width: '100%', height: 140, borderRadius: 12 },
  apologySubmitBtn: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: Colors.orange, borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  apologySubmitText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.orange },
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
  retryBtn: { marginTop: 20, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 50, borderWidth: 1, borderColor: '#333' },
  retryText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText },
});
