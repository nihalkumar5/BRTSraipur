import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bus,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronRight,
  ExternalLink,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Send,
} from 'lucide-react-native';
import { FONT } from '../src/theme/typography';
import { CitySkylineSvg } from '../src/components/CitySkylineSvg';
import { triggerTactileVibration } from '../src/services/notifications';

// DESIGN SYSTEM BRAND TOKENS
const PRIMARY = '#18258F';
const BG_CANVAS = '#F8F6F0';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#0F172A';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#94A3B8';
const BORDER_LIGHT = '#E2E8F0';
const SUCCESS = '#059669';
const WARNING = '#D97706';
const EMERGENCY_RED = '#DC2626';

export default function AboutScreen() {
  const router = useRouter();

  const handleCall = (number: string) => {
    triggerTactileVibration([0, 30]);
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email: string) => {
    triggerTactileVibration([0, 30]);
    Linking.openURL(`mailto:${email}?subject=Tatpar%20BRTS%20Raipur%20Inquiry`);
  };

  const handleWebsite = (url: string) => {
    triggerTactileVibration([0, 20]);
    Linking.openURL(url);
  };

  const handleGoBack = () => {
    triggerTactileVibration([0, 20]);
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch (e) {}
    try {
      router.navigate('/' as any);
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. EDITORIAL NAVIGATION BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backBtn}
          activeOpacity={0.75}
          accessibilityLabel="Go back to home"
        >
          <ArrowLeft size={20} color={TEXT_DARK} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>About & Support</Text>
          <View style={styles.navStatusDot} />
        </View>

        <View style={styles.versionBadge}>
          <Text style={styles.versionBadgeText}>v1.0</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SIGNATURE HERO BRAND CARD */}
        <View style={styles.heroCard}>
          {/* Subtle Skyline Backdrop */}
          <View style={styles.heroSkylineWrapper}>
            <CitySkylineSvg width={300} height={105} color="#FFFFFF" opacity={0.16} />
          </View>

          <View style={styles.heroContent}>
            {/* Top Tag & Status */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Bus size={13} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.heroBadgeText}>TATPAR BRTS RAIPUR</Text>
              </View>

              <View style={styles.livePulsePill}>
                <View style={styles.livePulseDot} />
                <Text style={styles.livePulseText}>LIVE NETWORK</Text>
              </View>
            </View>

            {/* Title & Tagline */}
            <Text style={styles.heroTitle}>Tatpar BRTS</Text>
            <Text style={styles.heroSubtitle}>
              Intelligent commuter companion for Raipur & Nava Raipur Atal Nagar.
            </Text>

            {/* Key Transit Metrics Pill Strip */}
            <View style={styles.heroMetricsStrip}>
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>4</Text>
                <Text style={styles.metricLbl}>Corridors</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>24+</Text>
                <Text style={styles.metricLbl}>Stations</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>100%</Text>
                <Text style={styles.metricLbl}>Free Access</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. COMMUTER ASSISTANCE (HIGH TOUCHPOINT SUPPORT) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>COMMUTER ASSISTANCE</Text>
            <View style={styles.sectionPill}>
              <Text style={styles.sectionPillText}>Direct Support</Text>
            </View>
          </View>

          {/* CALL CARD */}
          <View style={styles.interactiveCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <PhoneCall size={20} color={PRIMARY} strokeWidth={2.2} />
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardMainTitle}>Call Commuter Helpline</Text>
                <Text style={styles.cardSubTitle}>For routes, timings & lost luggage inquiries</Text>
                <Text style={styles.cardContactHighlight}>+91 9565550673</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => handleCall('9565550673')}
              activeOpacity={0.8}
            >
              <Phone size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.primaryActionBtnText}>Call Now</Text>
            </TouchableOpacity>
          </View>

          {/* EMAIL CARD */}
          <View style={[styles.interactiveCard, { marginTop: 12 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Mail size={20} color="#0284C7" strokeWidth={2.2} />
              </View>
              <View style={styles.cardInfoCol}>
                <Text style={styles.cardMainTitle}>Email Inquiries & Bug Reports</Text>
                <Text style={styles.cardSubTitle}>Direct feedback to the engineering team</Text>
                <Text style={styles.cardContactHighlight} numberOfLines={1}>
                  nihal26302@iiitnr.edu.in
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#F1F5F9' }]}
              onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
              activeOpacity={0.8}
            >
              <Send size={14} color={PRIMARY} strokeWidth={2.2} />
              <Text style={[styles.primaryActionBtnText, { color: PRIMARY }]}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. EMERGENCY & CIVIC HELPLINES */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>SAFETY & CIVIC HELPLINES</Text>
            <View style={[styles.sectionPill, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.sectionPillText, { color: EMERGENCY_RED }]}>24/7 Response</Text>
            </View>
          </View>

          <View style={styles.emergencyCard}>
            {/* 112 SOS ROW */}
            <TouchableOpacity
              style={styles.emergencyRow}
              onPress={() => handleCall('112')}
              activeOpacity={0.7}
            >
              <View style={styles.emergencyBadgeCol}>
                <Text style={styles.emergencyCode}>112</Text>
                <Text style={styles.emergencyLabel}>POLICE · FIRE · MEDICAL</Text>
              </View>
              <View style={styles.emergencyCallPill}>
                <Phone size={13} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.emergencyCallPillText}>Dial SOS</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.cardInnerDivider} />

            {/* RMC HELPLINE ROW */}
            <TouchableOpacity
              style={styles.emergencyRow}
              onPress={() => handleCall('18002331234')}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.rmcTitle}>Raipur Municipal Corporation (RMC)</Text>
                <Text style={styles.rmcSubtitle}>1800-233-1234 · Toll-Free Civic Grievance</Text>
              </View>
              <View style={[styles.emergencyCallPill, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.emergencyCallPillText}>Call RMC</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. BRTS NETWORK CORRIDORS AT A GLANCE */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>BRTS NETWORK CORRIDORS</Text>
            <View style={styles.sectionPill}>
              <Text style={styles.sectionPillText}>4 Express Lines</Text>
            </View>
          </View>

          <View style={styles.corridorListCard}>
            {/* CORRIDOR 1 */}
            <View style={styles.corridorItem}>
              <View style={[styles.corridorBadge, { backgroundColor: PRIMARY }]}>
                <Text style={styles.corridorBadgeNumber}>1</Text>
              </View>
              <View style={styles.corridorItemContent}>
                <View style={styles.corridorTitleRow}>
                  <Text style={styles.corridorTitle}>Corridor 1 · Capital Line</Text>
                  <View style={[styles.corridorTag, { backgroundColor: '#EEF2FF' }]}>
                    <Text style={[styles.corridorTagText, { color: PRIMARY }]}>Primary Trunk</Text>
                  </View>
                </View>
                <Text style={styles.corridorTermini}>Raipur Railway Station ⇄ Mantralaya</Text>
                <Text style={styles.corridorVia}>Via Telibandha, Serikhedi & Capital Complex</Text>
              </View>
            </View>

            <View style={styles.cardInnerDivider} />

            {/* CORRIDOR 2 */}
            <View style={styles.corridorItem}>
              <View style={[styles.corridorBadge, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.corridorBadgeNumber}>2</Text>
              </View>
              <View style={styles.corridorItemContent}>
                <View style={styles.corridorTitleRow}>
                  <Text style={styles.corridorTitle}>Corridor 2 · Secretariat Line</Text>
                  <View style={[styles.corridorTag, { backgroundColor: '#F1F5F9' }]}>
                    <Text style={[styles.corridorTagText, { color: '#334155' }]}>Administrative</Text>
                  </View>
                </View>
                <Text style={styles.corridorTermini}>Raipur Railway Station ⇄ PHQ</Text>
                <Text style={styles.corridorVia}>Connecting Indrawati Bhavan & Police Headquarters</Text>
              </View>
            </View>

            <View style={styles.cardInnerDivider} />

            {/* CORRIDOR 3 */}
            <View style={styles.corridorItem}>
              <View style={[styles.corridorBadge, { backgroundColor: SUCCESS }]}>
                <Text style={styles.corridorBadgeNumber}>3</Text>
              </View>
              <View style={styles.corridorItemContent}>
                <View style={styles.corridorTitleRow}>
                  <Text style={styles.corridorTitle}>Corridor 3 · Knowledge Line</Text>
                  <View style={[styles.corridorTag, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.corridorTagText, { color: SUCCESS }]}>University Hub</Text>
                  </View>
                </View>
                <Text style={styles.corridorTermini}>Raipur Railway Station ⇄ HNLU / IIIT</Text>
                <Text style={styles.corridorVia}>Dedicated express for university students & faculty</Text>
              </View>
            </View>

            <View style={styles.cardInnerDivider} />

            {/* AIRPORT EXPRESS */}
            <View style={styles.corridorItem}>
              <View style={[styles.corridorBadge, { backgroundColor: WARNING }]}>
                <Navigation size={13} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.corridorItemContent}>
                <View style={styles.corridorTitleRow}>
                  <Text style={styles.corridorTitle}>Airport Feeder Line</Text>
                  <View style={[styles.corridorTag, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.corridorTagText, { color: WARNING }]}>RPR Airport</Text>
                  </View>
                </View>
                <Text style={styles.corridorTermini}>City Junction ⇄ Swami Vivekananda Airport</Text>
                <Text style={styles.corridorVia}>Timed connections for scheduled flight arrivals</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. OFFICIAL PUBLIC SOURCES & LEGAL */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>DATA SOURCES & TRANSPARENCY</Text>
            <View style={[styles.sectionPill, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.sectionPillText, { color: SUCCESS }]}>Gov Verified</Text>
            </View>
          </View>

          <View style={styles.linksGroupCard}>
            {/* TATPAR PORTAL */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => handleWebsite('https://www.tatparbus.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={18} color={SUCCESS} strokeWidth={2.2} />
              </View>
              <View style={styles.linkInfoCol}>
                <Text style={styles.linkTitle}>Tatpar BRTS Official Portal</Text>
                <Text style={styles.linkSubtitle}>Official schedule data: tatparbus.in</Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.cardInnerDivider} />

            {/* RAIPUR DISTRICT PORTAL */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => handleWebsite('https://raipur.gov.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={18} color={SUCCESS} strokeWidth={2.2} />
              </View>
              <View style={styles.linkInfoCol}>
                <Text style={styles.linkTitle}>Raipur District Administration</Text>
                <Text style={styles.linkSubtitle}>Government portal: raipur.gov.in</Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.cardInnerDivider} />

            {/* CHHATTISGARH STATE PORTAL */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => handleWebsite('https://chhattisgarh.gov.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={18} color={SUCCESS} strokeWidth={2.2} />
              </View>
              <View style={styles.linkInfoCol}>
                <Text style={styles.linkTitle}>Chhattisgarh State Portal</Text>
                <Text style={styles.linkSubtitle}>State government updates: chhattisgarh.gov.in</Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.cardInnerDivider} />

            {/* PRIVACY POLICY */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/privacy-policy' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBox, { backgroundColor: '#EEF2FF' }]}>
                <ShieldCheck size={18} color={PRIMARY} strokeWidth={2.2} />
              </View>
              <View style={styles.linkInfoCol}>
                <Text style={styles.linkTitle}>Privacy & Data Policy</Text>
                <Text style={styles.linkSubtitle}>Zero tracking · Device-only local trip storage</Text>
              </View>
              <ChevronRight size={18} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.cardInnerDivider} />

            {/* TERMS & DISCLAIMER */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push('/terms' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBox, { backgroundColor: '#EEF2FF' }]}>
                <FileText size={18} color={PRIMARY} strokeWidth={2.2} />
              </View>
              <View style={styles.linkInfoCol}>
                <Text style={styles.linkTitle}>Terms & Government Disclaimer</Text>
                <Text style={styles.linkSubtitle}>Open civic transit initiative & disclaimers</Text>
              </View>
              <ChevronRight size={18} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. CREATOR & COMMUNITY ATTRIBUTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>CREATOR & INITIATIVE</Text>
            <View style={styles.sectionPill}>
              <Text style={styles.sectionPillText}>Open Civic Tech</Text>
            </View>
          </View>

          <View style={styles.creatorCard}>
            <View style={styles.creatorTopRow}>
              <View style={styles.creatorAvatarBox}>
                <Text style={styles.creatorAvatarInitials}>NK</Text>
              </View>
              <View style={styles.creatorInfoCol}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>Nihal Kumar</Text>
                  <View style={styles.verifiedDevBadge}>
                    <CheckCircle2 size={13} color="#2563EB" strokeWidth={2.4} />
                  </View>
                </View>
                <Text style={styles.creatorRole}>Lead Developer · IIIT Naya Raipur</Text>
              </View>
            </View>

            <Text style={styles.creatorBio}>
              Crafted with care to bring fast, dependable, and battery-friendly transit tracking
              to daily passengers across Raipur and Atal Nagar.
            </Text>

            {/* Quick Interactive Contact Chips */}
            <View style={styles.creatorChipsRow}>
              <TouchableOpacity
                style={styles.creatorChip}
                onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
                activeOpacity={0.75}
              >
                <Mail size={13} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.creatorChipText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.creatorChip}
                onPress={() => handleCall('9565550673')}
                activeOpacity={0.75}
              >
                <Phone size={13} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.creatorChipText}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.creatorChip}
                onPress={() => handleWebsite('https://tatpar-brts-raipur.vercel.app')}
                activeOpacity={0.75}
              >
                <Globe size={13} color={PRIMARY} strokeWidth={2.2} />
                <Text style={styles.creatorChipText}>Website</Text>
              </TouchableOpacity>

              <View style={[styles.creatorChip, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                <MapPin size={13} color={TEXT_MUTED} strokeWidth={2.2} />
                <Text style={[styles.creatorChipText, { color: TEXT_SECONDARY }]}>Raipur, CG</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 8. MODERN APP SIGNATURE FOOTER */}
        <View style={styles.footerContainer}>
          <View style={styles.footerIconRow}>
            <Bus size={18} color={PRIMARY} strokeWidth={2.2} />
            <Text style={styles.footerBrandText}>Tatpar BRTS Raipur</Text>
          </View>
          <Text style={styles.footerTagline}>
            Empowering commuters with real-time transit intelligence.
          </Text>
          <Text style={styles.footerLegal}>
            © 2026 Tatpar BRTS Raipur · Public Transit Open Initiative
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_CANVAS,
  },

  /* 1. NAVIGATION BAR */
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  navStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
  },
  versionBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.12)',
  },
  versionBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 0.2,
  },

  /* SCROLL CONTENT */
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 56,
    maxWidth: Platform.OS === 'web' ? 680 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  /* 2. HERO BRAND CARD */
  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 30px rgba(24, 37, 143, 0.18), 0 4px 10px rgba(0, 0, 0, 0.04)',
        } as any)
      : {}),
  },
  heroSkylineWrapper: {
    position: 'absolute',
    right: -20,
    bottom: -15,
    opacity: 0.85,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  livePulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  livePulseText: {
    fontFamily: FONT.bold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#E0E7FF',
    lineHeight: 18.5,
    maxWidth: 290,
    marginBottom: 18,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: FONT.extraBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  metricLbl: {
    fontFamily: FONT.medium,
    fontSize: 11,
    fontWeight: '500',
    color: '#C7D2FE',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  /* SECTION LABELS */
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionHeading: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.7,
  },
  sectionPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sectionPillText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: PRIMARY,
  },

  /* INTERACTIVE COMMUTER CARDS */
  interactiveCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(24, 37, 143, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        } as any)
      : {}),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfoCol: {
    flex: 1,
  },
  cardMainTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  cardSubTitle: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    marginTop: 2,
    lineHeight: 17,
  },
  cardContactHighlight: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    height: 42,
    borderRadius: 12,
    gap: 7,
  },
  primaryActionBtnText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  /* EMERGENCY CARD */
  emergencyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    overflow: 'hidden',
    shadowColor: EMERGENCY_RED,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emergencyBadgeCol: {
    flex: 1,
  },
  emergencyCode: {
    fontFamily: FONT.extraBold,
    fontSize: 20,
    fontWeight: '800',
    color: EMERGENCY_RED,
    letterSpacing: -0.3,
  },
  emergencyLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  emergencyCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EMERGENCY_RED,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  emergencyCallPillText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rmcTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  rmcSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },

  /* CORRIDOR LIST CARD */
  corridorListCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  corridorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  corridorBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  corridorBadgeNumber: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  corridorItemContent: {
    flex: 1,
  },
  corridorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  corridorTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  corridorTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  corridorTagText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
  },
  corridorTermini: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
    marginTop: 1,
  },
  corridorVia: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 3,
    lineHeight: 16,
  },

  /* LINKS GROUP CARD */
  linksGroupCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkInfoCol: {
    flex: 1,
    paddingRight: 8,
  },
  linkTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  linkSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* CREATOR CARD */
  creatorCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  creatorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creatorAvatarInitials: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  creatorInfoCol: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorName: {
    fontFamily: FONT.bold,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  verifiedDevBadge: {
    marginTop: 1,
  },
  creatorRole: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  creatorBio: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 14,
  },
  creatorChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  creatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.12)',
    gap: 5,
  },
  creatorChipText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },

  /* FOOTER */
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  footerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  footerBrandText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  footerTagline: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerLegal: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
