import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { CitySkylineSvg } from './CitySkylineSvg';

interface BusLoadingScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function BusLoadingScreen({
  onFinish,
  duration = 2400,
}: BusLoadingScreenProps) {
  const isNative = Platform.OS !== 'web';

  // Animation values
  const busSuspensionAnim = useRef(new Animated.Value(0)).current;
  const busTiltAnim = useRef(new Animated.Value(0)).current;
  const wheelSpinAnim = useRef(new Animated.Value(0)).current;
  const roadScrollAnim = useRef(new Animated.Value(0)).current;
  const windScrollAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

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

    // 6. Linear progress fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // 7. Dynamic status text sequence
    const t1 = setTimeout(() => {
      setStatusText('Syncing Raipur BRTS GPS telemetry...');
    }, 850);

    const t2 = setTimeout(() => {
      setStatusText('Ready for your journey ✨');
    }, 1650);

    // 8. Smooth exit fade
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

          {/* Floating Aesthetic RED Bus Unit with Suspension & Tilt */}
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
            {/* Actual 3D Red Bus PNG - same one used on hero card, guaranteed to render */}
            <Image
              source={require('../../assets/images/redbus_3d.png')}
              style={styles.busImage}
              resizeMode="contain"
            />
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
          <Text style={styles.initiativeText}>High-Frequency Transit Corridor</Text>

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

        {/* Footer Transit Branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>नवा रायपुर अटल नगर · रायपुर बीआरटीएस गाइड</Text>
        </View>

        {/* City Skyline Background Line Drawing */}
        <CitySkylineSvg
          width="100%"
          height={160}
          color="#FFFFFF"
          opacity={0.14}
          style={styles.skylineBg}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1E2D99', // Full solid Royal Blue screen (same as previous circle, no circle outline)
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
    width: 220,
    height: 120,
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busImage: {
    width: 220,
    height: 120,
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
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
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
    backgroundColor: '#93C5FD',
    borderRadius: 1.5,
    opacity: 0.9,
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
    color: '#BFDBFE',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  initiativeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(224, 231, 255, 0.85)',
    letterSpacing: 0.3,
    marginBottom: 24,
  },
  progressContainer: {
    width: 180,
    marginBottom: 14,
  },
  progressBarTrack: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.5,
  },
  skylineBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
