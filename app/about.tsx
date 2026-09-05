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
  Heart,
  ExternalLink,
} from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:nihalkumar5@gmail.com?subject=Tatpar%20BRTS%20Raipur%20Feedback');
  };

  const handleWebsite = () => {
    Linking.openURL('https://tatpar-brts-raipur.vercel.app');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#18258F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.appIconWrapper}>
            <Bus size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.appNameHindi}>तत्पर BRTS रायपुर</Text>
          <Text style={styles.appName}>Tatpar BRTS Raipur</Text>
          <Text style={styles.versionBadge}>Version 1.0.0 (Production Release)</Text>
          <Text style={styles.tagline}>
            Complete digital timetable, bus stop guide, and fare planner for Raipur and Nava Raipur Atal Nagar BRTS network.
          </Text>
        </View>

        {/* OFFICIAL WEBSITE & WEB PORTAL */}
        <Text style={styles.sectionHeading}>Official Web Portal</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleWebsite}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Globe size={18} color="#18258F" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Tatpar BRTS Web Portal</Text>
              <Text style={styles.menuSubtitle}>https://tatpar-brts-raipur.vercel.app</Text>
            </View>
            <ExternalLink size={18} color="#18258F" />
          </TouchableOpacity>
        </View>

        {/* COMPLIANCE & LEGAL LINKS */}
        <Text style={styles.sectionHeading}>Legal & Compliance</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/privacy-policy' as any)}
          >
            <View style={styles.menuIconContainer}>
              <ShieldCheck size={18} color="#18258F" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
              <Text style={styles.menuSubtitle}>Data safety, permissions & privacy practices</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/terms' as any)}
          >
            <View style={styles.menuIconContainer}>
              <FileText size={18} color="#18258F" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Terms of Service</Text>
              <Text style={styles.menuSubtitle}>Usage guidelines, disclaimers & fair use</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* BRTS NETWORK DETAILS */}
        <Text style={styles.sectionHeading}>BRTS Corridors Covered</Text>
        <View style={styles.corridorCard}>
          <View style={styles.corridorItem}>
            <View style={[styles.corridorDot, { backgroundColor: '#18258F' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.corridorTitle}>Corridor 1 · Railway Station ⇄ Mantralaya</Text>
              <Text style={styles.corridorDesc}>Via Telibandha, Serikhedi, Naya Raipur Entry, Capital Complex</Text>
            </View>
          </View>
          <View style={styles.corridorItem}>
            <View style={[styles.corridorDot, { backgroundColor: '#D97706' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.corridorTitle}>Corridor 2 · Railway Station ⇄ PHQ (Police HQ)</Text>
              <Text style={styles.corridorDesc}>Connecting central administration and security headquarters</Text>
            </View>
          </View>
          <View style={styles.corridorItem}>
            <View style={[styles.corridorDot, { backgroundColor: '#15803D' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.corridorTitle}>Corridor 3 · Railway Station ⇄ HNLU</Text>
              <Text style={styles.corridorDesc}>Serving educational zone, IIIT, and Hidayatullah Law University</Text>
            </View>
          </View>
          <View style={styles.corridorItem}>
            <View style={[styles.corridorDot, { backgroundColor: '#9333EA' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.corridorTitle}>Airport Feeder · City ⇄ Swami Vivekananda Airport</Text>
              <Text style={styles.corridorDesc}>Scheduled connecting services for flight passengers</Text>
            </View>
          </View>
        </View>

        {/* CIVIC HELPLINES */}
        <Text style={styles.sectionHeading}>Helpline & Emergency Contacts</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleCall('112')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Phone size={18} color="#DC2626" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Emergency Response Support System</Text>
              <Text style={styles.menuSubtitle}>Dial 112 (Police, Fire, Medical)</Text>
            </View>
            <ExternalLink size={16} color="#DC2626" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleCall('18002331234')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Phone size={18} color="#D97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Raipur Municipal Corporation (RMC)</Text>
              <Text style={styles.menuSubtitle}>1800-233-1234 (Toll Free Civic Helpline)</Text>
            </View>
            <ExternalLink size={16} color="#D97706" />
          </TouchableOpacity>
        </View>

        {/* DEVELOPER & CONTACT */}
        <Text style={styles.sectionHeading}>Developer & Project Info</Text>
        <View style={styles.developerCard}>
          <Text style={styles.devName}>Nihal Kumar</Text>
          <Text style={styles.devRole}>Lead Developer & Maintainer</Text>
          
          <TouchableOpacity style={styles.devRow} onPress={handleEmail} activeOpacity={0.7}>
            <Mail size={16} color="#18258F" />
            <Text style={styles.devLink}>nihalkumar5@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.devRow} onPress={handleWebsite} activeOpacity={0.7}>
            <Globe size={16} color="#18258F" />
            <Text style={styles.devLink}>https://tatpar-brts-raipur.vercel.app</Text>
          </TouchableOpacity>

          <View style={styles.devRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.devText}>Raipur, Chhattisgarh, India</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Crafted with</Text>
            <Heart size={14} color="#DC2626" fill="#DC2626" style={{ marginHorizontal: 4 }} />
            <Text style={styles.footerText}>for Raipur Commuters</Text>
          </View>
          <Text style={styles.copyrightText}>© 2026 Tatpar BRTS Raipur · Open Transit Initiative</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2DC',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF0F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 18,
    maxWidth: Platform.OS === 'web' ? 760 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  appIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appNameHindi: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18258F',
    marginBottom: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF0F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  corridorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    gap: 14,
  },
  corridorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  corridorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  corridorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  corridorDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  developerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  devName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  devRole: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  devLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18258F',
  },
  devText: {
    fontSize: 13,
    color: '#4B5563',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  copyrightText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
