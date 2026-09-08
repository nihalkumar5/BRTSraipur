import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  Animated,
  Easing,
  BackHandler,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUpDown,
  Info,
  Search,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  QrCode,
  CreditCard,
  Banknote,
  GraduationCap,
  Sparkles,
  PhoneCall,
  Luggage,
  ShieldCheck,
  Check,
  Percent,
  Zap,
  Bus,
} from 'lucide-react-native';
import { stops, getFare } from '../../src/services/tracker';
import { Stop } from '../../src/types';
import { FONT } from '../../src/theme/typography';

// DESIGN SYSTEM TOKENS (UNIFIED GLOBALLY)
const PRIMARY = '#18258F';
const PRIMARY_LIGHT = 'rgba(24, 37, 143, 0.08)';
const BG_COLOR = '#F7F7F4';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#0B132B';
const TEXT_SECONDARY = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER_COLOR = '#EDF2F7';
const BORDER_DIVIDER = '#EDF2F7';
const SUCCESS_DOT = '#10B981';
const DEST_DOT = '#F97066';

export default function FaresScreen() {
  const insets = useSafeAreaInsets();
  const [fromStop, setFromStop] = useState<string>('Raipur Railway Station');
  const [toStop, setToStop] = useState<string>('HNLU (National Law University)');
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [activePassTab, setActivePassTab] = useState<'monthly' | 'student' | 'daily'>('student');

  // Modal station picker
  const [modalVisible, setModalVisible] = useState(false);
  const [activePicker, setActivePicker] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animations
  const swapSpinAnim = useRef(new Animated.Value(0)).current;
  const fareScaleAnim = useRef(new Animated.Value(1)).current;

  const fare = getFare(fromStop, toStop);

  const triggerFareBounce = () => {
    fareScaleAnim.setValue(0.94);
    Animated.spring(fareScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const spinInterpolate = swapSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const drawerSlideAnim = useRef(new Animated.Value(420)).current;

  const swap = () => {
    Animated.sequence([
      Animated.timing(swapSpinAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(swapSpinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
    triggerFareBounce();
  };

  const openPicker = (type: 'from' | 'to') => {
    setActivePicker(type);
    setSearchQuery('');
    setModalVisible(true);
    drawerSlideAnim.setValue(800);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const closePicker = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: 800,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleBack = useCallback(() => {
    if (modalVisible) {
      closePicker();
      return true;
    }
    return false;
  }, [modalVisible]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__handleActiveScreenBack = handleBack;
      if ((window as any).ReactNativeWebView?.postMessage) {
        try {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'CAN_GO_BACK', canGoBack: modalVisible })
          );
        } catch (e) {}
      }
    }
  }, [handleBack, modalVisible]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleBack();
    });
    return () => sub.remove();
  }, [handleBack]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (modalVisible) {
      if (!window.history.state || !window.history.state.tatparFaresModal) {
        window.history.pushState({ tatparFaresModal: true }, '');
      }
    }
    const onPopState = () => {
      if (modalVisible) {
        closePicker();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (typeof window !== 'undefined' && (window as any).__handleActiveScreenBack === handleBack) {
        (window as any).__handleActiveScreenBack = null;
      }
    };
  }, [modalVisible, handleBack]);

  const selectStation = (station: Stop) => {
    if (activePicker === 'from') {
      setFromStop(station.name);
    } else {
      setToStop(station.name);
    }
    closePicker();
    triggerFareBounce();
  };

  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return stops;
    const q = searchQuery.toLowerCase();
    return stops.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.hindiName.includes(q)
    );
  }, [searchQuery]);

  const fromDisplay = stops.find(s => s.name === fromStop)?.shortName || fromStop.split('(')[0].trim();
  const toDisplay = stops.find(s => s.name === toStop)?.shortName || toStop.split('(')[0].trim();

  // Official distance slabs
  const distanceSlabs = [
    { range: '0 – 3 km', fare: '₹5', note: 'Local feeder & sector loops', example: 'Sector 24 → CBD' },
    { range: '3 – 8 km', fare: '₹10', note: 'Within Nava Raipur zone', example: 'Indravati → HNLU' },
    { range: '8 – 15 km', fare: '₹20', note: 'City connector corridors', example: 'Telibandha → Serikhedi' },
    { range: '15 – 25 km', fare: '₹30', note: 'Major express journeys', example: 'Railway Stn → Mantralaya' },
    { range: '25+ km', fare: '₹40', note: 'Full end-to-end corridor', example: 'Railway Stn → HNLU / Muktangan' },
  ];

  const handleCallHelpline = () => {
    Linking.openURL('tel:18002330405').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Fares & Passes</Text>
          <Text style={styles.subtitle}>Official Tatpar BRTS rates, passes & concessions</Text>
        </View>

        {/* 2. FARE CALCULATOR (HERO COMPONENT) */}
        <View style={styles.calcSection}>
          <Text style={styles.sectionHeaderLabel}>CALCULATE TICKET FARE</Text>
          <View style={styles.calcCard}>
            {/* FROM FIELD */}
            <TouchableOpacity
              style={styles.stationField}
              onPress={() => openPicker('from')}
              activeOpacity={0.7}
            >
              <Text style={styles.fieldLabel}>FROM</Text>
              <View style={styles.fieldInputRow}>
                <View style={[styles.locationDot, { backgroundColor: SUCCESS_DOT }]} />
                <Text style={styles.stationText} numberOfLines={1}>
                  {fromDisplay}
                </Text>
              </View>
            </TouchableOpacity>

            {/* DIVIDER WITH COMPACT SWAP BUTTON */}
            <View style={styles.swapDividerRow}>
              <View style={styles.swapDividerLine} />
              <TouchableOpacity onPress={swap} style={styles.swapBtn} activeOpacity={0.75}>
                <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                  <ArrowUpDown size={13} color={PRIMARY} strokeWidth={2.2} />
                </Animated.View>
              </TouchableOpacity>
              <View style={styles.swapDividerLine} />
            </View>

            {/* TO FIELD */}
            <TouchableOpacity
              style={styles.stationField}
              onPress={() => openPicker('to')}
              activeOpacity={0.7}
            >
              <Text style={styles.fieldLabel}>TO</Text>
              <View style={styles.fieldInputRow}>
                <View style={[styles.locationDot, { backgroundColor: DEST_DOT }]} />
                <Text style={styles.stationText} numberOfLines={1}>
                  {toDisplay}
                </Text>
              </View>
            </TouchableOpacity>

            {/* SEPARATOR TO FARE RESULT */}
            <View style={styles.resultSeparator} />

            {/* PROMINENT FARE RESULT (THE VISUAL ANCHOR) */}
            <Animated.View
              style={[
                styles.fareResultCenter,
                { transform: [{ scale: fareScaleAnim }] },
              ]}
            >
              <Text style={styles.farePriceHero}>₹{fare}</Text>
              <Text style={styles.fareRouteText} numberOfLines={1}>
                {fromDisplay} → {toDisplay}
              </Text>
              <Text style={styles.fareTypeSub}>One way · Single Passenger</Text>
            </Animated.View>
          </View>
        </View>

        {/* 3. ACCEPTED PAYMENT MODES */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionHeaderLabel}>ACCEPTED PAYMENT MODES</Text>
          <View style={styles.paymentGrid}>
            <View style={styles.paymentModeCard}>
              <View style={[styles.paymentIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <QrCode size={18} color={PRIMARY} strokeWidth={2.2} />
              </View>
              <Text style={styles.paymentModeTitle}>UPI / QR</Text>
              <Text style={styles.paymentModeDesc}>PhonePe, GPay, Paytm on conductor ETM</Text>
            </View>

            <View style={styles.paymentModeCard}>
              <View style={[styles.paymentIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <CreditCard size={18} color="#059669" strokeWidth={2.2} />
              </View>
              <Text style={styles.paymentModeTitle}>Smart Card</Text>
              <Text style={styles.paymentModeDesc}>Tap & Go card with 10% auto-savings</Text>
            </View>

            <View style={styles.paymentModeCard}>
              <View style={[styles.paymentIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Banknote size={18} color="#D97706" strokeWidth={2.2} />
              </View>
              <Text style={styles.paymentModeTitle}>Cash Ticket</Text>
              <Text style={styles.paymentModeDesc}>Exact ₹5, ₹10, ₹20 change preferred</Text>
            </View>
          </View>
        </View>

        {/* 4. BUS PASSES & CONCESSIONS (HIGH COMMUTER VALUE) */}
        <View style={styles.passesSection}>
          <View style={styles.passesHeaderRow}>
            <Text style={styles.sectionHeaderLabel}>COMMUTER PASSES & SAVINGS</Text>
            <View style={styles.discountBadge}>
              <Percent size={11} color="#059669" strokeWidth={2.4} />
              <Text style={styles.discountBadgeText}>Save up to 50%</Text>
            </View>
          </View>

          {/* PASS SELECTION TABS */}
          <View style={styles.passTabsRow}>
            <TouchableOpacity
              style={[styles.passTabBtn, activePassTab === 'student' && styles.passTabBtnActive]}
              onPress={() => setActivePassTab('student')}
              activeOpacity={0.7}
            >
              <GraduationCap
                size={13}
                color={activePassTab === 'student' ? PRIMARY : TEXT_SECONDARY}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.passTabText,
                  activePassTab === 'student' && styles.passTabTextActive,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.passTabBtn, activePassTab === 'monthly' && styles.passTabBtnActive]}
              onPress={() => setActivePassTab('monthly')}
              activeOpacity={0.7}
            >
              <Sparkles
                size={13}
                color={activePassTab === 'monthly' ? PRIMARY : TEXT_SECONDARY}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.passTabText,
                  activePassTab === 'monthly' && styles.passTabTextActive,
                ]}
              >
                Monthly All-Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.passTabBtn, activePassTab === 'daily' && styles.passTabBtnActive]}
              onPress={() => setActivePassTab('daily')}
              activeOpacity={0.7}
            >
              <Zap
                size={13}
                color={activePassTab === 'daily' ? PRIMARY : TEXT_SECONDARY}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.passTabText,
                  activePassTab === 'daily' && styles.passTabTextActive,
                ]}
              >
                Daily Pass
              </Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVE PASS DETAILS CARD */}
          <View style={styles.passDetailsCard}>
            {activePassTab === 'student' && (
              <>
                <View style={styles.passCardTop}>
                  <View>
                    <Text style={styles.passHeroTitle}>Student Concession Pass</Text>
                    <Text style={styles.passHeroSub}>For School, College & University Students</Text>
                  </View>
                  <View style={styles.passPriceTag}>
                    <Text style={styles.passDiscountBig}>50%</Text>
                    <Text style={styles.passDiscountLabel}>OFF</Text>
                  </View>
                </View>
                <View style={styles.passDivider} />
                <View style={styles.passPerksList}>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Valid on all AC Express & Feeder buses</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Issued at Telibandha & Railway Station counters</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Requires valid Student ID card & Aadhaar copy</Text>
                  </View>
                </View>
              </>
            )}

            {activePassTab === 'monthly' && (
              <>
                <View style={styles.passCardTop}>
                  <View>
                    <Text style={styles.passHeroTitle}>Monthly All-Network Pass</Text>
                    <Text style={styles.passHeroSub}>Unlimited rides across all 25 shelters</Text>
                  </View>
                  <View style={styles.passPriceTag}>
                    <Text style={styles.passPriceBig}>₹800</Text>
                    <Text style={styles.passDiscountLabel}>/ month</Text>
                  </View>
                </View>
                <View style={styles.passDivider} />
                <View style={styles.passPerksList}>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Unlimited daily rides on all BRTS & Feeder lines</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Save over ₹600/month compared to daily tickets</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Direct Smart Card recharge available on counters</Text>
                  </View>
                </View>
              </>
            )}

            {activePassTab === 'daily' && (
              <>
                <View style={styles.passCardTop}>
                  <View>
                    <Text style={styles.passHeroTitle}>Daily Tourist & Hop-On Pass</Text>
                    <Text style={styles.passHeroSub}>Ideal for visitors, meetings & day trips</Text>
                  </View>
                  <View style={styles.passPriceTag}>
                    <Text style={styles.passPriceBig}>₹50</Text>
                    <Text style={styles.passDiscountLabel}>/ 24 hrs</Text>
                  </View>
                </View>
                <View style={styles.passDivider} />
                <View style={styles.passPerksList}>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Unlimited boarding on any bus for the entire calendar day</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Can be purchased directly from the on-board bus conductor</Text>
                  </View>
                  <View style={styles.passPerkItem}>
                    <Check size={14} color="#059669" strokeWidth={2.4} />
                    <Text style={styles.passPerkText}>Best for touring Jungle Safari, Purkhouti Muktangan & Mantralaya</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 5. OFFICIAL DISTANCE SLABS TABLE */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionHeaderLabel}>OFFICIAL DISTANCE FARE MATRIX</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideTableHeader}>
              <Text style={styles.guideThCol1}>DISTANCE SLAB</Text>
              <Text style={styles.guideThCol2}>ROUTE COVERAGE</Text>
              <Text style={styles.guideThCol3}>FARE</Text>
            </View>

            {distanceSlabs.map((slab, index) => {
              const isLast = index === distanceSlabs.length - 1;
              return (
                <View
                  key={slab.range}
                  style={[styles.guideRow, !isLast && styles.guideRowBorder]}
                >
                  <View style={styles.slabRangeCol}>
                    <Text style={styles.slabRangeText}>{slab.range}</Text>
                    <Text style={styles.slabNoteText}>{slab.note}</Text>
                  </View>
                  <View style={styles.slabExampleCol}>
                    <Text style={styles.slabExampleText} numberOfLines={1}>
                      {slab.example}
                    </Text>
                  </View>
                  <View style={styles.slabPriceCol}>
                    <Text style={styles.slabPriceText}>{slab.fare}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 6. PASSENGER POLICY & HELPLINE */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeaderRow}>
            <ShieldCheck size={16} color={PRIMARY} strokeWidth={2.2} />
            <Text style={styles.policyTitle}>Passenger Rights & Guidelines</Text>
          </View>

          <View style={styles.policyHighlights}>
            <View style={styles.policyRuleItem}>
              <Text style={styles.policyRuleBullet}>•</Text>
              <Text style={styles.policyBullet}>
                <Text style={styles.policyBold}>Children under 5 years:</Text> 100% Free travel across all services.
              </Text>
            </View>

            <View style={styles.policyRuleItem}>
              <Text style={styles.policyRuleBullet}>•</Text>
              <Text style={styles.policyBullet}>
                <Text style={styles.policyBold}>Luggage allowance:</Text> Up to 15 kg personal baggage free per passenger.
              </Text>
            </View>

            <View style={styles.policyRuleItem}>
              <Text style={styles.policyRuleBullet}>•</Text>
              <Text style={styles.policyBullet}>
                <Text style={styles.policyBold}>Senior Citizens & Divyangjan:</Text> Concessionary travel as per Chhattisgarh Govt. transport mandate.
              </Text>
            </View>

            {showFullPolicy && (
              <View style={styles.policyExpandedSection}>
                <View style={styles.policyRuleItem}>
                  <Text style={styles.policyRuleBullet}>•</Text>
                  <Text style={styles.policyBullet}>
                    <Text style={styles.policyBold}>AC Electric Fleet:</Text> 100% low-floor air conditioned buses with dedicated priority seats.
                  </Text>
                </View>
                <View style={styles.policyRuleItem}>
                  <Text style={styles.policyRuleBullet}>•</Text>
                  <Text style={styles.policyBullet}>
                    <Text style={styles.policyBold}>Ticket validity:</Text> Tickets are valid for 2 hours from time of issue on the designated route.
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.policyToggleBtn}
            onPress={() => setShowFullPolicy(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.policyToggleText}>
              {showFullPolicy ? 'Show less guidelines' : 'View complete ticketing terms'}
            </Text>
            {showFullPolicy ? (
              <ChevronUp size={13} color={PRIMARY} />
            ) : (
              <ChevronRight size={13} color={PRIMARY} />
            )}
          </TouchableOpacity>

          {/* HELPLINE CTA CALLOUT */}
          <TouchableOpacity
            style={styles.helplineBanner}
            onPress={handleCallHelpline}
            activeOpacity={0.82}
          >
            <View style={styles.helplineIconWrap}>
              <PhoneCall size={16} color={PRIMARY} strokeWidth={2.2} />
            </View>
            <View style={styles.helplineInfo}>
              <Text style={styles.helplineTitle}>Transit Inquiries & Grievance</Text>
              <Text style={styles.helplinePhone}>Toll-Free: 1800-233-0405</Text>
            </View>
            <View style={styles.helplineActionBadge}>
              <Text style={styles.helplineActionText}>Call</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- STATION SEARCH PICKER MODAL --- */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closePicker}
          />

          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateY: drawerSlideAnim }] },
            ]}
          >
            {/* SEARCH HEADER */}
            <View style={[styles.searchHeaderWrapper, { paddingTop: Math.max(insets.top, 14) }]}>
              <View style={[styles.searchPillContainer, isSearchFocused && styles.searchPillFocused]}>
                <TouchableOpacity
                  onPress={closePicker}
                  style={styles.searchBackBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Back to fare calculator"
                >
                  <ArrowLeft size={20} color={TEXT_PRIMARY} strokeWidth={2.2} />
                </TouchableOpacity>

                <TextInput
                  style={[styles.searchInputPill, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
                  placeholder={activePicker === 'from' ? 'Search Boarding Point' : 'Search Destination Point'}
                  placeholderTextColor={TEXT_MUTED}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  autoFocus={true}
                />

                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.searchClearBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={16} color={TEXT_SECONDARY} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* SECTION HEADING */}
            <View style={styles.searchSectionHeaderRow}>
              <Text style={styles.searchSectionTitle}>
                {searchQuery ? 'Search Results' : 'Popular Stations near you'}
              </Text>
            </View>

            {/* STATIONS LIST */}
            <FlatList
              data={filteredStops}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.drawerListContent}
              renderItem={({ item }) => {
                const isSelected =
                  (activePicker === 'from' && fromStop === item.name) ||
                  (activePicker === 'to' && toStop === item.name);

                return (
                  <TouchableOpacity
                    style={[styles.drawerItemRow, isSelected && styles.drawerItemRowSelected]}
                    onPress={() => selectStation(item)}
                    activeOpacity={0.65}
                  >
                    <View style={styles.drawerItemInfoCol}>
                      <View style={styles.drawerItemTitleRow}>
                        <Text
                          style={[
                            styles.drawerItemName,
                            isSelected && styles.drawerItemNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View style={styles.drawerItemCodeBadge}>
                          <Text style={styles.drawerItemCodeText}>{item.code}</Text>
                        </View>
                      </View>
                      <Text style={styles.drawerItemSub} numberOfLines={1}>
                        {item.hindiName} · {item.landmark}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.drawerEmptyBox}>
                  <Text style={styles.drawerEmptyText}>
                    Koi station nahi mila "{searchQuery}" ke liye
                  </Text>
                  <Text style={styles.drawerEmptySub}>
                    Try searching by stop name, landmark, or terminal code
                  </Text>
                </View>
              }
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 120, // Clean breathing room for floating bottom nav dock
  },
  header: {
    paddingHorizontal: 2,
    marginTop: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* SECTION LABELS */
  sectionHeaderLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  /* 2. FARE CALCULATOR HERO CARD */
  calcSection: {},
  calcCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stationField: {
    paddingVertical: 2,
  },
  fieldLabel: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 9,
  },
  stationText: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
    flex: 1,
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  swapDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_DIVIDER,
  },
  swapBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  resultSeparator: {
    height: 1,
    backgroundColor: BORDER_DIVIDER,
    marginTop: 14,
    marginBottom: 12,
  },
  fareResultCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  farePriceHero: {
    fontFamily: FONT.extraBold,
    fontSize: 36,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  fareRouteText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 2,
  },
  fareTypeSub: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  /* 3. PAYMENT MODES SECTION */
  paymentSection: {},
  paymentGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentModeCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  paymentIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  paymentModeTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  paymentModeDesc: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_SECONDARY,
    lineHeight: 15,
  },

  /* 4. BUS PASSES & CONCESSIONS */
  passesSection: {},
  passesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  discountBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  passTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  passTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 5,
  },
  passTabBtnActive: {
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  passTabText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  passTabTextActive: {
    fontFamily: FONT.bold,
    color: PRIMARY,
    fontWeight: '700',
  },
  passDetailsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  passCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passHeroTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  passHeroSub: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  passPriceTag: {
    alignItems: 'flex-end',
  },
  passDiscountBig: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  passPriceBig: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  passDiscountLabel: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  passDivider: {
    height: 1,
    backgroundColor: BORDER_DIVIDER,
    marginVertical: 12,
  },
  passPerksList: {
    gap: 8,
  },
  passPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passPerkText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_PRIMARY,
    flex: 1,
  },

  /* 5. FARE GUIDE (DISTANCE SLABS TABLE) */
  guideSection: {},
  guideCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  guideTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DIVIDER,
  },
  guideThCol1: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    width: '38%',
  },
  guideThCol2: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    flex: 1,
  },
  guideThCol3: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    textAlign: 'right',
    width: 45,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  guideRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DIVIDER,
  },
  slabRangeCol: {
    width: '38%',
    paddingRight: 6,
  },
  slabRangeText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  slabNoteText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  slabExampleCol: {
    flex: 1,
    paddingRight: 6,
  },
  slabExampleText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#475569',
  },
  slabPriceCol: {
    width: 45,
    alignItems: 'flex-end',
  },
  slabPriceText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: PRIMARY,
    fontVariant: ['tabular-nums'],
  },

  /* 6. OFFICIAL POLICY & HELPLINE CARD */
  policyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  policyTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  policyHighlights: {
    gap: 6,
  },
  policyRuleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  policyRuleBullet: {
    fontSize: 14,
    lineHeight: 18,
    color: PRIMARY,
    fontWeight: '700',
  },
  policyBullet: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  policyBold: {
    fontFamily: FONT.semiBold,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  policyExpandedSection: {
    gap: 6,
    marginTop: 4,
  },
  policyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 3,
    alignSelf: 'flex-start',
  },
  policyToggleText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
  },
  helplineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  helplineIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineTitle: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  helplinePhone: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: PRIMARY,
    marginTop: 1,
  },
  helplineActionBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  helplineActionText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* MODAL STATION PICKER */
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 480,
    height: '100%',
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  searchHeaderWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  searchPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 46,
  },
  searchPillFocused: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  searchBackBtn: {
    paddingRight: 10,
  },
  searchInputPill: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 14.5,
    color: TEXT_PRIMARY,
    fontWeight: '500',
    height: '100%',
  },
  searchClearBtn: {
    padding: 6,
  },
  searchSectionHeaderRow: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  searchSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  drawerListContent: {
    paddingBottom: 40,
  },
  drawerItemRow: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
    backgroundColor: '#FFFFFF',
  },
  drawerItemRowSelected: {
    backgroundColor: PRIMARY_LIGHT,
  },
  drawerItemInfoCol: {
    width: '100%',
  },
  drawerItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  drawerItemName: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
    flex: 1,
    marginRight: 8,
  },
  drawerItemNameSelected: {
    fontFamily: FONT.bold,
    color: PRIMARY,
    fontWeight: '700',
  },
  drawerItemCodeBadge: {
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drawerItemCodeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#344054',
    letterSpacing: 0.3,
  },
  drawerItemSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
  drawerEmptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerEmptyText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: TEXT_PRIMARY,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  drawerEmptySub: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
});
