import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

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
          placeholder="student@university.edu"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={s.label}>PASSWORD</Text>
        <View style={s.passwordWrap}>
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0 }]}
            placeholder="········"
            placeholderTextColor="#555"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Remember & Forgot */}
        <View style={s.row}>
          <TouchableOpacity style={s.checkRow} onPress={() => setRemember(!remember)}>
            <View style={[s.checkbox, remember && s.checkboxActive]} />
            <Text style={s.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={s.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In */}
        <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.btnText}>Sign In  →</Text>
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
