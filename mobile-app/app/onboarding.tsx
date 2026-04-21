import { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../src/constants/theme';
import { ReactNode } from 'react';

const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  icon: () => ReactNode;
};

const slides: Slide[] = [
  {
    id: '1',
    title: 'Your presence, verified.',
    subtitle: "SYGN uses GPS to confirm you're physically in the lecture room. No faking it.",
    icon: () => <SlideIcon shape="geo" />,
  },
  {
    id: '2',
    title: 'No proxies. Ever.',
    subtitle: 'Biometric verification ensures only you can mark your attendance. Secure and tamper-proof.',
    icon: () => <SlideIcon shape="shield" />,
  },
  {
    id: '3',
    title: 'Streaks & insights.',
    subtitle: 'Track your attendance, build streaks, earn rewards, and stay on top of every course.',
    icon: () => <SlideIcon shape="chart" />,
  },
];

// ── Decorative icon illustrations ─────────────────────────

function SlideIcon({ shape }: { shape: 'geo' | 'shield' | 'chart' }) {
  return (
    <View style={icon.wrapper}>
      <ConnectorLines shape={shape} />
      <View style={icon.pill}>
        <Text style={icon.emoji}>
          {shape === 'geo' ? '📍' : shape === 'shield' ? '🛡️' : '📈'}
        </Text>
      </View>
    </View>
  );
}

function ConnectorLines({ shape }: { shape: string }) {
  if (shape === 'geo') {
    return (
      <>
        <View style={[dot.base, { top: 10, left: 20 }]} />
        <View style={[dot.base, { top: 10, right: 10 }]} />
        <View style={[dot.base, { bottom: 10, left: 10 }]} />
        <View style={[dot.base, { bottom: 10, right: 30 }]} />

        <View style={[line.base, { top: 18, left: 28, width: 80, transform: [{ rotate: '-15deg' }] }]} />
        <View style={[line.base, { top: 18, right: 18, width: 60, transform: [{ rotate: '30deg' }] }]} />
        <View style={[line.base, { bottom: 18, left: 18, width: 70, transform: [{ rotate: '-20deg' }] }]} />
      </>
    );
  }

  if (shape === 'shield') {
    return (
      <>
        <View style={[dot.base, { top: 20, left: 20 }]} />
        <View style={[dot.base, { top: 20, right: 20 }]} />
        <View style={[dot.base, { bottom: 20, left: 20 }]} />
        <View style={[dot.base, { bottom: 20, right: 20 }]} />

        <View style={[line.base, { top: '50%', left: 0, width: 40 }]} />
        <View style={[line.base, { top: '50%', right: 0, width: 40 }]} />
        <View style={[line.base, { left: '50%', top: 0, width: 2, height: 40 }]} />
        <View style={[line.base, { left: '50%', bottom: 0, width: 2, height: 40 }]} />
      </>
    );
  }

  return (
    <>
      <View style={[dot.base, { bottom: 30, left: 10 }]} />
      <View style={[dot.base, { top: 30, left: '40%' }]} />
      <View style={[dot.base, { top: 20, right: 10 }]} />

      <View style={[line.base, { bottom: 34, left: 18, width: 90, transform: [{ rotate: '-25deg' }] }]} />
      <View style={[line.base, { top: 34, left: '42%', width: 70, transform: [{ rotate: '-10deg' }] }]} />
    </>
  );
}

const dot = StyleSheet.create({
  base: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#555',
  },
});

const line = StyleSheet.create({
  base: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: Colors.orange,
    opacity: 0.6,
  },
});

const icon = StyleSheet.create({
  wrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
});

// ── Main component ─────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  });

  const handleContinue = () => {
    if (activeIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={s.slide}>
            {item.icon()}
            <View style={s.textBlock}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[s.dotItem, i === activeIndex && s.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={s.btn} onPress={handleContinue} activeOpacity={0.85}>
        <Text style={s.btnText}>
          {activeIndex === slides.length - 1 ? 'Get Started' : 'Continue'} {' →'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={s.skipWrap}>
        <Text style={s.skip}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dotItem: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dot,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.orange,
  },
  btn: {
    width: width - 64,
    backgroundColor: Colors.orange,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
  skipWrap: {
    paddingBottom: 8,
  },
  skip: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.mutedText,
  },
});