import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, AlertCircle, ShieldAlert, Scale, CheckCircle2, Mail, Globe } from 'lucide-react-native';

export default function TermsOfServiceScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <FileText size={16} color="#18258F" />
          <Text style={styles.badgeText}>Effective Date: September 2026 · v1.0.0</Text>
        </View>

        <Text style={styles.mainTitle}>Terms of Service & Commuter Guidelines</Text>
        <Text style={styles.paragraph}>
          Welcome to Tatpar BRTS Raipur. By downloading, accessing, or using the Tatpar BRTS Raipur application ("the App"),
          you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue using the application.
        </Text>

        {/* SECTION 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          </View>
          <Text style={styles.paragraph}>
            These Terms apply to all users, commuters, and visitors who access or use Tatpar BRTS Raipur on Android, Web, or any other platform. Your continued use of the App signifies your acceptance of these Terms and any future updates.
          </Text>
        </View>

        {/* SECTION 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={18} color="#D97706" />
            <Text style={styles.sectionTitle}>2. Public Transit Information & Disclaimer</Text>
          </View>
          <Text style={styles.paragraph}>
            The timetable, bus stops, routes (Corridors 1, 2, 3 & 4 connecting Raipur Railway Station, Mantralaya, PHQ, Hidayatullah Law University, and Airport), and fare tables displayed in this application are compiled based on published schedules and passenger guidelines for Nava Raipur BRTS.
          </Text>
          <Text style={styles.bulletPoint}>• Timetable Estimates: While we strive for absolute accuracy, real-world bus arrivals may vary due to city traffic, road maintenance, weather conditions, fleet availability, or administrative adjustments by transport authorities.</Text>
          <Text style={styles.bulletPoint}>• Commuter Advisory: Passengers are recommended to arrive at their designated BRTS bus shelter 5 to 10 minutes prior to scheduled departure times.</Text>
          <Text style={styles.bulletPoint}>• Physical Ticketing: Fares indicated in the app are standard published slabs for reference. Tickets must be purchased through authorized onboard conductors or station automated ticketing counters.</Text>
        </View>

        {/* SECTION 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldAlert size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>3. Independent Commuter Utility Disclaimer</Text>
          </View>
          <Text style={styles.paragraph}>
            Tatpar BRTS Raipur is a dedicated civic-tech passenger utility app developed to simplify public transit navigation for citizens and visitors in Nava Raipur Atal Nagar and Raipur. It is an independent transit utility and is not an official government entity, nor does it represent itself as the sole operational authority of the bus network.
          </Text>
        </View>

        {/* SECTION 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>4. User Code of Conduct & Fair Use</Text>
          </View>
          <Text style={styles.paragraph}>
            When utilizing Tatpar BRTS Raipur, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Use the service solely for lawful personal transit navigation and schedule reference.</Text>
          <Text style={styles.bulletPoint}>• Not attempt to decompile, reverse engineer, intercept network traffic, or extract API endpoints maliciously.</Text>
          <Text style={styles.bulletPoint}>• Not use automated crawlers, bots, or scrapers to overwhelm application servers or disrupt service availability for fellow citizens.</Text>
        </View>

        {/* SECTION 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          </View>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by applicable law, the developers and contributors of Tatpar BRTS Raipur shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from:
          </Text>
          <Text style={styles.bulletPoint}>• Any missed buses, transit delays, or itinerary schedule changes.</Text>
          <Text style={styles.bulletPoint}>• Inability to access the application due to network outages or device failure.</Text>
          <Text style={styles.bulletPoint}>• Any reliance placed on transit timing estimations or fare calculations.</Text>
        </View>

        {/* SECTION 6 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>6. Updates & Termination</Text>
          </View>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms of Service or update the application at any time without prior notice. Continued use of the app following any changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        {/* SECTION 7 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>7. Contact & Grievance Redressal</Text>
          </View>
          <Text style={styles.paragraph}>
            If you have questions, feedback, or legal inquiries regarding these Terms of Service, please contact our team:
          </Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactLabel}>Lead Developer & Maintainer:</Text>
            <Text style={styles.contactValue}>Nihal Kumar</Text>
            <View style={styles.contactRow}>
              <Mail size={14} color="#18258F" />
              <Text style={styles.contactValue}>nihalkumar5@gmail.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Globe size={14} color="#18258F" />
              <Text style={styles.contactValue}>https://tatpar-brts-raipur.vercel.app</Text>
            </View>
            <Text style={styles.contactCity}>Raipur, Chhattisgarh, India</Text>
          </View>
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
    padding: 20,
    maxWidth: Platform.OS === 'web' ? 760 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF0F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18258F',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18258F',
    marginBottom: 12,
    lineHeight: 30,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 4,
  },
  section: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  contactCard: {
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#18258F',
  },
  contactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18258F',
  },
  contactCity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
