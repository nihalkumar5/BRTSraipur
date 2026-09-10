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
  ChevronRight,
  ExternalLink,
  MapPin,
} from 'lucide-react-native';
import { FONT } from '../src/theme/typography';
import { stops } from '../src/services/tracker';
import { triggerTactileVibration } from '../src/services/notifications';

// DESIGN SYSTEM BRAND TOKENS
const PRIMARY = '#18258F';
const BG_CANVAS = '#F8F6F0';
const CARD_BG = '#FFFFFF';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const TEXT_LIGHT = '#94A3B8';
const BORDER_COLOR = '#E5E9F0';
const DIVIDER_COLOR = '#F1F5F9';
const SUCCESS = '#059669';
const WARNING = '#D97706';
const EMERGENCY_RED = '#DC2626';

export default function AboutScreen() {
  const router = useRouter();

  const handleCall = (number: string) => {
    triggerTactileVibration([0, 25]);
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email: string) => {
    triggerTactileVibration([0, 25]);
    Linking.openURL(`mailto:${email}?subject=Tatpar%20BRTS%20Feedback`);
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
      {/* 1. MINIMAL HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={TEXT_DARK} strokeWidth={2} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>About & Support</Text>

        <View style={styles.navPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. CALM & AIRY APP IDENTITY */}
        <View style={styles.appIntroSection}>
          <View style={styles.appIconBox}>
            <Bus size={26} color={PRIMARY} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>Raipur BRTS Guide</Text>
          <Text style={styles.appTagline}>
            Smart commuter companion for Raipur & Nava Raipur Atal Nagar
          </Text>

          <View style={styles.statsPillRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillBold}>4</Text>
              <Text style={styles.statPillText}>Corridors</Text>
            </View>
            <Text style={styles.statDot}>·</Text>
            <View style={styles.statPill}>
              <Text style={styles.statPillBold}>{stops.length}</Text>
              <Text style={styles.statPillText}>Shelters</Text>
            </View>
            <Text style={styles.statDot}>·</Text>
            <View style={styles.statPill}>
              <Text style={styles.statPillText}>v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* 3. SUPPORT & HELPLINES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT & HELPLINES</Text>
          <View style={styles.card}>
            {/* OFFICIAL BRTS HELPDESK */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleCall('07712211501')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Phone size={17} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>BRTS Helpdesk (Raipur)</Text>
                <Text style={styles.rowSecondary}>0771-2211501 · Nava Raipur ICCC</Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* EMAIL SUPPORT */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                <Mail size={17} color="#0284C7" strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Email Inquiries & Feedback</Text>
                <Text style={styles.rowSecondary} numberOfLines={1}>
                  nihal26302@iiitnr.edu.in
                </Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* EMERGENCY 112 */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleCall('112')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Phone size={17} color={EMERGENCY_RED} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Emergency Response (ERSS)</Text>
                <Text style={[styles.rowSecondary, { color: EMERGENCY_RED }]}>
                  Dial 112 · Police, Fire & Medical
                </Text>
              </View>
              <ExternalLink size={15} color={EMERGENCY_RED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* RMC CIVIC HELPLINE */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleCall('18002331234')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Phone size={17} color={WARNING} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Raipur Municipal Corporation</Text>
                <Text style={styles.rowSecondary}>1800-233-1234 · Toll-Free Civic Grievance</Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. BRTS CORRIDORS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NETWORK CORRIDORS</Text>
          <View style={styles.card}>
            {/* CORRIDOR 1 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: PRIMARY }]} />
              <View style={styles.corridorTextCol}>
                <Text style={styles.corridorTitle}>Corridor 1</Text>
                <Text style={styles.corridorRoute}>Railway Station ⇄ Mantralaya</Text>
                <Text style={styles.corridorVia}>Via Telibandha, Serikhedi & Capital Complex</Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* CORRIDOR 2 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: '#1E293B' }]} />
              <View style={styles.corridorTextCol}>
                <Text style={styles.corridorTitle}>Corridor 2</Text>
                <Text style={styles.corridorRoute}>Railway Station ⇄ PHQ</Text>
                <Text style={styles.corridorVia}>Via Collectorate & Indrawati Bhavan</Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* CORRIDOR 3 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: SUCCESS }]} />
              <View style={styles.corridorTextCol}>
                <Text style={styles.corridorTitle}>Corridor 3</Text>
                <Text style={styles.corridorRoute}>Railway Station ⇄ HNLU / IIIT</Text>
                <Text style={styles.corridorVia}>Knowledge Hub & University Zone</Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* AIRPORT FEEDER */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: WARNING }]} />
              <View style={styles.corridorTextCol}>
                <Text style={styles.corridorTitle}>Airport Feeder</Text>
                <Text style={styles.corridorRoute}>City Center ⇄ Swami Vivekananda Airport</Text>
                <Text style={styles.corridorVia}>Connecting Mana Camp & Flight Terminal (RPR)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. OFFICIAL SOURCES & LEGAL */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OFFICIAL SOURCES & LEGAL</Text>
          <View style={styles.card}>
            {/* TATPAR OFFICIAL */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleWebsite('https://www.tatparbus.in')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={17} color={SUCCESS} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Tatpar BRTS Official Portal</Text>
                <Text style={styles.rowSecondary}>tatparbus.in</Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* RAIPUR DISTRICT */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleWebsite('https://raipur.gov.in')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={17} color={SUCCESS} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Raipur District Administration</Text>
                <Text style={styles.rowSecondary}>raipur.gov.in</Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* CHHATTISGARH STATE PORTAL */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => handleWebsite('https://cgstate.gov.in/')}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Globe size={17} color={SUCCESS} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Chhattisgarh State Portal</Text>
                <Text style={styles.rowSecondary}>cgstate.gov.in</Text>
              </View>
              <ExternalLink size={15} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* PRIVACY POLICY */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => router.push('/privacy-policy' as any)}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <ShieldCheck size={17} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Privacy Policy</Text>
                <Text style={styles.rowSecondary}>Data safety & device-only storage</Text>
              </View>
              <ChevronRight size={17} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* TERMS */}
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => router.push('/terms' as any)}
              activeOpacity={0.65}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                <FileText size={17} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowPrimary}>Terms & Government Disclaimer</Text>
                <Text style={styles.rowSecondary}>Open civic transit guidelines</Text>
              </View>
              <ChevronRight size={17} color={TEXT_LIGHT} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. INITIATIVE & CREATOR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT THIS INITIATIVE</Text>
          <View style={[styles.card, styles.creatorCard]}>
            <Text style={styles.creatorTitle}>Nihal Kumar</Text>
            <Text style={styles.creatorRole}>Lead Developer · IIIT Naya Raipur</Text>

            <Text style={styles.creatorBio}>
              Developed as an open-source civic utility to provide reliable, battery-efficient bus
              timings and stop tracking for students and commuters across Raipur and Nava Raipur.
            </Text>

            <View style={styles.creatorLinksRow}>
              <TouchableOpacity
                style={styles.creatorLinkChip}
                onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
                activeOpacity={0.7}
              >
                <Mail size={13} color={PRIMARY} strokeWidth={2} />
                <Text style={styles.creatorLinkText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.creatorLinkChip}
                onPress={() => handleWebsite('https://tatpar-brts-raipur.vercel.app')}
                activeOpacity={0.7}
              >
                <Globe size={13} color={PRIMARY} strokeWidth={2} />
                <Text style={styles.creatorLinkText}>Website</Text>
              </TouchableOpacity>

              <View style={[styles.creatorLinkChip, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                <MapPin size={13} color={TEXT_MUTED} strokeWidth={2} />
                <Text style={[styles.creatorLinkText, { color: TEXT_MUTED }]}>Raipur, CG</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7. CALM MINIMAL FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Raipur BRTS Guide</Text>
          <Text style={styles.footerText}>
            Open civic transit initiative for Raipur & Nava Raipur Atal Nagar.
          </Text>
          <Text style={styles.footerCopy}>© 2026 Raipur BRTS Guide</Text>
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

  /* NAVIGATION BAR */
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: FONT.bold,
    fontSize: 16.5,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  navPlaceholder: {
    width: 36,
    height: 36,
  },

  /* SCROLL CONTENT */
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64,
    maxWidth: Platform.OS === 'web' ? 560 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  /* APP IDENTITY */
  appIntroSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  appIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontFamily: FONT.bold,
    fontSize: 21,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  appTagline: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18.5,
    marginTop: 6,
    maxWidth: 320,
  },
  statsPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statPillBold: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: PRIMARY,
  },
  statPillText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  statDot: {
    fontSize: 14,
    color: '#CBD5E1',
    marginHorizontal: 2,
  },

  /* SECTIONS */
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  /* UNIFIED CARDS */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  /* ROW ITEMS */
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 58,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  rowTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  rowPrimary: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  rowSecondary: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginLeft: 65,
  },

  /* CORRIDOR ROWS */
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  corridorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 13,
  },
  corridorTextCol: {
    flex: 1,
  },
  corridorTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  corridorRoute: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: PRIMARY,
    fontWeight: '500',
    marginTop: 1,
  },
  corridorVia: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: TEXT_MUTED,
    marginTop: 3,
    lineHeight: 16,
  },

  /* CREATOR CARD */
  creatorCard: {
    padding: 18,
  },
  creatorTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  creatorRole: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
    marginBottom: 10,
  },
  creatorBio: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: TEXT_MUTED,
    lineHeight: 18,
    marginBottom: 14,
  },
  creatorLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  creatorLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.1)',
    gap: 5,
  },
  creatorLinkText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    fontWeight: '600',
    color: PRIMARY,
  },

  /* FOOTER */
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  footerBrand: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 3,
    maxWidth: 300,
  },
  footerCopy: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_LIGHT,
    marginTop: 6,
  },
});
