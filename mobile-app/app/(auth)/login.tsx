import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Colors, Fonts } from '../../src/constants/theme';
import { login } from '../../src/constants/apiService';

const { width } = Dimensions.get('window');

const getDeviceId = async () => {
  let id = await AsyncStorage.getItem('device_id');
  if (!id) { id = Crypto.randomUUID(); await AsyncStorage.setItem('device_id', id); }
  return id;
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const data = await login(email.trim(), password, deviceId);
      await AsyncStorage.setItem('token', data.access_token);
      await AsyncStorage.setItem('student_id', data.student_id);
      await AsyncStorage.setItem('full_name', data.full_name);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Logo */}
      <View style={s.logo}>
        <Text style={s.logoText}>S</Text>
      </View>

      {/* Heading */}
      <Text style={s.title}>Welcome back</Text>
      <Text style={s.subtitle}>Sign in to SYGN</Text>

      {/* Fields */}
      <View style={s.form}>
        <Text style={s.label}>EMAIL OR STUDENT ID</Text>
        <TextInput
          style={s.input}
          placeholder="student@students.jkuat.ac.ke"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={s.label}>PASSWORD</Text>
        <View style={s.passwordWrap}>
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0 }]}
            placeholder="········"
            placeholderTextColor="#555"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Remember & Forgot */}
        <View style={s.row}>
          <View />
          <TouchableOpacity>
            <Text style={s.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In */}
        <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={s.btnText}>Sign In  →</Text>
          }
        </TouchableOpacity>

        {/* OR divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>OR</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Biometrics */}
        <TouchableOpacity style={s.bioBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="fingerprint" size={24} color={Colors.orange} />
          <Text style={s.bioText}>Sign in with Biometrics</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={s.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  logoText: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, marginBottom: 32 },
  form: { gap: 10 },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.mutedText,
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    paddingRight: 12,
  },
  eyeBtn: { padding: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#555',
    borderRadius: 3,
  },
  checkboxActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  rememberText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  forgot: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.orange },
  btn: {
    backgroundColor: Colors.orange,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.mutedText },
  bioBtn: {
    backgroundColor: '#1E1E1E',
    borderRadius: 50,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bioText: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.white },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 8,
  },
  footerText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText },
  footerLink: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.orange },
});
