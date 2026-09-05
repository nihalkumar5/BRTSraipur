import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  LinearGradient,
  Stop,
  Defs,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

interface BusLoadingScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function BusLoadingScreen({
  onFinish,
  duration = 2100,
}: BusLoadingScreenProps) {
  if (Platform.OS === 'web') {
    return null;
  }

  const isNative = true;

  const busBobAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const glowPulseAnim = useRef(new Animated.Value(0.4)).current;

  const [statusText, setStatusText] = useState('Connecting routes & stops...');

  useEffect(() => {
    // 1. Bus gentle float animation
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busBobAnim, {
          toValue: -7,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
        Animated.timing(busBobAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
      ])
    );
    bobLoop.start();

    // 2. Glow pulse animation
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 0.55,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: 0.35,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
      ])
    );
    glowLoop.start();

    // 3. Progress bar fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 4. Status step text changes
    const t1 = setTimeout(() => {
      setStatusText('Ready for your journey ✨');
    }, 1100);

    // 5. Clean exit: fade out inner elements on solid background, then unmount cleanly
    const exitTimer = setTimeout(() => {
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: isNative,
      }).start(() => {
        bobLoop.stop();
        glowLoop.stop();
        if (onFinish) onFinish();
      });
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(exitTimer);
      bobLoop.stop();
      glowLoop.stop();
    };
  }, [duration, onFinish, isNative]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: contentFadeAnim,
          },
        ]}
      >
        {/* Glow aura */}
        <Animated.View
          style={[
            styles.glowCircle,
            {
              opacity: glowPulseAnim,
            },
          ]}
        />

      {/* Central content card */}
      <View style={styles.centerCard}>
        {/* Floating bus icon container */}
        <Animated.View
          style={[
            styles.busIconBox,
            {
              transform: [{ translateY: busBobAnim }],
            },
          ]}
        >
          <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
            <Defs>
              <LinearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#E0E7FF" />
              </LinearGradient>
              <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#18258F" />
                <Stop offset="100%" stopColor="#0F174F" />
              </LinearGradient>
            </Defs>

            {/* Bus body */}
            <Rect x={10} y={16} width={52} height={38} rx={9} fill="url(#busGrad)" />

            {/* Windshield */}
            <Rect x={16} y={22} width={40} height={16} rx={4} fill="url(#glassGrad)" />

            {/* Destination LED sign */}
            <Rect x={26} y={18} width={20} height={3} rx={1.5} fill="#F59E0B" />

            {/* Headlights */}
            <Circle cx={19} cy={45} r={3} fill="#FDE047" />
            <Circle cx={53} cy={45} r={3} fill="#FDE047" />

            {/* Grille */}
            <Rect x={29} y={44} width={14} height={2} rx={1} fill="#94A3B8" />

            {/* Tires */}
            <Rect x={15} y={52} width={10} height={5} rx={2} fill="#0F174F" />
            <Rect x={47} y={52} width={10} height={5} rx={2} fill="#0F174F" />
          </Svg>
        </Animated.View>

        {/* Branding title */}
        <Text style={styles.brandTitle}>Tatpar BRTS</Text>
        <Text style={styles.brandSubtitle}>RAIPUR · NAVA RAIPUR</Text>
        <Text style={styles.initiativeText}>Public Transit Initiative</Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {/* Footer text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>छत्तीसगढ़ शासन · रायपुर स्मार्ट सिटी</Text>
      </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#18258F',
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: Math.min(SCREEN_WIDTH * 0.85, 360),
    height: Math.min(SCREEN_WIDTH * 0.85, 360),
    borderRadius: 180,
    backgroundColor: '#2B3BC4',
  },
  centerCard: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 28,
  },
  busIconBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C7D2FE',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  initiativeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93C5FD',
    letterSpacing: 0.3,
    marginBottom: 26,
  },
  progressContainer: {
    width: 170,
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E0E7FF',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(199, 210, 254, 0.65)',
    letterSpacing: 0.5,
  },
});
