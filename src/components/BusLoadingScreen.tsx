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
  Path,
  Line,
  LinearGradient,
  Stop,
  Defs,
  G,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

interface BusLoadingScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function BusLoadingScreen({
  onFinish,
  duration = 2400,
}: BusLoadingScreenProps) {
  if (Platform.OS === 'web') {
    return null;
  }

  const isNative = true;

  // Animation values
  const busSuspensionAnim = useRef(new Animated.Value(0)).current;
  const busTiltAnim = useRef(new Animated.Value(0)).current;
  const wheelSpinAnim = useRef(new Animated.Value(0)).current;
  const roadScrollAnim = useRef(new Animated.Value(0)).current;
  const windScrollAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const glowPulseAnim = useRef(new Animated.Value(0.35)).current;

  const [statusText, setStatusText] = useState('Connecting routes & live stations...');

  useEffect(() => {
    // 1. Bus subtle suspension bounce (micro-vibrations)
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busSuspensionAnim, {
          toValue: -2.5,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
        Animated.timing(busSuspensionAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
        Animated.timing(busSuspensionAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
      ])
    );
    bounceLoop.start();

    // 2. Bus acceleration pitch tilt
    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busTiltAnim, {
          toValue: -0.6,
          duration: 450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
        Animated.timing(busTiltAnim, {
          toValue: 0.5,
          duration: 450,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: isNative,
        }),
      ])
    );
    tiltLoop.start();

    // 3. Wheel continuous spin
    const wheelLoop = Animated.loop(
      Animated.timing(wheelSpinAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    wheelLoop.start();

    // 4. Moving road dashes (infinite conveyor)
    const roadLoop = Animated.loop(
      Animated.timing(roadScrollAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    roadLoop.start();

    // 5. Wind particles gliding right-to-left
    const windLoop = Animated.loop(
      Animated.timing(windScrollAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    windLoop.start();

    // 6. Ambient background glow pulse
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulseAnim, {
          toValue: 0.55,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(glowPulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
      ])
    );
    glowLoop.start();

    // 7. Linear progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 8. Dynamic status text sequence
    const t1 = setTimeout(() => {
      setStatusText('Syncing Raipur BRTS GPS telemetry...');
    }, 850);

    const t2 = setTimeout(() => {
      setStatusText('Ready for your journey ✨');
    }, 1650);

    // 9. Smooth exit fade
    const exitTimer = setTimeout(() => {
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: isNative,
      }).start(() => {
        bounceLoop.stop();
        tiltLoop.stop();
        wheelLoop.stop();
        roadLoop.stop();
        windLoop.stop();
        glowLoop.stop();
        if (onFinish) onFinish();
      });
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
      bounceLoop.stop();
      tiltLoop.stop();
      wheelLoop.stop();
      roadLoop.stop();
      windLoop.stop();
      glowLoop.stop();
    };
  }, [duration, onFinish, isNative]);

  // Interpolations
  const wheelRotation = wheelSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const busTiltDeg = busTiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-0.8deg', '0.8deg'],
  });

  const roadTranslateX = roadScrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -36],
  });

  const windTranslateX = windScrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, -180],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '100%'],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.contentWrapper, { opacity: contentFadeAnim }]}>
        {/* Soft atmospheric blue glow */}
        <Animated.View style={[styles.glowBackdrop, { opacity: glowPulseAnim }]} />

        {/* --- MOVING BUS STAGE --- */}
        <View style={styles.stageContainer}>
          {/* Animated Speed Wind Streaks */}
          <Animated.View
            style={[
              styles.windStreamLayer,
              {
                transform: [{ translateX: windTranslateX }],
              },
            ]}
          >
            <View style={[styles.windStreak, { width: 50, top: 12, opacity: 0.6 }]} />
            <View style={[styles.windStreak, { width: 35, top: 38, opacity: 0.4 }]} />
            <View style={[styles.windStreak, { width: 65, top: 62, opacity: 0.5 }]} />
          </Animated.View>

          {/* Floating Aesthetic Bus Unit with Suspension & Tilt */}
          <Animated.View
            style={[
              styles.busWrapper,
              {
                transform: [
                  { translateY: busSuspensionAnim },
                  { rotate: busTiltDeg },
                ],
              },
            ]}
          >
            {/* Soft contact shadow on asphalt */}
            <View style={styles.busContactShadow} />

            {/* Front Headlight Light Beam illuminating ahead */}
            <View style={styles.headlightCone} />

            {/* Modern Electric BRTS Bus Side Profile SVG */}
            <Svg width={230} height={84} viewBox="0 0 230 84" fill="none">
              <Defs>
                <LinearGradient id="busBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFFFF" />
                  <Stop offset="55%" stopColor="#F1F5F9" />
                  <Stop offset="100%" stopColor="#E2E8F0" />
                </LinearGradient>
                <LinearGradient id="busWindowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0F172A" />
                  <Stop offset="100%" stopColor="#1E293B" />
                </LinearGradient>
                <LinearGradient id="stripeBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#18258F" />
                  <Stop offset="70%" stopColor="#2563EB" />
                  <Stop offset="100%" stopColor="#38BDF8" />
                </LinearGradient>
                <LinearGradient id="ledBannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#1E1B4B" />
                  <Stop offset="100%" stopColor="#0F172A" />
                </LinearGradient>
              </Defs>

              {/* Roof AC Pod & Aero fairing */}
              <Rect x={70} y={6} width={76} height={7} rx={3.5} fill="#CBD5E1" />
              <Rect x={75} y={8} width={20} height={3} rx={1.5} fill="#94A3B8" />
              <Rect x={100} y={8} width={20} height={3} rx={1.5} fill="#94A3B8" />
              <Rect x={125} y={8} width={16} height={3} rx={1.5} fill="#94A3B8" />

              {/* Main Bus Aerodynamic Body */}
              <Path
                d="M 16 22
                   C 16 16, 22 12, 28 12
                   L 204 12
                   C 216 12, 224 22, 226 34
                   L 227 60
                   C 227 64, 224 66, 218 66
                   L 18 66
                   C 14 66, 12 63, 12 58
                   L 12 28
                   C 12 24, 14 22, 16 22 Z"
                fill="url(#busBodyGrad)"
              />

              {/* Front Aerodynamic Windshield */}
              <Path
                d="M 198 16
                   L 208 16
                   C 218 16, 223 24, 225 36
                   L 198 36 Z"
                fill="url(#busWindowGrad)"
              />

              {/* Panoramic Tinted Side Windows (4 large commuter bays) */}
              <Rect x={26} y={16} width={38} height={20} rx={3} fill="url(#busWindowGrad)" />
              <Rect x={68} y={16} width={38} height={20} rx={3} fill="url(#busWindowGrad)" />
              <Rect x={110} y={16} width={38} height={20} rx={3} fill="url(#busWindowGrad)" />
              <Rect x={152} y={16} width={42} height={20} rx={3} fill="url(#busWindowGrad)" />

              {/* Window Glass Reflection Accents */}
              <Line x1={32} y1={18} x2={58} y2={34} stroke="#475569" strokeWidth={1.2} strokeOpacity={0.6} />
              <Line x1={74} y1={18} x2={100} y2={34} stroke="#475569" strokeWidth={1.2} strokeOpacity={0.6} />
              <Line x1={116} y1={18} x2={142} y2={34} stroke="#475569" strokeWidth={1.2} strokeOpacity={0.6} />
              <Line x1={158} y1={18} x2={186} y2={34} stroke="#475569" strokeWidth={1.2} strokeOpacity={0.6} />

              {/* Amber LED Destination Display Banner */}
              <Rect x={110} y={18} width={76} height={6} rx={2} fill="url(#ledBannerGrad)" />
              <Rect x={114} y={20} width={68} height={2} rx={1} fill="#F59E0B" />

              {/* Signature Raipur BRTS Speed Wave Striping */}
              <Path
                d="M 12 44
                   L 225 44
                   L 226 50
                   L 12 50 Z"
                fill="url(#stripeBlueGrad)"
              />
              <Path
                d="M 12 51
                   L 226 51
                   L 226 53
                   L 12 53 Z"
                fill="#10B981"
              />

              {/* Clean Electric Green Transit Emblem */}
              <Circle cx={105} cy={47} r={2.5} fill="#FFFFFF" />
              <Circle cx={105} cy={47} r={1.2} fill="#10B981" />

              {/* Front Crystal LED Headlight */}
              <Path
                d="M 224 48
                   C 227 48, 228 52, 227 56
                   L 221 56
                   L 221 48 Z"
                fill="#FEF08A"
              />
              {/* Rear Ruby LED Taillight */}
              <Rect x={12} y={46} width={3} height={10} rx={1} fill="#EF4444" />

              {/* Wheel Well Arches */}
              <Path d="M 40 66 A 15 15 0 0 1 70 66 Z" fill="#0F172A" />
              <Path d="M 166 66 A 15 15 0 0 1 196 66 Z" fill="#0F172A" />
            </Svg>

            {/* Rear Spinning Wheel */}
            <Animated.View
              style={[
                styles.wheelContainer,
                { left: 41, transform: [{ rotate: wheelRotation }] },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Circle cx={14} cy={14} r={13} fill="#0F172A" stroke="#334155" strokeWidth={1.5} />
                <Circle cx={14} cy={14} r={8} fill="#475569" />
                <Circle cx={14} cy={14} r={3} fill="#CBD5E1" />
                {/* 5-Spoke Alloy Pattern */}
                <Line x1={14} y1={6} x2={14} y2={22} stroke="#CBD5E1" strokeWidth={1.5} />
                <Line x1={6} y1={11} x2={22} y2={17} stroke="#CBD5E1" strokeWidth={1.5} />
                <Line x1={6} y1={17} x2={22} y2={11} stroke="#CBD5E1" strokeWidth={1.5} />
              </Svg>
            </Animated.View>

            {/* Front Spinning Wheel */}
            <Animated.View
              style={[
                styles.wheelContainer,
                { left: 167, transform: [{ rotate: wheelRotation }] },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Circle cx={14} cy={14} r={13} fill="#0F172A" stroke="#334155" strokeWidth={1.5} />
                <Circle cx={14} cy={14} r={8} fill="#475569" />
                <Circle cx={14} cy={14} r={3} fill="#CBD5E1" />
                {/* 5-Spoke Alloy Pattern */}
                <Line x1={14} y1={6} x2={14} y2={22} stroke="#CBD5E1" strokeWidth={1.5} />
                <Line x1={6} y1={11} x2={22} y2={17} stroke="#CBD5E1" strokeWidth={1.5} />
                <Line x1={6} y1={17} x2={22} y2={11} stroke="#CBD5E1" strokeWidth={1.5} />
              </Svg>
            </Animated.View>
          </Animated.View>

          {/* --- MOVING ROAD STRIP (CONVEYOR) --- */}
          <View style={styles.roadPlatform}>
            <View style={styles.roadSurface} />
            <View style={styles.roadStripeTrack}>
              <Animated.View
                style={[
                  styles.roadDashesRow,
                  {
                    transform: [{ translateX: roadTranslateX }],
                  },
                ]}
              >
                {[...Array(14)].map((_, i) => (
                  <View key={i} style={styles.roadDash} />
                ))}
              </Animated.View>
            </View>
          </View>
        </View>

        {/* --- PREMIUM BRANDING & LIVE STATUS --- */}
        <View style={styles.textSection}>
          <Text style={styles.brandTitle}>Tatpar BRTS</Text>
          <Text style={styles.brandSubtitle}>RAIPUR · NAVA RAIPUR EXPRESS</Text>
          <Text style={styles.initiativeText}>High-Frequency Electric Bus Corridor</Text>

          {/* Clean sleek progress bar */}
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

          {/* Status text with micro glow */}
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        {/* Footer Authority */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>छत्तीसगढ़ शासन · रायपुर स्मार्ट सिटी लिमिटेड</Text>
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
    backgroundColor: '#0E164D', // Deep modern midnight navy
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
  glowBackdrop: {
    position: 'absolute',
    width: Math.min(SCREEN_WIDTH * 0.9, 380),
    height: Math.min(SCREEN_WIDTH * 0.9, 380),
    borderRadius: 190,
    backgroundColor: '#1E2D99',
  },

  /* --- MOVING BUS STAGE --- */
  stageContainer: {
    width: 290,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  windStreamLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 280,
    height: 90,
    zIndex: 1,
  },
  windStreak: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 1,
  },
  busWrapper: {
    width: 230,
    height: 84,
    position: 'relative',
    zIndex: 2,
  },
  busContactShadow: {
    position: 'absolute',
    bottom: 11,
    left: 14,
    width: 202,
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    transform: [{ scaleY: 0.5 }],
  },
  headlightCone: {
    position: 'absolute',
    right: -28,
    bottom: 24,
    width: 32,
    height: 14,
    backgroundColor: 'rgba(253, 224, 71, 0.12)',
    borderRadius: 10,
    transform: [{ skewX: '-35deg' }],
  },
  wheelContainer: {
    position: 'absolute',
    bottom: 5,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },

  /* --- MOVING ROAD STRIP --- */
  roadPlatform: {
    width: 280,
    height: 20,
    alignItems: 'center',
    marginTop: -4,
    zIndex: 2,
  },
  roadSurface: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 1.5,
  },
  roadStripeTrack: {
    width: 280,
    height: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  roadDashesRow: {
    flexDirection: 'row',
    width: 380,
    gap: 16,
  },
  roadDash: {
    width: 20,
    height: 2.5,
    backgroundColor: '#60A5FA',
    borderRadius: 1.5,
    opacity: 0.85,
  },

  /* --- BRANDING & STATUS --- */
  textSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  initiativeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(224, 231, 255, 0.75)',
    letterSpacing: 0.3,
    marginBottom: 24,
  },
  progressContainer: {
    width: 180,
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E0E7FF',
    letterSpacing: 0.2,
  },

  /* --- FOOTER --- */
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
