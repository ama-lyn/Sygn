import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../src/constants/theme';

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    router.push({
      pathname: '/(auth)/signup-details',
      params: { fullName, email, password },
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.logo}><Text style={s.logoText}>S</Text></View>

      <Text style={s.title}>Create Account</Text>
      <Text style={s.subtitle}>Step 1 of 2 · Basic info</Text>

      <View style={s.form}>
        <Text style={s.label}>FULL NAME</Text>
        <TextInput
          style={s.input} placeholder="John Doe" placeholderTextColor="#555"
          autoCapitalize="words" value={fullName} onChangeText={setFullName}
        />

        <Text style={s.label}>EMAIL</Text>
        <TextInput
          style={s.input} placeholder="student@students.jkuat.ac.ke"
          placeholderTextColor="#555" keyboardType="email-address"
          autoCapitalize="none" value={email} onChangeText={setEmail}
        />

        <Text style={s.label}>PASSWORD</Text>
        <View style={s.passwordWrap}>
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0 }]}
            placeholder="········" placeholderTextColor="#555"
            secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
          />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.btnText}>Next  →</Text>
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={s.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  logo: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 20 },
  logoText: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  title: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText, marginBottom: 32 },
  form: { gap: 10 },
  label: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.mutedText, letterSpacing: 1, marginBottom: 4 },
  input: { backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.white, fontFamily: Fonts.regular, fontSize: 14, marginBottom: 16 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 20, paddingRight: 12 },
  eyeBtn: { padding: 4 },
  btn: { backgroundColor: Colors.orange, borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.white },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 8 },
  footerText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.mutedText },
  footerLink: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.orange },
});
