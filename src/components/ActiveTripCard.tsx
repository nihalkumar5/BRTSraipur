import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import {
  Bell,
  X,
} from 'lucide-react-native';
import { SmartTripAlert } from '../services/notifications';
import { FONT } from '../theme/typography';
import stopsData from '../data/stops.json';

interface ActiveTripCardProps {
  alert: SmartTripAlert;
  onOpenSettings: () => void;
  onDismiss: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function ActiveTripCard({
  alert,
  onOpenSettings,
  onDismiss,
  containerStyle,
}: ActiveTripCardProps) {
  if (!alert) return null;

  const rawFrom = alert.fromStop || '';
  const rawTo = alert.toStop || '';
  const fromDisp = stopsData.find(s => s.name === rawFrom)?.shortName || (rawFrom ? rawFrom.split('(')[0].trim() : 'Pickup');
  const toDisp = stopsData.find(s => s.name === rawTo)?.shortName || (rawTo ? rawTo.split('(')[0].trim() : 'Destination');
  const depTime = alert.departureTime || '';

  return (
    <View style={[styles.stripContainer, containerStyle]}>
      <TouchableOpacity
        style={styles.stripMainTouch}
        onPress={onOpenSettings}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Trip alarm active: ${fromDisp} to ${toDisp} at ${depTime}. Tap to edit.`}
      >
        {/* Left Notification Icon */}
        <View style={styles.stripIconWrap}>
          <Bell size={12.5} color="#059669" strokeWidth={2.4} />
          <View style={styles.stripPulseDot} />
        </View>

        {/* Center 1-Line Info */}
        <View style={styles.stripTextCol}>
          <Text style={styles.stripText} numberOfLines={1}>
            <Text style={styles.stripRoute}>{fromDisp} → {toDisp}</Text>
            <Text style={styles.stripDot}> · </Text>
            <Text style={styles.stripTime}>{depTime}</Text>
          </Text>
        </View>

        {/* Edit Action Pill */}
        <View style={styles.stripEditBadge}>
          <Text style={styles.stripEditText}>Edit</Text>
        </View>
      </TouchableOpacity>

      {/* Dismiss (X) Button */}
      <TouchableOpacity
        style={styles.stripDismissBtn}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
        activeOpacity={0.7}
        accessibilityLabel="Dismiss trip alarm"
      >
        <X size={13} color="#94A3B8" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 9,
    paddingLeft: 12,
    paddingRight: 10,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        } as any)
      : {}),
  },
  stripMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  stripIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  stripPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    position: 'absolute',
    top: 2,
    right: 2,
  },
  stripTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    marginRight: 6,
  },
  stripText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#334155',
  },
  stripRoute: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stripDot: {
    color: '#94A3B8',
    fontSize: 12,
  },
  stripTime: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#18258F',
  },
  stripEditBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  stripEditText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#18258F',
  },
  stripDismissBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
