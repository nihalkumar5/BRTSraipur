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
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Dismiss trip alarm"
        >
          <X size={13} color="#FFFFFF" opacity={0.85} />
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
          <SlidersHorizontal size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Active Reminder Tags */}
      <View style={styles.tagsRow}>
        {alert.minutesBeforeDeparture !== null && (
          <View style={styles.tag}>
            <Bell size={10} color="#93C5FD" style={{ marginRight: 4 }} />
            <Text style={styles.tagText}>
              {alert.minutesBeforeDeparture}m departure alert
            </Text>
          </View>
        )}

        {alert.wakeUpAlarmEnabled && (
          <View style={styles.tag}>
            <MapPin size={10} color="#6EE7B7" style={{ marginRight: 4 }} />
            <Text style={styles.tagText}>
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
    backgroundColor: '#18258F',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  statusTitle: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 3.5,
    paddingHorizontal: 7.5,
    borderRadius: 6,
    marginRight: 10,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '800',
    color: '#18258F',
  },
  routeDetails: {
    flex: 1,
  },
  routeStops: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
    letterSpacing: -0.2,
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#BFDBFE',
  },
  timeHighlight: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 4.5,
    paddingHorizontal: 8.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginLeft: 6,
  },
  editText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 7.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  tagText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#F1F5F9',
  },
});
