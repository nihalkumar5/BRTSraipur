import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Bell,
  MapPin,
  X,
  SlidersHorizontal,
} from 'lucide-react-native';
import { SmartTripAlert } from '../services/notifications';
import { FONT } from '../theme/typography';

interface ActiveTripCardProps {
  alert: SmartTripAlert;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export default function ActiveTripCard({
  alert,
  onOpenSettings,
  onDismiss,
}: ActiveTripCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Top Bar: Active Status & Close */}
      <View style={styles.topBar}>
        <View style={styles.statusLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.statusTitle}>TRIP ALARM ACTIVE</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          accessibilityLabel="Dismiss trip alarm"
        >
          <X size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Main Info Row */}
      <View style={styles.mainRow}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>{alert.routeBadge}</Text>
        </View>

        <View style={styles.routeDetails}>
          <Text style={styles.routeStops} numberOfLines={1}>
            {alert.fromStop} → {alert.toStop}
          </Text>
          <Text style={styles.timeText}>
            Leaves at <Text style={styles.timeHighlight}>{alert.departureTime}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={onOpenSettings}
          activeOpacity={0.75}
        >
          <SlidersHorizontal size={12} color="#18258F" style={{ marginRight: 4 }} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Active Reminder Tags */}
      <View style={styles.tagsRow}>
        {alert.minutesBeforeDeparture !== null && (
          <View style={styles.tag}>
            <Bell size={10} color="#18258F" style={{ marginRight: 4 }} />
            <Text style={styles.tagText}>
              {alert.minutesBeforeDeparture}m before departure
            </Text>
          </View>
        )}

        {alert.wakeUpAlarmEnabled && (
          <View style={styles.tag}>
            <MapPin size={10} color="#059669" style={{ marginRight: 4 }} />
            <Text style={[styles.tagText, { color: '#065F46' }]}>
              Stop alarm at {alert.toStop}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusTitle: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.4,
  },
  dismissBtn: {
    padding: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeBox: {
    backgroundColor: '#18258F',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routeDetails: {
    flex: 1,
  },
  routeStops: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 1,
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  timeHighlight: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#18258F',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: 6,
  },
  editText: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#18258F',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#18258F',
  },
});
