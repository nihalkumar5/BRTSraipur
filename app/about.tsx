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
} from 'lucide-react-native';
import { FONT } from '../src/theme/typography';

// DESIGN SYSTEM TOKENS
const PRIMARY = '#2438B8';
const DARK_BLUE = '#17247A';
const LIGHT_BLUE = '#EEF1FF';
const BG_COLOR = '#F8F6F0';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#101828';
const TEXT_SECONDARY = '#667085';
const TEXT_MUTED = '#98A2B3';
const BORDER_COLOR = '#E4E7EC';
const DIVIDER_COLOR = '#EAECF0';
const SUCCESS = '#12B76A';
const WARNING = '#F79009';
const EMERGENCY_RED = '#D92D20';

export default function AboutScreen() {
  const router = useRouter();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}?subject=Tatpar%20BRTS%20Raipur%20Support`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. CLEAN MOBILE NAVIGATION HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
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
          }}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={TEXT_PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About & Support</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. APP INTRO (COMPACT & RESTRAINED) */}
        <View style={styles.introSection}>
          <View style={styles.appIconWrapper}>
            <Bus size={22} color={PRIMARY} strokeWidth={2} />
          </View>
          <View style={styles.introTextCol}>
            <Text style={styles.appName}>Tatpar BRTS Raipur</Text>
            <Text style={styles.appVersion}>v1.0.0 · Production Release</Text>
            <Text style={styles.appTagline}>
              “Your simple companion for Raipur's BRTS network.”
            </Text>
          </View>
        </View>

        {/* 3. SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>SUPPORT</Text>
          <View style={styles.groupedCard}>
            {/* EMAIL SUPPORT */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: LIGHT_BLUE }]}>
                <Mail size={18} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Email Support</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  nihal26302@iiitnr.edu.in
                </Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* CALL SUPPORT */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleCall('9565550673')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: LIGHT_BLUE }]}>
                <Phone size={18} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Call Support</Text>
                <Text style={styles.menuSubtitle}>9565550673</Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. SOURCES OF INFORMATION & LEGAL */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>SOURCE OF INFORMATION & LEGAL</Text>
          <View style={styles.groupedCard}>
            {/* TATPAR OFFICIAL PORTAL */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleWebsite('https://www.tatparbus.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Globe size={18} color="#166534" strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Tatpar BRTS Official Portal</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  Official public source: tatparbus.in
                </Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* DISTRICT ADMIN PORTAL */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleWebsite('https://raipur.gov.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Globe size={18} color="#166534" strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Raipur District Portal</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  Official public source: raipur.gov.in
                </Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* STATE GOVT PORTAL */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleWebsite('https://chhattisgarh.gov.in')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Globe size={18} color="#166534" strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Chhattisgarh State Portal</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  Official public source: chhattisgarh.gov.in
                </Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* PRIVACY POLICY */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/privacy-policy' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F0F5FF' }]}>
                <ShieldCheck size={18} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Privacy Policy</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  Data safety, permissions & privacy practices
                </Text>
              </View>
              <ChevronRight size={18} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* TERMS OF SERVICE */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/terms' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#F0F5FF' }]}>
                <FileText size={18} color={PRIMARY} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Terms & Government Disclaimer</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>
                  Non-affiliation notice, usage guidelines & disclaimers
                </Text>
              </View>
              <ChevronRight size={18} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. NETWORK / BRTS CORRIDORS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithSub}>
            <Text style={styles.sectionHeadingNoMargin}>NETWORK</Text>
            <Text style={styles.sectionSubHeading}>4 corridors covered</Text>
          </View>
          <View style={styles.groupedCard}>
            {/* CORRIDOR 1 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: PRIMARY }]} />
              <View style={styles.corridorContentCol}>
                <Text style={styles.corridorName}>Corridor 1</Text>
                <Text style={styles.corridorRoute}>Railway Station → Mantralaya</Text>
                <Text style={styles.corridorDescription}>
                  Via Telibandha, Serikhedi, Nava Raipur Entry, Capital Complex
                </Text>
              </View>
            </View>

            <View style={styles.corridorDivider} />

            {/* CORRIDOR 2 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: DARK_BLUE }]} />
              <View style={styles.corridorContentCol}>
                <Text style={styles.corridorName}>Corridor 2</Text>
                <Text style={styles.corridorRoute}>Railway Station → PHQ</Text>
                <Text style={styles.corridorDescription}>
                  Connecting central administration and security headquarters
                </Text>
              </View>
            </View>

            <View style={styles.corridorDivider} />

            {/* CORRIDOR 3 */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: SUCCESS }]} />
              <View style={styles.corridorContentCol}>
                <Text style={styles.corridorName}>Corridor 3</Text>
                <Text style={styles.corridorRoute}>Railway Station → HNLU</Text>
                <Text style={styles.corridorDescription}>
                  Serving educational zone, IIIT, and Hidayatullah Law University
                </Text>
              </View>
            </View>

            <View style={styles.corridorDivider} />

            {/* AIRPORT FEEDER */}
            <View style={styles.corridorRow}>
              <View style={[styles.corridorDot, { backgroundColor: WARNING }]} />
              <View style={styles.corridorContentCol}>
                <Text style={styles.corridorName}>Airport Feeder</Text>
                <Text style={styles.corridorRoute}>City → Swami Vivekananda Airport</Text>
                <Text style={styles.corridorDescription}>
                  Scheduled connecting services for flight passengers
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. EMERGENCY CONTACTS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>EMERGENCY</Text>
          <View style={styles.groupedCard}>
            {/* EMERGENCY 112 */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleCall('112')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#FEE4E2' }]}>
                <Phone size={18} color={EMERGENCY_RED} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Emergency Response Support System</Text>
                <Text style={[styles.menuSubtitle, { color: EMERGENCY_RED, fontWeight: '500' }]}>
                  Dial 112 · Police, Fire, Medical
                </Text>
              </View>
              <ExternalLink size={16} color={EMERGENCY_RED} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* RMC HELPLINE */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleCall('18002331234')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#FEF0C7' }]}>
                <Phone size={18} color={WARNING} strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>Raipur Municipal Corporation (RMC)</Text>
                <Text style={styles.menuSubtitle}>
                  1800-233-1234 · Toll Free Civic Helpline
                </Text>
              </View>
              <ExternalLink size={16} color={TEXT_MUTED} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. DEVELOPER & PROJECT ATTRIBUTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>PROJECT</Text>
          <View style={[styles.groupedCard, styles.projectCard]}>
            <Text style={styles.projectName}>Nihal Kumar</Text>
            <Text style={styles.projectRole}>Lead Developer & Maintainer</Text>

            <View style={styles.projectList}>
              {/* EMAIL */}
              <TouchableOpacity
                style={styles.projectLinkRow}
                onPress={() => handleEmail('nihal26302@iiitnr.edu.in')}
                activeOpacity={0.7}
              >
                <Mail size={15} color={TEXT_SECONDARY} strokeWidth={2} style={styles.projectIcon} />
                <Text style={styles.projectLinkText}>nihal26302@iiitnr.edu.in</Text>
              </TouchableOpacity>

              {/* PHONE */}
              <TouchableOpacity
                style={styles.projectLinkRow}
                onPress={() => handleCall('9565550673')}
                activeOpacity={0.7}
              >
                <Phone size={15} color={TEXT_SECONDARY} strokeWidth={2} style={styles.projectIcon} />
                <Text style={styles.projectLinkText}>9565550673</Text>
              </TouchableOpacity>

              {/* WEBSITE */}
              <TouchableOpacity
                style={styles.projectLinkRow}
                onPress={() => handleWebsite('https://tatpar-brts-raipur.vercel.app')}
                activeOpacity={0.7}
              >
                <Globe size={15} color={TEXT_SECONDARY} strokeWidth={2} style={styles.projectIcon} />
                <Text style={styles.projectLinkText}>tatpar-brts-raipur.vercel.app</Text>
              </TouchableOpacity>

              {/* LOCATION */}
              <View style={styles.projectLinkRow}>
                <MapPin size={15} color={TEXT_SECONDARY} strokeWidth={2} style={styles.projectIcon} />
                <Text style={styles.projectLocationText}>Raipur, Chhattisgarh, India</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 8. MINIMAL FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Tatpar BRTS Raipur</Text>
          <Text style={styles.footerTagline}>“Built for Raipur commuters.”</Text>
          <Text style={styles.footerCopyright}>
            © 2026 Tatpar BRTS Raipur · Open Transit Initiative
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER_COLOR,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    maxWidth: Platform.OS === 'web' ? 680 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },

  /* 2. APP INTRO */
  introSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  appIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(36, 56, 184, 0.12)',
  },
  introTextCol: {
    flex: 1,
  },
  appName: {
    fontFamily: FONT.bold,
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  appVersion: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 2,
  },
  appTagline: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginTop: 4,
  },

  /* SECTION LABELS */
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderWithSub: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeadingNoMargin: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionSubHeading: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },

  /* GROUPED CARDS (UNIFIED CLEAN WHITE SURFACE) */
  groupedCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14.5,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  menuSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginLeft: 64,
  },

  /* NETWORK / CORRIDORS */
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  corridorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 12,
  },
  corridorContentCol: {
    flex: 1,
  },
  corridorName: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  corridorRoute: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY,
    marginTop: 1,
  },
  corridorDescription: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 17,
    marginTop: 3,
  },
  corridorDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginLeft: 36,
  },

  /* PROJECT ATTRIBUTION */
  projectCard: {
    padding: 16,
  },
  projectName: {
    fontFamily: FONT.bold,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  projectRole: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginTop: 2,
    marginBottom: 14,
  },
  projectList: {
    gap: 10,
  },
  projectLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    marginRight: 10,
  },
  projectLinkText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY,
  },
  projectLocationText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: TEXT_SECONDARY,
  },

  /* 8. FOOTER */
  footer: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 16,
  },
  footerBrand: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: 0.2,
  },
  footerTagline: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  footerCopyright: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 6,
  },
});
