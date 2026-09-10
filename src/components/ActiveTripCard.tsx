import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  BellRing,
  Clock,
  MapPin,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react-native';
import { SmartTripAlert } from '../services/notifications';

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
      {/* TOP STATUS BAR */}
      <View style={styles.topBar}>
        <View style={styles.statusLeft}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusTitle}>TRIP ALARM ACTIVE</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          accessibilityLabel="Dismiss active trip alarm"
        >
          <X size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* ROUTE & JOURNEY ROW */}
      <View style={styles.mainRow}>
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>{alert.routeBadge}</Text>
        </View>

        <View style={styles.routeDetails}>
          <Text style={styles.routeStops} numberOfLines={1}>
            {alert.fromStop} <Text style={{ color: '#18258F' }}>➔</Text> {alert.toStop}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={12} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.timeText}>
              Departure at <Text style={styles.timeHighlight}>{alert.departureTime}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={onOpenSettings}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={13} color="#18258F" style={{ marginRight: 4 }} />
          <Text style={styles.adjustText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE PILLS ROW */}
      <View style={styles.pillsRow}>
        {alert.minutesBeforeDeparture !== null && (
          <View style={styles.pillActive}>
            <BellRing size={11} color="#15803D" style={{ marginRight: 4 }} />
            <Text style={styles.pillText}>
              Alert at {alert.departureTriggerTime || `${alert.minutesBeforeDeparture}m prior`}
            </Text>
          </View>
        )}

        {alert.wakeUpAlarmEnabled && (
          <View style={[styles.pillActive, styles.pillWake]}>
            <Sparkles size={11} color="#C2410C" style={{ marginRight: 4 }} />
            <Text style={[styles.pillText, styles.pillWakeText]}>
              Wake-up Alarm: {alert.toStop}
            </Text>
          </View>
        )}

        <View style={[styles.pillActive, styles.pillVibrate]}>
          <Text style={styles.pillVibrateIcon}>📳</Text>
          <Text style={[styles.pillText, styles.pillVibrateText]}>Vibrate Armed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 13,
    marginBottom: 14,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    padding: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeBox: {
    backgroundColor: '#18258F',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routeDetails: {
    flex: 1,
  },
  routeStops: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  timeHighlight: {
    fontWeight: '700',
    color: '#18258F',
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginLeft: 6,
  },
  adjustText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#166534',
  },
  pillWake: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  pillWakeText: {
    color: '#9A3412',
  },
  pillVibrate: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  pillVibrateIcon: {
    fontSize: 10.5,
    marginRight: 3,
  },
  pillVibrateText: {
    color: '#475569',
  },
});
