import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  LinearGradient,
  Stop,
  Defs,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BusLoadingScreenProps {
  onFinish?: () => void;
  duration?: number; // total duration before fade-out (default ~2000ms)
}

export default function BusLoadingScreen({
  onFinish,
  duration = 2100,
}: BusLoadingScreenProps) {
  // Animation drivers
  const busBobAnim = useRef(new Animated.Value(0)).current; // bus suspension bounce
  const wheelSpinAnim = useRef(new Animated.Value(0)).current; // wheel rotation
  const roadScrollAnim = useRef(new Animated.Value(0)).current; // road stripes moving
  const beamPulseAnim = useRef(new Animated.Value(0.7)).current; // headlight beam glow
  const cloudScrollAnim = useRef(new Animated.Value(0)).current; // subtle background clouds
  const progressAnim = useRef(new Animated.Value(0)).current; // 0 to 1 progress bar
  const fadeOutAnim = useRef(new Animated.Value(1)).current; // whole screen fade-out
  const scaleOutAnim = useRef(new Animated.Value(1)).current; // subtle scale zoom on exit

  const [loadingStepText, setLoadingStepText] = useState('बस शेड्यूल लोड हो रहा है...');

  useEffect(() => {
    const isNative = Platform.OS !== 'web';

    // 1. Bus Suspension Bobbing (cute slight bounce)
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busBobAnim, {
          toValue: -3.5,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
        Animated.timing(busBobAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
        Animated.timing(busBobAnim, {
          toValue: -1,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
        Animated.timing(busBobAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNative,
        }),
      ])
    );
    bobLoop.start();

    // 2. Wheel Spinning (0 to 360 deg continuous loop)
    const wheelLoop = Animated.loop(
      Animated.timing(wheelSpinAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    wheelLoop.start();

    // 3. Road Markings Moving (simulating forward speed)
    const roadLoop = Animated.loop(
      Animated.timing(roadScrollAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    roadLoop.start();

    // 4. Headlight beam gentle pulse
    const beamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beamPulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(beamPulseAnim, {
          toValue: 0.65,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
      ])
    );
    beamLoop.start();

    // 5. Cloud drift
    const cloudLoop = Animated.loop(
      Animated.timing(cloudScrollAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: isNative,
      })
    );
    cloudLoop.start();

    // 6. Progress Fill (0 to 100%)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Text status updates
    const t1 = setTimeout(() => {
      setLoadingStepText('स्टॉप्स एवं स्टेशन्स कनेक्ट हो रहे हैं...');
    }, 700);

    const t2 = setTimeout(() => {
      setLoadingStepText('नवा रायपुर बीआरटीएस तैयार है! ✨');
    }, 1400);

    // 7. Exit transition (fade out and scale slightly)
    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: isNative,
        }),
        Animated.timing(scaleOutAnim, {
          toValue: 1.04,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: isNative,
        }),
      ]).start(() => {
        bobLoop.stop();
        wheelLoop.stop();
        roadLoop.stop();
        beamLoop.stop();
        cloudLoop.stop();
        if (onFinish) onFinish();
      });
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
      bobLoop.stop();
      wheelLoop.stop();
      roadLoop.stop();
      beamLoop.stop();
      cloudLoop.stop();
    };
  }, [duration, onFinish]);

  // Interpolated wheel rotation
  const wheelRotate = wheelSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolated road stripe offset
  const roadTranslateX = roadScrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  // Progress width
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.overlayContainer,
        {
          opacity: fadeOutAnim,
          transform: [{ scale: scaleOutAnim }],
        },
      ]}
    >
      {/* BACKGROUND SKY WITH STARS/CLOUDS */}
      <View style={styles.skyContainer}>
        {/* Soft background glow */}
        <View style={styles.ambientGlow} />

        {/* Floating Clouds */}
        <View style={styles.cloudsRow}>
          <Animated.View
            style={[
              styles.cloud,
              {
                left: 20,
                top: 40,
                opacity: 0.25,
                transform: [
                  {
                    translateX: cloudScrollAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -30],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.cloud,
              {
                right: 30,
                top: 70,
                width: 70,
                height: 24,
                opacity: 0.18,
                transform: [
                  {
                    translateX: cloudScrollAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -45],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      {/* CENTER ANIMATION STAGE */}
      <View style={styles.stage}>
        {/* APP BRANDING ON TOP */}
        <View style={styles.headerBlock}>
          <Text style={styles.brandTitleHindi}>तत्पर BRTS</Text>
          <Text style={styles.brandSubtitle}>नवा रायपुर अटल नगर · रायपुर</Text>
        </View>

        {/* THE CUTE BUS SCENE */}
        <View style={styles.busScene}>
          {/* Headlight beam shining forward */}
          <Animated.View
            style={[
              styles.headlightBeam,
              {
                opacity: beamPulseAnim,
              },
            ]}
          />

          {/* Bobbing Bus Body */}
          <Animated.View
            style={[
              styles.busWrapper,
              {
                transform: [{ translateY: busBobAnim }],
              },
            ]}
          >
            {/* SVG BUS CHASSIS */}
            <Svg width={180} height={85} viewBox="0 0 180 85" fill="none">
              <Defs>
                <LinearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFFFF" />
                  <Stop offset="100%" stopColor="#F1F5F9" />
                </LinearGradient>
                <LinearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#18258F" />
                  <Stop offset="100%" stopColor="#2563EB" />
                </LinearGradient>
                <LinearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#1E293B" />
                  <Stop offset="100%" stopColor="#0F172A" />
                </LinearGradient>
              </Defs>

              {/* Bus shadow on road */}
              <Rect x={10} y={72} width={160} height={6} rx={3} fill="#0A0F2E" opacity={0.6} />

              {/* Main Bus Shell */}
              <Path
                d="M 12 20 C 12 12 18 8 26 8 L 152 8 C 166 8 174 16 174 28 L 174 65 C 174 69 170 72 165 72 L 15 72 C 12 72 10 70 10 67 L 10 24 C 10 21 11 20 12 20 Z"
                fill="url(#busGrad)"
              />

              {/* Top AC / Ventilation Pod */}
              <Rect x={55} y={4} width={65} height={5} rx={2} fill="#E2E8F0" />
              <Rect x={62} y={5} width={14} height={2} rx={1} fill="#94A3B8" />
              <Rect x={82} y={5} width={14} height={2} rx={1} fill="#94A3B8" />
              <Rect x={102} y={5} width={14} height={2} rx={1} fill="#94A3B8" />

              {/* LED Destination Board (Glowing Amber) */}
              <Rect x={132} y={12} width={36} height={9} rx={2} fill="#090D1E" />
              <Rect x={134} y={14} width={32} height={5} rx={1} fill="#F59E0B" opacity={0.95} />

              {/* Front Windshield (Aerodynamic Curved Glass) */}
              <Path
                d="M 140 24 L 170 26 C 171.5 30 171.5 44 171.5 45 L 140 45 Z"
                fill="url(#glassGrad)"
              />
              {/* Windshield wiper accent */}
              <Path d="M 152 44 L 165 32" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />

              {/* Passenger Windows (Sleek dark panoramic row) */}
              <Rect x={18} y={24} width={24} height={21} rx={3} fill="url(#glassGrad)" />
              <Rect x={46} y={24} width={26} height={21} rx={3} fill="url(#glassGrad)" />
              <Rect x={76} y={24} width={26} height={21} rx={3} fill="url(#glassGrad)" />
              <Rect x={106} y={24} width={26} height={21} rx={3} fill="url(#glassGrad)" />

              {/* Commuter Silhouettes in window */}
              <Circle cx={30} cy={34} r={3.2} fill="#64748B" />
              <Circle cx={60} cy={34} r={3.2} fill="#64748B" />
              <Circle cx={88} cy={33} r={3.5} fill="#94A3B8" />
              <Circle cx={118} cy={34} r={3.2} fill="#64748B" />

              {/* Vibrant BRTS Brand Stripe */}
              <Path d="M 10 49 L 173 49 L 173 57 L 10 57 Z" fill="url(#stripeGrad)" />
              {/* Saffron/Coral Speed Ribbon */}
              <Path d="M 10 57 L 172 57 L 171 60 L 10 60 Z" fill="#F26B52" />

              {/* BRTS Text on Bus Side */}
              <Path d="M 28 53 L 38 53" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <Circle cx={44} cy={53} r={1.2} fill="#FFFFFF" />

              {/* Headlight (Warm Golden Yellow) */}
              <Path
                d="M 172 52 C 173.5 52 174 53 174 55 C 174 57 173.5 58 172 58 Z"
                fill="#FDE047"
              />

              {/* Taillight (Bright Red) */}
              <Rect x={10} y={50} width={2.5} height={8} rx={1} fill="#EF4444" />

              {/* Wheel Well Cutouts */}
              <Circle cx={42} cy={72} r={15} fill="#0E1647" />
              <Circle cx={138} cy={72} r={15} fill="#0E1647" />
            </Svg>

            {/* ANIMATED FRONT WHEEL */}
            <Animated.View
              style={[
                styles.wheelContainer,
                {
                  left: 31,
                  bottom: 1,
                  transform: [{ rotate: wheelRotate }],
                },
              ]}
            >
              <Svg width={22} height={22} viewBox="0 0 22 22">
                {/* Rubber tire */}
                <Circle cx={11} cy={11} r={10} fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
                {/* Silver Alloy Rim */}
                <Circle cx={11} cy={11} r={6.5} fill="#64748B" />
                <Circle cx={11} cy={11} r={3} fill="#CBD5E1" />
                {/* Spokes */}
                <Path d="M 11 5 L 11 17" stroke="#334155" strokeWidth="1.2" />
                <Path d="M 5 11 L 17 11" stroke="#334155" strokeWidth="1.2" />
              </Svg>
            </Animated.View>

            {/* ANIMATED REAR WHEEL */}
            <Animated.View
              style={[
                styles.wheelContainer,
                {
                  left: 127,
                  bottom: 1,
                  transform: [{ rotate: wheelRotate }],
                },
              ]}
            >
              <Svg width={22} height={22} viewBox="0 0 22 22">
                {/* Rubber tire */}
                <Circle cx={11} cy={11} r={10} fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
                {/* Silver Alloy Rim */}
                <Circle cx={11} cy={11} r={6.5} fill="#64748B" />
                <Circle cx={11} cy={11} r={3} fill="#CBD5E1" />
                {/* Spokes */}
                <Path d="M 11 5 L 11 17" stroke="#334155" strokeWidth="1.2" />
                <Path d="M 5 11 L 17 11" stroke="#334155" strokeWidth="1.2" />
              </Svg>
            </Animated.View>

            {/* Cute exhaust breeze puffs streaming behind */}
            <View style={styles.exhaustWrapper}>
              <View style={[styles.exhaustDot, { width: 5, height: 5, opacity: 0.6 }]} />
              <View style={[styles.exhaustDot, { width: 7, height: 7, opacity: 0.4, marginLeft: 3 }]} />
              <View style={[styles.exhaustDot, { width: 9, height: 9, opacity: 0.2, marginLeft: 4 }]} />
            </View>
          </Animated.View>

          {/* ROAD & MOVING STRIPES */}
          <View style={styles.roadTrack}>
            <View style={styles.asphalt} />
            <Animated.View
              style={[
                styles.roadStripesContainer,
                {
                  transform: [{ translateX: roadTranslateX }],
                },
              ]}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <View key={i} style={styles.roadStripe} />
              ))}
            </Animated.View>
          </View>
        </View>

        {/* CORRIDOR ROUTE PROGRESS INDICATOR */}
        <View style={styles.progressSection}>
          <View style={styles.corridorRouteRow}>
            <View style={styles.corridorNode}>
              <View style={[styles.corridorDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.corridorNodeText}>रायपुर स्टेशन</Text>
            </View>
            <View style={styles.corridorCenterLabel}>
              <Text style={styles.corridorBusLabel}>BRTS Express</Text>
            </View>
            <View style={styles.corridorNode}>
              <View style={[styles.corridorDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.corridorNodeText}>मंत्रालय</Text>
            </View>
          </View>

          {/* Sleek Progress Bar Track */}
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

          {/* Dynamic Loading Step Text */}
          <Text style={styles.loadingStatusText}>{loadingStepText}</Text>
        </View>
      </View>

      {/* FOOTER ACCENT */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>छत्तीसगढ़ शासन · रायपुर स्मार्ट सिटी</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0C133D',
    zIndex: 9999,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
  },
  skyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '70%',
    height: '60%',
    backgroundColor: '#1E297D',
    opacity: 0.35,
    borderRadius: 200,
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  cloudsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloud: {
    position: 'absolute',
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  brandTitleHindi: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(37, 99, 235, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93C5FD',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  busScene: {
    width: 250,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  headlightBeam: {
    position: 'absolute',
    right: 0,
    top: 48,
    width: 75,
    height: 32,
    backgroundColor: 'rgba(254, 240, 138, 0.18)',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    transform: [{ perspective: 100 }, { rotateY: '-25deg' }],
  },
  busWrapper: {
    width: 180,
    height: 85,
    position: 'relative',
    zIndex: 2,
  },
  wheelContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  exhaustWrapper: {
    position: 'absolute',
    left: -18,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exhaustDot: {
    borderRadius: 5,
    backgroundColor: '#94A3B8',
  },
  roadTrack: {
    position: 'absolute',
    bottom: 12,
    width: SCREEN_WIDTH > 420 ? 380 : SCREEN_WIDTH - 40,
    height: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  asphalt: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E293B',
  },
  roadStripesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 600,
  },
  roadStripe: {
    width: 24,
    height: 2.5,
    backgroundColor: '#FDE047',
    borderRadius: 1,
    marginRight: 24,
    opacity: 0.85,
  },
  progressSection: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 74, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  corridorRouteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  corridorNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  corridorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  corridorNodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  corridorCenterLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderRadius: 8,
  },
  corridorBusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  loadingStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(148, 163, 184, 0.5)',
    letterSpacing: 0.5,
  },
});
