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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpDown, Info, Search, X, ArrowLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { stops, getFare } from '../../src/services/tracker';
import { Stop } from '../../src/types';
import { FONT } from '../../src/theme/typography';

// DESIGN SYSTEM TOKENS (SHARED GLOBALLY ACROSS ALL SCREENS)
const PRIMARY = '#2438B8';
const PRIMARY_LIGHT = 'rgba(36, 56, 184, 0.08)';
const BG_COLOR = '#F7F8FA';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#101828';
const TEXT_SECONDARY = '#667085';
const TEXT_MUTED = '#98A2B3';
const BORDER_COLOR = '#E4E7EC';
const BORDER_DIVIDER = '#EAECF0';
const SUCCESS_DOT = '#12B76A';
const DEST_DOT = '#F97066';

export default function FaresScreen() {
  const insets = useSafeAreaInsets();
  const [fromStop, setFromStop] = useState<string>('Raipur Railway Station');
  const [toStop, setToStop] = useState<string>('HNLU (National Law University)');
  const [showFullPolicy, setShowFullPolicy] = useState(false);

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

  // Standard official route fares
  const fareGuideRows = [
    { route: 'Within Nava Raipur', price: '₹5–₹10' },
    { route: 'Telibandha → Nava Raipur', price: '₹20–₹25' },
    { route: 'Railway Stn → Mantralaya', price: '₹30' },
    { route: 'Railway Stn → HNLU Gate', price: '₹35' },
    { route: 'Railway Stn → HNLU', price: '₹40' },
    { route: 'Railway Stn → Muktangan', price: '₹40' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Fares</Text>
          <Text style={styles.subtitle}>Simple, official bus fares.</Text>
        </View>

        {/* 2. FARE CALCULATOR (HERO COMPONENT) */}
        <View style={styles.calcSection}>
          <Text style={styles.sectionHeaderLabel}>CHECK YOUR FARE</Text>
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
              <Text style={styles.fareTypeSub}>One way · Adult</Text>
            </Animated.View>
          </View>
        </View>

        {/* 3. FARE GUIDE (CLEAN ROW-BASED TABLE) */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionHeaderLabel}>FARE GUIDE</Text>
          <View style={styles.guideCard}>
            {fareGuideRows.map((row, index) => {
              const isLast = index === fareGuideRows.length - 1;
              return (
                <View
                  key={row.route}
                  style={[styles.guideRow, !isLast && styles.guideRowBorder]}
                >
                  <Text style={styles.guideRouteText}>{row.route}</Text>
                  <Text style={styles.guidePriceText}>{row.price}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 4. OFFICIAL POLICY (COMPACT EXPANDABLE SECTION) */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeaderRow}>
            <Info size={14} color={PRIMARY} strokeWidth={2.2} />
            <Text style={styles.policyTitle}>Official ticketing policy</Text>
          </View>

          <View style={styles.policyHighlights}>
            <Text style={styles.policyBullet}>• Under 5 years · Free travel</Text>
            <Text style={styles.policyBullet}>
              • QR / Smart Card · Valid across all 25 shelters
            </Text>

            {showFullPolicy && (
              <View style={styles.policyExpandedSection}>
                <Text style={styles.policyBullet}>
                  • Student pass · 50% concession on monthly passes
                </Text>
                <Text style={styles.policyBullet}>
                  • Senior citizens & divyang · Concessionary travel as per CG rules
                </Text>
                <Text style={styles.policyBullet}>
                  • Luggage · Up to 15 kg personal luggage allowed free
                </Text>
                <Text style={styles.policyBullet}>
                  • AC Express buses · Standard government approved distance slabs
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.policyToggleBtn}
            onPress={() => setShowFullPolicy(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.policyToggleText}>
              {showFullPolicy ? 'Hide full policy' : 'View full policy'}
            </Text>
            {showFullPolicy ? (
              <ChevronUp size={13} color={PRIMARY} />
            ) : (
              <ChevronRight size={13} color={PRIMARY} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- STATION SEARCH PICKER MODAL (RED-BUS STYLE) --- */}
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
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
    backgroundColor: '#F2F4F7',
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
    fontSize: 34,
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

  /* 3. FARE GUIDE (CLEAN LIST TABLE) */
  guideSection: {},
  guideCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  guideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  guideRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DIVIDER,
  },
  guideRouteText: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: TEXT_PRIMARY,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  guidePriceText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: PRIMARY,
    fontVariant: ['tabular-nums'],
  },

  /* 4. OFFICIAL POLICY CARD */
  policyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  policyTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  policyHighlights: {
    gap: 4,
    paddingLeft: 2,
  },
  policyBullet: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  policyExpandedSection: {
    gap: 4,
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
