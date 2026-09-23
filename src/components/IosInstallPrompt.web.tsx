import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Share, SquarePlus, X, Download, Smartphone } from 'lucide-react-native';

const STORAGE_KEY = 'tatpar_pwa_install_dismissed_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function IosInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // 1. Check if already installed / running in standalone mode or native webview
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window as any).ReactNativeWebView);

    if (isStandalone) return;

    // 2. Check if previously dismissed recently
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < SEVEN_DAYS_MS) {
        return;
      }
    } catch (e) {}

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isAppleDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    setIsIOS(isAppleDevice);

    // 4. Capture Chrome / Android PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS, delay slightly (2 seconds) after initial page load so user isn't immediately interrupted
    let timer: any;
    if (isAppleDevice) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 2200);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.card}>
        {/* CLOSE BUTTON */}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          activeOpacity={0.7}
          accessibilityLabel="Dismiss install banner"
        >
          <X size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* HEADER: APP ICON & TITLE */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: '/apple-touch-icon.png' }}
            style={styles.appIcon}
            accessibilityLabel="Tatpar BRTS App Icon"
          />
          <View style={styles.headerTextCol}>
            <View style={styles.badgeRow}>
              <Text style={styles.title}>Tatpar BRTS Raipur</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{isIOS ? 'iPhone App' : 'Free App'}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              {isIOS
                ? 'Install on your iPhone for 1-tap offline bus tracking & full-screen view'
                : 'Install for quick access & offline bus schedules'}
            </Text>
          </View>
        </View>

        {/* INSTRUCTIONS */}
        {isIOS ? (
          <View style={styles.iosStepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: '#EBF3FF' }]}>
                <Share size={18} color="#007AFF" />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepText}>
                  1. Tap <Text style={styles.stepBold}>Share</Text> in Safari toolbar
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <SquarePlus size={18} color="#2E7D32" />
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepText}>
                  2. Select <Text style={styles.stepBold}>Add to Home Screen</Text>
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.androidBtnContainer}>
            {deferredPrompt ? (
              <TouchableOpacity
                onPress={handleNativeInstall}
                style={styles.primaryInstallBtn}
                activeOpacity={0.8}
              >
                <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryInstallBtnText}>Install Tatpar App</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.genericTipRow}>
                <Smartphone size={16} color="#18258F" style={{ marginRight: 6 }} />
                <Text style={styles.genericTipText}>
                  Tap browser menu (⋮) & select "Add to Home screen"
                </Text>
              </View>
            )}
          </View>
        )}

        {/* FOOTER ACTIONS */}
        <View style={styles.footerRow}>
          <Text style={styles.footerNote}>
            {isIOS ? '⚡ Zero App Store download required' : '⚡ Uses less than 2 MB space'}
          </Text>
          <TouchableOpacity onPress={handleDismiss} activeOpacity={0.6}>
            <Text style={styles.dismissLink}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 32,
    marginBottom: 14,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#18258F',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'Plus Jakarta Sans',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    fontFamily: 'Plus Jakarta Sans',
  },
  subtitle: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    fontFamily: 'Plus Jakarta Sans',
  },
  iosStepsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTextCol: {
    flex: 1,
  },
  stepText: {
    fontSize: 13,
    color: '#1F2937',
    fontFamily: 'Plus Jakarta Sans',
  },
  stepBold: {
    fontWeight: '700',
    color: '#111827',
  },
  stepDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginLeft: 42,
  },
  androidBtnContainer: {
    marginBottom: 12,
  },
  primaryInstallBtn: {
    backgroundColor: '#18258F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryInstallBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  genericTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 10,
    borderRadius: 10,
  },
  genericTipText: {
    fontSize: 12,
    color: '#18258F',
    fontWeight: '600',
    fontFamily: 'Plus Jakarta Sans',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerNote: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Plus Jakarta Sans',
  },
  dismissLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Plus Jakarta Sans',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});
