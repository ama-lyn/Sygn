import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../src/constants/theme';
import { useAppData } from '../../src/constants/AppContext';
import { clearSession } from '../../src/constants/apiService';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={stat.card}>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}
const stat = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  value: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  label: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, marginTop: 2, letterSpacing: 0.5 },
});

function SettingRow({ icon, label, value, isToggle, toggleValue, onToggle }: {
  icon: IconName; label: string; value?: string;
  isToggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void;
}) {
  return (
    <View style={setting.row}>
      <MaterialCommunityIcons name={icon} size={20} color={Colors.mutedText} />
      <Text style={setting.label}>{label}</Text>
      <View style={setting.right}>
        {isToggle ? (
          <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ false: '#333', true: Colors.orange + '88' }} thumbColor={toggleValue ? Colors.orange : '#666'} />
        ) : (
          <>
            {value && <Text style={setting.value}>{value}</Text>}
            <MaterialCommunityIcons name="chevron-right" size={18} color="#444" />
          </>
        )}
      </View>
    </View>
  );
}
const setting = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  label: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.white },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.mutedText },
});

export default function Profile() {
  const router = useRouter();
  const { profile, loading, refresh } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleDownloadReport = async () => {
    if (!profile) return;
    const header = 'Unit Code,Unit Name,Attendance %';
    const rows = profile.enrolled_classes.map((c) => `${c.unit_code},${c.unit_name},N/A`).join('\n');
    const csv = `Student: ${profile.full_name}\nID: ${profile.student_id}\nOverall: ${profile.stats.attendance_percentage}%\n\n${header}\n${rows}`;
    await Share.share({ message: csv, title: 'Sygn Attendance Report' });
  };

  const handleSignOut = async () => {
    await clearSession();
    router.replace('/(auth)/login');
  };

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
        <Text style={s.pageTitle}>Profile</Text>
        <Text style={s.pageSubtitle}>ACCOUNT & SETTINGS</Text>

        <View style={s.userCard}>
          <View style={s.avatar}>
            <MaterialCommunityIcons name="account" size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={s.userName}>{profile?.full_name ?? '—'}</Text>
            <Text style={s.userId}>{profile?.student_id ?? '—'}</Text>
            <Text style={s.userMeta}>{profile?.course ?? '—'}</Text>
            <Text style={s.userMeta}>Year {profile?.year ?? '—'}</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <StatCard value={String(profile?.stats.enrolled_count ?? 0)} label="COURSES" />
          <StatCard value={`${profile?.stats.attendance_percentage ?? 0}%`} label="ATTENDANCE" />
          <StatCard value={`${profile?.streak ?? 0} 🔥`} label="STREAK" />
        </View>

        <Text style={s.sectionLabel}>SETTINGS</Text>
        <View style={s.listCard}>
          <SettingRow icon="fingerprint" label="Biometric Authentication" isToggle toggleValue={biometrics} onToggle={setBiometrics} />
          <SettingRow icon="bell-outline" label="Notifications" isToggle toggleValue={notifications} onToggle={setNotifications} />
          <View style={{ borderBottomWidth: 0 }}>
            <TouchableOpacity onPress={handleDownloadReport}>
              <SettingRow icon="tray-arrow-down" label="Download Reports" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.signOut} onPress={handleSignOut} activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout" size={18} color={Colors.orange} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  pageTitle: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, paddingTop: 20 },
  pageSubtitle: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginTop: -8 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center' },
  userName: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.white },
  userId: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 2 },
  userMeta: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  statsRow: { flexDirection: 'row', gap: 10 },
  sectionLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: -6 },
  listCard: { backgroundColor: '#1A1A1A', borderRadius: 16, paddingHorizontal: 16 },
  classRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  classRowBorder: { borderBottomWidth: 1, borderBottomColor: '#222' },
  classText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.white },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  signOutText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.orange },
});
