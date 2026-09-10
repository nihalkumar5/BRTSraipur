import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Bell,
  Clock,
  MapPin,
  X,
  Check,
} from 'lucide-react-native';
import { SmartTripAlert, triggerTactileVibration } from '../services/notifications';
import { FONT } from '../theme/typography';

interface SmartAlertModalProps {
  visible: boolean;
  onClose: () => void;
  routeBadge: string;
  routeName?: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  currentAlert: SmartTripAlert | null;
  onSave: (config: {
    minutesBeforeDeparture: number | null;
    wakeUpAlarmEnabled: boolean;
  }) => void;
  onCancelAlert: () => void;
}

const DEPARTURE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Off', value: null },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
];

export default function SmartAlertModal({
  visible,
  onClose,
  routeBadge,
  routeName,
  fromStop,
  toStop,
  departureTime,
  arrivalTime,
  currentAlert,
  onSave,
  onCancelAlert,
}: SmartAlertModalProps) {
  const [minutesBefore, setMinutesBefore] = useState<number | null>(10);
  const [wakeUpEnabled, setWakeUpEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      if (currentAlert) {
        setMinutesBefore(currentAlert.minutesBeforeDeparture);
        setWakeUpEnabled(currentAlert.wakeUpAlarmEnabled);
      } else {
        setMinutesBefore(10);
        setWakeUpEnabled(true);
      }
    }
  }, [visible, currentAlert]);

  const handleSelectMinutes = (val: number | null) => {
    triggerTactileVibration([0, 30]);
    setMinutesBefore(val);
  };

  const handleToggleWakeUp = () => {
    triggerTactileVibration([0, 30]);
    setWakeUpEnabled(prev => !prev);
  };

  const handleSave = () => {
    triggerTactileVibration([0, 50]);
    onSave({
      minutesBeforeDeparture: minutesBefore,
      wakeUpAlarmEnabled: wakeUpEnabled,
    });
    onClose();
  };

  const handleCancel = () => {
    triggerTactileVibration([0, 50]);
    onCancelAlert();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Sheet Drag Handle */}
              <View style={styles.grabHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>Trip Alarm</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    Route {routeBadge} · {fromStop} → {toStop}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Minimal Schedule Bar */}
              <View style={styles.scheduleBar}>
                <View style={styles.scheduleItem}>
                  <Clock size={13} color="#18258F" style={{ marginRight: 5 }} />
                  <Text style={styles.scheduleLabel}>Departure</Text>
                  <Text style={styles.scheduleValue}>{departureTime}</Text>
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleItem}>
                  <MapPin size={13} color="#059669" style={{ marginRight: 5 }} />
                  <Text style={styles.scheduleLabel}>Arrival</Text>
                  <Text style={styles.scheduleValue}>{arrivalTime}</Text>
                </View>
              </View>

              {/* Section 1: Departure Reminder */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Departure Reminder</Text>
                  <Text style={styles.sectionHelper}>
                    Before bus leaves {fromStop}
                  </Text>
                </View>

                <View style={styles.chipsRow}>
                  {DEPARTURE_OPTIONS.map(opt => {
                    const isSelected = minutesBefore === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() => handleSelectMinutes(opt.value)}
                        activeOpacity={0.75}
                      >
                        {isSelected && opt.value !== null && (
                          <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Section 2: Destination Stop Alarm */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.switchTitle}>Destination Stop Alarm</Text>
                  <Text style={styles.switchSubtitle}>
                    Vibrates 1 stop before {toStop} (~{arrivalTime})
                  </Text>
                </View>

                {/* Minimal iOS-style switch */}
                <TouchableOpacity
                  style={[
                    styles.switchTrack,
                    wakeUpEnabled ? styles.switchTrackOn : styles.switchTrackOff,
                  ]}
                  onPress={handleToggleWakeUp}
                  activeOpacity={0.85}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: wakeUpEnabled }}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      wakeUpEnabled ? styles.switchThumbOn : styles.switchThumbOff,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Footer Actions */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Bell size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>
                    {currentAlert ? 'Update Alarm' : 'Set Alarm'}
                  </Text>
                </TouchableOpacity>

                {currentAlert && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeBtnText}>Remove Alarm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  grabHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },
  scheduleValue: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  scheduleDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHelper: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#18258F',
    borderColor: '#18258F',
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#18258F',
  },
  switchTrackOff: {
    backgroundColor: '#E2E8F0',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  footerActions: {
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18258F',
    height: 46,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  removeBtnText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#EF4444',
  },
});
