import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { BellOff, AlertTriangle } from 'lucide-react-native';
import { FONT } from '../theme/typography';
import { useDarkMode } from '../services/theme';
import { triggerTactileVibration } from '../services/notifications';

interface CancelAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  routeBadge?: string;
  fromStop?: string;
  toStop?: string;
}

export default function CancelAlarmModal({
  visible,
  onClose,
  onConfirmCancel,
  routeBadge,
  fromStop,
  toStop,
}: CancelAlarmModalProps) {
  const [isDark] = useDarkMode();

  const handleKeep = () => {
    triggerTactileVibration([0, 20]);
    onClose();
  };

  const handleConfirm = () => {
    triggerTactileVibration([0, 80]);
    onConfirmCancel();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleKeep}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogContainer, isDark && styles.dialogDark]}>
              {/* Icon */}
              <View style={[styles.iconBox, isDark && styles.iconBoxDark]}>
                <BellOff size={22} color={isDark ? '#F87171' : '#DC2626'} strokeWidth={2.2} />
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.dialogTitle, isDark && styles.textDark]}>
                Turn Off Trip Alarm?
              </Text>
              <Text style={[styles.dialogMessage, isDark && styles.subTextDark]}>
                This will cancel your departure alert and destination wake-up alarm
                {routeBadge ? ` for Route ${routeBadge}` : ''}
                {fromStop && toStop ? ` (${fromStop} → ${toStop})` : ''}.
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.btnKeep, isDark && styles.btnKeepDark]}
                  onPress={handleKeep}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.btnKeepText, isDark && styles.btnKeepTextDark]}>
                    Keep Alarm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnCancelText}>Turn Off</Text>
                </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  dialogDark: {
    backgroundColor: '#151D2F',
    borderColor: '#24324D',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconBoxDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  dialogTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  textDark: {
    color: '#F8FAFC',
  },
  dialogMessage: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  subTextDark: {
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  btnKeep: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnKeepDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  btnKeepText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  btnKeepTextDark: {
    color: '#E2E8F0',
  },
  btnCancel: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
