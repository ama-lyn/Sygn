import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../src/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const enrolledClasses = [
  { code: 'ICS 2301', name: 'Data Structures' },
  { code: 'ICS 2205', name: 'Operating Systems' },
  { code: 'SMA 2104', name: 'Linear Algebra' },
  { code: 'ICS 2106', name: 'Computer Networks' },
];

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

// ── Setting Row ────────────────────────────────────────────
function SettingRow({
  icon, label, value, isToggle, toggleValue, onToggle,
}: {
  icon: IconName;
  label: string;
  value?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  return (
    <View style={setting.row}>
      <MaterialCommunityIcons name={icon} size={20} color={Colors.mutedText} />
      <Text style={setting.label}>{label}</Text>
      <View style={setting.right}>
        {isToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#333', true: Colors.orange + '88' }}
            thumbColor={toggleValue ? Colors.orange : '#666'}
          />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  label: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: Colors.white },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
});

// ── Profile Screen ─────────────────────────────────────────
export default function Profile() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <Text style={s.pageTitle}>Profile</Text>
        <Text style={s.pageSubtitle}>ACCOUNT & SETTINGS</Text>

        {/* User Card */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <MaterialCommunityIcons name="account" size={28} color={Colors.white} />
          </View>
          <View>
            <Text style={s.userName}>Gwendolyn Amanda</Text>
            <Text style={s.userId}>SCM211-0696/2022</Text>
            <Text style={s.userMeta}>Maths and Computer Science</Text>
             <Text style={s.userMeta}>Year 4</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <StatCard value="4" label="COURSES" />
          <StatCard value="84%" label="ATTENDANCE" />
          <StatCard value="7 🔥" label="STREAK" />
        </View>

        {/* Enrolled Classes */}
        <Text style={s.sectionLabel}>ENROLLED CLASSES</Text>
        <View style={s.listCard}>
          {enrolledClasses.map((c, i) => (
            <TouchableOpacity
              key={c.code}
              style={[s.classRow, i < enrolledClasses.length - 1 && s.classRowBorder]}
            >
              <Text style={s.classText}>{c.code} — {c.name}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#444" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <Text style={s.sectionLabel}>SETTINGS</Text>
        <View style={s.listCard}>
          <SettingRow
            icon="weather-night"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
          <SettingRow
            icon="fingerprint"
            label="Biometric Authentication"
            value={biometrics ? 'Enabled' : 'Disabled'}
            isToggle
            toggleValue={biometrics}
            onToggle={setBiometrics}
          />
          <SettingRow
            icon="bell-outline"
            label="Notifications"
            isToggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <View style={{ borderBottomWidth: 0 }}>
            <SettingRow icon="tray-arrow-down" label="Download Reports" />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={s.signOut}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.7}
        >
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
  pageTitle: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.white, paddingTop: 8 },
  pageSubtitle: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginTop: -8 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.white },
  userId: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 2 },
  userMeta: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  statsRow: { flexDirection: 'row', gap: 10 },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.mutedText,
    letterSpacing: 1,
    marginBottom: -6,
  },
  listCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  classRowBorder: { borderBottomWidth: 1, borderBottomColor: '#222' },
  classText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.white },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  signOutText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.orange },
});
