import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';

export default function SygnScreen() {
  const [status, setStatus] = useState<'pending' | 'success'>('pending');

  const handleVerify = () => {
    // In a real app, this is where you'd trigger LocalAuthentication (Biometrics)
    setStatus('success');
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Check-in</Text>
        <Text style={s.subtitle}>VERIFY YOUR PRESENCE</Text>
      </View>

      {/* 1. GPS Verification Card (Always visible) */}
      <View style={s.gpsCard}>
        <View style={s.gpsTop}>
          <View style={s.gpsIconWrap}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color="#4CAF50" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.row}>
              <Text style={s.gpsStatusText}>Inside Classroom</Text>
              <MaterialCommunityIcons name="checkbox-marked-circle" size={16} color="#4CAF50" style={{ marginLeft: 4 }} />
            </View>
            <Text style={s.gpsSubText}>CLB 102 • GPS Verified</Text>
          </View>
        </View>

        {/* Map Visualization Placeholder */}
        <View style={s.mapPlaceholder}>
          <View style={s.mapUserPulse} />
          <MaterialCommunityIcons name="map-marker" size={32} color={Colors.orange} />
          <Text style={s.accuracyText}>Accuracy: ±3m</Text>
        </View>
      </View>

      {/* 2. Course Info Card (Always visible) */}
      <View style={s.courseCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.courseTitle}>ICS 2301 — Data Structures</Text>
          <Text style={s.courseMeta}>
            <MaterialCommunityIcons name="clock-outline" size={12} /> 9:00 - 10:00 AM • Prof. Williams
          </Text>
        </View>
        <View style={s.activeBadge}>
          <MaterialCommunityIcons name="shield-check-outline" size={12} color="#4CAF50" />
          <Text style={s.activeBadgeText}>Active</Text>
        </View>
      </View>

      {/* 3. Conditional Action/Success Area */}
      {status === 'pending' ? (
        <View style={s.actionArea}>
          <TouchableOpacity style={s.verifyBtn} onPress={handleVerify} activeOpacity={0.8}>
            <MaterialCommunityIcons name="fingerprint" size={24} color="white" />
            <Text style={s.verifyBtnText}>Verify & Sygn</Text>
          </TouchableOpacity>
          <Text style={s.biometricText}>Biometric verification required</Text>
        </View>
      ) : (
        <View style={s.successArea}>
          <View style={s.successCheck}>
            <MaterialCommunityIcons name="check" size={40} color="white" />
          </View>
          <Text style={s.successTitle}>Sygn'd Successfully 🎉</Text>

          {/* Digital Receipt */}
          <View style={s.receiptCard}>
            <View style={s.receiptHeader}>
               <MaterialCommunityIcons name="ticket-confirmation-outline" size={16} color={Colors.orange} />
               <Text style={s.receiptLabel}>DIGITAL RECEIPT</Text>
            </View>
            
            <ReceiptRow label="Course" value="ICS 2301" />
            <ReceiptRow label="Room" value="CLB 102" />
            <ReceiptRow label="Time" value="9:03 AM" />
            <ReceiptRow label="Streak" value="8 days 🔥" isOrange />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value, isOrange }: any) {
  return (
    <View style={s.receiptRow}>
      <Text style={s.receiptKey}>{label}</Text>
      <Text style={[s.receiptValue, isOrange && { color: Colors.orange }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { marginTop: 10, marginBottom: 24 },
  title: { fontFamily: Fonts.bold, fontSize: 32, color: Colors.white },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, letterSpacing: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center' },

  // GPS Card
  gpsCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 20, gap: 16 },
  gpsTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  gpsIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E2D24', alignItems: 'center', justifyContent: 'center' },
  gpsStatusText: { fontFamily: Fonts.semiBold, fontSize: 18, color: Colors.white },
  gpsSubText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  mapPlaceholder: { 
    height: 160, backgroundColor: '#251A1A', borderRadius: 18, 
    alignItems: 'center', justifyContent: 'center', position: 'relative' 
  },
  mapUserPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', opacity: 0.3 },
  accuracyText: { fontFamily: Fonts.regular, fontSize: 12, color: '#666', marginTop: 8 },

  // Course Card
  courseCard: { 
    backgroundColor: '#1A1A1A', borderRadius: 20, padding: 18, 
    flexDirection: 'row', alignItems: 'center', marginTop: 16 
  },
  courseTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
  courseMeta: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText, marginTop: 4 },
  activeBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: '#1E2D24', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 
  },
  activeBadgeText: { fontFamily: Fonts.semiBold, fontSize: 12, color: '#4CAF50' },

  // Action Area
  actionArea: { marginTop: 40, alignItems: 'center' },
  verifyBtn: { 
    width: '100%', height: 70, backgroundColor: Colors.orange, borderRadius: 35, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 
  },
  verifyBtnText: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  biometricText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, marginTop: 16 },

  // Success Area
  successArea: { marginTop: 32, alignItems: 'center' },
  successCheck: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.white, marginBottom: 24 },
  
  receiptCard: { width: '100%', backgroundColor: '#1A1A1A', borderRadius: 24, padding: 20, gap: 12 },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 12 },
  receiptLabel: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white, letterSpacing: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptKey: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.mutedText },
  receiptValue: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white },
});