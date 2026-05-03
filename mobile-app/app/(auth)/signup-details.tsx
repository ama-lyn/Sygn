import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Colors, Fonts } from '../../src/constants/theme';
import { API_URL } from '../../src/constants/api';

const YEAR_OPTIONS = ['1', '2', '3', '4'];

const getDeviceId = async () => {
  let id = await AsyncStorage.getItem('device_id');

  if (!id) {
    id = Crypto.randomUUID();
    await AsyncStorage.setItem('device_id', id);
  }

  return id;
};

export default function SignupDetails() {
  const router = useRouter();
  const { fullName, email, password } = useLocalSearchParams<{
    fullName: string; email: string; password: string;
  }>();

  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!studentId.trim() || !year || !course.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      /* ✅ NEW DEVICE ID LOGIC */
      const deviceId = await getDeviceId();

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          student_id: studentId.trim(),
          year: parseInt(year),
          course: course.trim(),
          device_id: deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Registration failed', data.detail ?? 'Something went wrong');
        return;
      }

      // Save token and user info
      await AsyncStorage.setItem('token', data.access_token);
      await AsyncStorage.setItem('student_id', data.student_id);
      await AsyncStorage.setItem('full_name', data.full_name);

      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <TouchableOpacity style={s.back} onPress={() => router.back()}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={s.logo}><Text style={s.logoText}>S</Text></View>

      <Text style={s.title}>Almost there</Text>
      <Text style={s.subtitle}>Step 2 of 2 · Academic info</Text>

      <View style={s.form}>
        <Text style={s.label}>STUDENT ID</Text>
        <TextInput
          style={s.input}
          placeholder="SCM211-0696/2022"
          placeholderTextColor="#555"
          autoCapitalize="characters"
          value={studentId}
          onChangeText={setStudentId}
        />

        <Text style={s.label}>YEAR OF STUDY</Text>
        <View style={s.yearRow}>
          {YEAR_OPTIONS.map((y) => (
            <TouchableOpacity
              key={y}
              style={[s.yearBtn, year === y && s.yearBtnActive]}
              onPress={() => setYear(y)}
            >
              <Text style={[s.yearText, year === y && s.yearTextActive]}>
                Year {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>COURSE</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Maths & Computer Science"
          placeholderTextColor="#555"
          autoCapitalize="words"
          value={course}
          onChangeText={setCourse}
        />

        <TouchableOpacity
          style={s.btn}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={s.btnText}>Create Account  →</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  back: { marginTop: 12, marginBottom: 8 },
  backText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText },
  logo: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoText: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, marginBottom: 32 },
  form: { gap: 10 },
  label: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: 4 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.white, fontFamily: Fonts.regular, fontSize: 14, marginBottom: 16 },
  yearRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  yearBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1E1E1E', alignItems: 'center' },
  yearBtnActive: { backgroundColor: Colors.orange },
  yearText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.mutedText },
  yearTextActive: { color: Colors.white },
  btn: { backgroundColor: Colors.orange, borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
});