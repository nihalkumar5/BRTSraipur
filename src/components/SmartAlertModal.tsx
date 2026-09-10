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
  BellRing,
  Clock,
  MapPin,
  X,
  Check,
  CheckCircle2,
  Volume2,
  Sparkles,
} from 'lucide-react-native';
import { SmartTripAlert, triggerTactileVibration } from '../services/notifications';

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

const DEPARTURE_OPTIONS: { label: string; value: number | null; desc: string }[] = [
  { label: '5m prior', value: 5, desc: 'Quick walk alert' },
  { label: '10m prior', value: 10, desc: 'Recommended' },
  { label: '15m prior', value: 15, desc: 'Normal commute' },
  { label: '30m prior', value: 30, desc: 'Far from stop' },
  { label: 'Off', value: null, desc: 'No departure alert' },
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
  const [testedBuzz, setTestedBuzz] = useState<boolean>(false);

  // Sync state with current alert on open
  useEffect(() => {
    if (visible) {
      if (currentAlert) {
        setMinutesBefore(currentAlert.minutesBeforeDeparture);
        setWakeUpEnabled(currentAlert.wakeUpAlarmEnabled);
      } else {
        setMinutesBefore(10);
        setWakeUpEnabled(true);
      }
      setTestedBuzz(false);
    }
  }, [visible, currentAlert]);

  const handleTestBuzz = () => {
    triggerTactileVibration([0, 400, 150, 400]);
    setTestedBuzz(true);
    setTimeout(() => setTestedBuzz(false), 2000);
  };

  const handleSelectMinutes = (val: number | null) => {
    triggerTactileVibration([0, 50]);
    setMinutesBefore(val);
  };

  const handleToggleWakeUp = () => {
    triggerTactileVibration([0, 60]);
    setWakeUpEnabled(prev => !prev);
  };

  const handleSave = () => {
    triggerTactileVibration([0, 150, 80, 150]);
    onSave({
      minutesBeforeDeparture: minutesBefore,
      wakeUpAlarmEnabled: wakeUpEnabled,
    });
    onClose();
  };

  const handleCancel = () => {
    triggerTactileVibration([0, 100]);
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
              {/* SHEET GRAB HANDLE */}
              <View style={styles.grabHandle} />

              {/* HEADER */}
              <View style={styles.headerRow}>
                <View style={styles.headerIconBox}>
                  <BellRing size={20} color="#18258F" strokeWidth={2.4} />
                </View>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.headerTitle}>Trip Guard & Stop Alarm</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    Route {routeBadge} · {fromStop} ➔ {toStop}
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

              {/* TRIP SUMMARY CAPSULE */}
              <View style={styles.tripCapsule}>
                <View style={styles.capsuleItem}>
                  <Clock size={13} color="#18258F" style={{ marginRight: 5 }} />
                  <Text style={styles.capsuleLabel}>Departure:</Text>
                  <Text style={styles.capsuleValue}>{departureTime}</Text>
                </View>
                <View style={styles.capsuleDivider} />
                <View style={styles.capsuleItem}>
                  <MapPin size={13} color="#EA580C" style={{ marginRight: 5 }} />
                  <Text style={styles.capsuleLabel}>Destination:</Text>
                  <Text style={styles.capsuleValue}>{arrivalTime}</Text>
                </View>
              </View>

              {/* 1. DEPARTURE REMINDER SECTION */}
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>1. Boarding Departure Alert</Text>
                  <Text style={styles.sectionSub}>Ghar/Office se nikalne ka alert</Text>
                </View>
                <Text style={styles.sectionDesc}>
                  Alert before bus leaves {fromStop} ({departureTime}):
                </Text>

                <View style={styles.chipsRow}>
                  {DEPARTURE_OPTIONS.map(opt => {
                    const isSelected = minutesBefore === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                          opt.value === null && isSelected && styles.chipOffActive,
                        ]}
                        onPress={() => handleSelectMinutes(opt.value)}
                        activeOpacity={0.75}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            color={opt.value === null ? '#64748B' : '#FFFFFF'}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextActive,
                            opt.value === null && isSelected && styles.chipOffTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. DESTINATION WAKE-UP STOP ALARM SECTION */}
              <View style={styles.wakeCard}>
                <View style={styles.wakeHeaderRow}>
                  <View style={styles.wakeIconBox}>
                    <Bell size={18} color="#EA580C" strokeWidth={2.4} />
                  </View>
                  <View style={styles.wakeTextWrap}>
                    <View style={styles.wakeTitleRow}>
                      <Text style={styles.wakeTitle}>2. Destination Wake-up Alarm</Text>
                      <View style={styles.recomBadge}>
                        <Sparkles size={10} color="#EA580C" style={{ marginRight: 3 }} />
                        <Text style={styles.recomText}>COMMUTER FAVORITE</Text>
                      </View>
                    </View>
                    <Text style={styles.wakeDesc}>
                      Loud vibration alarm ~1 stop before reaching {toStop} (~{arrivalTime}).
                    </Text>
                    <Text style={styles.wakeHint}>
                      Bus mein aaram se so ya phone chala sakte hain! Stop miss nahi hoga.
                    </Text>
                  </View>
                </View>

                {/* CUSTOM SWITCH */}
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    wakeUpEnabled ? styles.toggleBtnOn : styles.toggleBtnOff,
                  ]}
                  onPress={handleToggleWakeUp}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      wakeUpEnabled ? styles.toggleKnobOn : styles.toggleKnobOff,
                    ]}
                  >
                    {wakeUpEnabled ? (
                      <Check size={12} color="#15803D" strokeWidth={3} />
                    ) : (
                      <X size={12} color="#94A3B8" strokeWidth={2.5} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.toggleLabel,
                      wakeUpEnabled ? styles.toggleLabelOn : styles.toggleLabelOff,
                    ]}
                  >
                    {wakeUpEnabled ? 'ENABLED' : 'DISABLED'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3. VIBRATE MODE ASSURANCE & TEST BUTTON */}
              <View style={styles.vibrateAssuranceBox}>
                <View style={styles.vibrateInfoRow}>
                  <Text style={styles.vibratePhoneIcon}>📳</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vibrateTitle}>
                      Vibrate Mode Guarantee
                    </Text>
                    <Text style={styles.vibrateSub}>
                      Phone Vibrate ya Silent mode par bhi hoga toh phone buzz karega.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.testBuzzBtn,
                      testedBuzz && styles.testBuzzBtnSuccess,
                    ]}
                    onPress={handleTestBuzz}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.testBuzzText,
                        testedBuzz && styles.testBuzzTextSuccess,
                      ]}
                    >
                      {testedBuzz ? 'Buzzed! ✓' : 'Test Buzz 📳'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* FOOTER ACTIONS */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>
                    {currentAlert ? 'Update Active Alerts' : 'Save & Arm Trip Alerts'}
                  </Text>
                </TouchableOpacity>

                {currentAlert && (
                  <TouchableOpacity
                    style={styles.cancelAlertBtn}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelAlertText}>Turn Off All Alerts</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 20,
  },
  grabHandle: {
    width: 44,
    height: 4.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tripCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  capsuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  capsuleLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
    fontWeight: '500',
  },
  capsuleValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  capsuleDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionDesc: {
    fontSize: 12.5,
    color: '#475569',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7.5,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#18258F',
    borderColor: '#18258F',
  },
  chipOffActive: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipOffTextActive: {
    color: '#475569',
  },
  wakeCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#FED7AA',
    padding: 13,
    marginBottom: 14,
  },
  wakeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  wakeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  wakeTextWrap: {
    flex: 1,
  },
  wakeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  wakeTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#9A3412',
  },
  recomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#FDBA74',
  },
  recomText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.2,
  },
  wakeDesc: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 16,
    marginTop: 2,
  },
  wakeHint: {
    fontSize: 11,
    color: '#9A3412',
    fontStyle: 'italic',
    marginTop: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  toggleBtnOn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
  },
  toggleBtnOff: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobOn: {},
  toggleKnobOff: {},
  toggleLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toggleLabelOn: {
    color: '#15803D',
  },
  toggleLabelOff: {
    color: '#64748B',
  },
  vibrateAssuranceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 11,
    marginBottom: 16,
  },
  vibrateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibratePhoneIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  vibrateTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  vibrateSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  testBuzzBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginLeft: 8,
  },
  testBuzzBtnSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  testBuzzText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
  },
  testBuzzTextSuccess: {
    color: '#15803D',
  },
  footerActions: {
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18258F',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  cancelAlertBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelAlertText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
