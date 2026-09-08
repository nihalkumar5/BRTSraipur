import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck, Lock, Bell, Eye, Mail, Globe, ExternalLink } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <ShieldCheck size={16} color="#15803D" />
          <Text style={styles.badgeText}>Google Play Compliant · Last updated: September 2026</Text>
        </View>

        <Text style={styles.mainTitle}>Privacy Policy for Tatpar BRTS Raipur</Text>
        <Text style={styles.paragraph}>
          Tatpar BRTS Raipur ("we", "our", or "the app") provides public transit timetable, fare information,
          and route planning for passengers in Nava Raipur Atal Nagar and Raipur City, Chhattisgarh. We are
          committed to protecting your privacy and ensuring transparency in all our operations.
        </Text>

        {/* SECTION 1 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>1. Information We Do NOT Collect</Text>
          </View>
          <Text style={styles.paragraph}>
            We believe in complete privacy by design:
          </Text>
          <Text style={styles.bulletPoint}>• No Account Required: You can check all bus schedules, fares, and stops without registering, signing in, or providing your name, phone number, or email.</Text>
          <Text style={styles.bulletPoint}>• No Financial Data: Ticket fares shown in the app are for reference. We do not store or process your credit card, debit card, or UPI information.</Text>
          <Text style={styles.bulletPoint}>• No Background Location Tracking: We do not track your GPS location in the background or sell your location data to any third party.</Text>
        </View>

        {/* SECTION 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>2. Device Permissions Used</Text>
          </View>
          <Text style={styles.paragraph}>
            The app requests minimal permissions strictly necessary for user-initiated functionality:
          </Text>
          <Text style={styles.bulletPoint}>
            • Notifications (<Text style={styles.bold}>POST_NOTIFICATIONS</Text>): Used only when you tap "Remind Me" on a bus departure, allowing your device to alert you 15 or 30 minutes before your scheduled bus leaves.
          </Text>
          <Text style={styles.bulletPoint}>
            • Vibrate (<Text style={styles.bold}>VIBRATE</Text>): Used to provide haptic feedback and attention alerts when a bus departure reminder triggers.
          </Text>
          <Text style={styles.bulletPoint}>
            • Network Access (<Text style={styles.bold}>INTERNET</Text>): Used solely to fetch live transit updates and web assets.
          </Text>
        </View>

        {/* SECTION 3 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>3. Third-Party Services</Text>
          </View>
          <Text style={styles.paragraph}>
            The app is developed using React Native / Expo. The app may utilize standard platform services:
          </Text>
          <Text style={styles.bulletPoint}>• Google Play Services (Crash reporting & standard diagnostic telemetry)</Text>
          <Text style={styles.bulletPoint}>• Expo Framework (Runtime libraries & local notification handlers)</Text>
          <Text style={styles.paragraph}>
            These services may collect anonymized system logs (OS version, device model) to ensure crash-free operation in accordance with Google Play Developer policies.
          </Text>
        </View>

        {/* SECTION 4 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>4. Children's Privacy</Text>
          </View>
          <Text style={styles.paragraph}>
            Our application is intended for general public transit users of all ages, including students and families. We do not knowingly collect personal identifiable information from children under 13 years of age.
          </Text>
        </View>

        {/* SECTION 5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={18} color="#18258F" />
            <Text style={styles.sectionTitle}>5. Contact Us & Grievance Redressal</Text>
          </View>
          <Text style={styles.paragraph}>
            If you have any questions, suggestions, or grievance complaints regarding this Privacy Policy or app data handling, please contact:
          </Text>
          <TouchableOpacity
            style={styles.clickableRow}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('mailto:nihalkumar5@gmail.com?subject=Tatpar%20BRTS%20Privacy%20Inquiry')}
          >
            <Mail size={15} color="#18258F" />
            <Text style={styles.contactItemLink}>nihalkumar5@gmail.com</Text>
          </TouchableOpacity>

          <View style={styles.clickableRow}>
            <Text style={styles.contactItem}>📍 Location: Raipur, Chhattisgarh, India</Text>
          </View>

          <TouchableOpacity
            style={styles.clickableRow}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://tatpar-brts-raipur.vercel.app')}
          >
            <Globe size={15} color="#18258F" />
            <Text style={styles.contactItemLink}>https://tatpar-brts-raipur.vercel.app</Text>
            <ExternalLink size={13} color="#18258F" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tatpar BRTS Raipur · Public Transit Guide for Nava Raipur Atal Nagar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.08)',
    backgroundColor: '#F8F6F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 37, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101A72',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#101A72',
    lineHeight: 30,
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.06)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#101A72',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  contactItem: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  contactItemLink: {
    fontSize: 14,
    color: '#18258F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(24, 37, 143, 0.08)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
