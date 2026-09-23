import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Share, SquarePlus, Smartphone, Lock, ArrowDown } from 'lucide-react-native';

export default function IosInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [devBypassed, setDevBypassed] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Check if query param ?preview=1 or ?bypass=1 is present
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('bypass') === '1' || urlParams.get('preview') === '1') {
        setDevBypassed(true);
      }
    } catch (e) {}

    // Check if running in standalone mode (installed PWA) or native Android WebView
    const standaloneMode =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window as any).ReactNativeWebView);

    setIsStandalone(Boolean(standaloneMode));

    // Detect iOS (iPhone / iPad / iPod)
    const ua = window.navigator.userAgent || '';
    const isAppleDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    setIsIOS(isAppleDevice);
  }, []);

  // Developer bypass: tap logo 5 times in DevTools to unlock without opening from Home Screen
  const handleLogoTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setDevBypassed(true);
    }
  };

  // If already installed to Home Screen (standalone) or not iOS or dev-bypassed: don't block
  if (isStandalone || !isIOS || devBypassed) {
    return null;
  }

  return (
    <View style={styles.lockOverlay}>
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
            <Image
              source={{ uri: '/apple-touch-icon.png' }}
              style={styles.appIcon}
              accessibilityLabel="Raipur BRTS Guide Icon"
            />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Lock size={12} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>iPhone Installation Required</Text>
          </View>
          <Text style={styles.title}>Install Raipur BRTS Guide</Text>
          <Text style={styles.subtitle}>
            Raipur BRTS Guide is an App-Only experience on iPhone. Please add it to your Home Screen to unlock all bus routes, stops & timetables.
          </Text>
        </View>

        {/* 3 MANDATORY STEPS */}
        <View style={styles.stepsContainer}>
          {/* STEP 1 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, { backgroundColor: '#EBF3FF' }]}>
              <Share size={18} color="#007AFF" />
            </View>
            <View style={styles.stepTextBox}>
              <Text style={styles.stepNum}>STEP 1</Text>
              <Text style={styles.stepDesc}>
                Tap the <Text style={styles.stepBold}>Share button (⎋)</Text> in Safari toolbar below
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* STEP 2 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, { backgroundColor: '#E8F5E9' }]}>
              <SquarePlus size={18} color="#16A34A" />
            </View>
            <View style={styles.stepTextBox}>
              <Text style={styles.stepNum}>STEP 2</Text>
              <Text style={styles.stepDesc}>
                Scroll down & select <Text style={styles.stepBold}>"Add to Home Screen"</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* STEP 3 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Smartphone size={18} color="#18258F" />
            </View>
            <View style={styles.stepTextBox}>
              <Text style={styles.stepNum}>STEP 3</Text>
              <Text style={styles.stepDesc}>
                Open the new <Text style={styles.stepBold}>"Raipur BRTS Guide"</Text> icon from Home Screen!
              </Text>
            </View>
          </View>
        </View>

        {/* BOTTOM CALLOUT: TAP SHARE BELOW */}
        <View style={styles.shareActionBanner}>
          <View style={styles.shareActionIconWrap}>
            <Share size={18} color="#007AFF" />
          </View>
          <View style={styles.shareActionTextWrap}>
            <Text style={styles.shareActionTitle}>Tap Safari Share button below</Text>
            <Text style={styles.shareActionSub}>Look for the [ ⎋ ] icon in your bottom bar</Text>
          </View>
          <ArrowDown size={20} color="#007AFF" />
        </View>

        {/* UNLOCK HINT */}
        <View style={styles.bottomHintBox}>
          <Text style={styles.bottomHintText}>
            ⚡ Once opened from your Home Screen, full access unlocks automatically.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(20px)',
    zIndex: 9999999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    overflowY: 'auto' as any,
  } as any,
  card: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#18258F',
    marginBottom: 10,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: 'Plus Jakarta Sans',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Plus Jakarta Sans',
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
    fontFamily: 'Plus Jakarta Sans',
  },
  stepsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextBox: {
    flex: 1,
  },
  stepNum: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 1,
    fontFamily: 'Plus Jakarta Sans',
  },
  stepDesc: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 16,
    fontFamily: 'Plus Jakarta Sans',
  },
  stepBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
    marginLeft: 46,
  },
  shareActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 10,
  },
  shareActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareActionTextWrap: {
    flex: 1,
  },
  shareActionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    fontFamily: 'Plus Jakarta Sans',
  },
  shareActionSub: {
    fontSize: 10,
    color: '#3B82F6',
    fontFamily: 'Plus Jakarta Sans',
    marginTop: 1,
  },
  bottomHintBox: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  bottomHintText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    fontFamily: 'Plus Jakarta Sans',
  },
});
