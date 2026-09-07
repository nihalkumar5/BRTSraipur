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
import { ArrowUpDown, ShieldCheck, Search, X, ArrowLeft } from 'lucide-react-native';
import { stops, getFare } from '../../src/services/tracker';
import { Stop } from '../../src/types';
import { FONT } from '../../src/theme/typography';

export default function FaresScreen() {
  const insets = useSafeAreaInsets();
  const [fromStop, setFromStop] = useState<string>('Raipur Railway Station');
  const [toStop, setToStop] = useState<string>('HNLU (National Law University)');

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
    drawerSlideAnim.setValue(600);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const closePicker = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: 600,
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Fares</Text>
          <Text style={styles.subtitle}>Simple, official bus fares.</Text>
        </View>

        {/* 2. INTERACTIVE FARE LOOKUP (HERO CARD) */}
        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>CHECK YOUR FARE</Text>

          {/* FROM SELECTOR */}
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>FROM</Text>
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => openPicker('from')}
              activeOpacity={0.8}
            >
              <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
              <Text style={styles.selectorBtnText} numberOfLines={1}>
                {fromDisplay}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DIVIDER & SWAP BUTTON */}
          <View style={styles.swapDividerRow}>
            <View style={styles.swapDividerLine} />
            <TouchableOpacity onPress={swap} style={styles.swapBtn} activeOpacity={0.7}>
              <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                <ArrowUpDown size={14} color="#18258F" />
              </Animated.View>
            </TouchableOpacity>
            <View style={styles.swapDividerLine} />
          </View>

          {/* TO SELECTOR */}
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>TO</Text>
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => openPicker('to')}
              activeOpacity={0.8}
            >
              <View style={[styles.dotIndicator, { backgroundColor: '#F26B52' }]} />
              <Text style={styles.selectorBtnText} numberOfLines={1}>
                {toDisplay}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardDivider} />

          {/* 3. PROMINENT FARE RESULT */}
          <Animated.View style={[styles.fareResultCenter, { transform: [{ scale: fareScaleAnim }] }]}>
            <Text style={styles.farePriceHero}>₹{fare}</Text>
            <Text style={styles.fareRouteText} numberOfLines={1}>
              {fromDisplay} → {toDisplay}
            </Text>
            <Text style={styles.fareTypeSub}>One way · Adult</Text>
          </Animated.View>
        </View>

        {/* 4. FARE GUIDE */}
        <View style={styles.slabsSection}>
          <Text style={styles.sectionHeader}>Fare guide</Text>
          <View style={styles.slabsCard}>
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Within Nava Raipur</Text>
              <Text style={styles.slabPrice}>₹5–₹10</Text>
            </View>
            <View style={styles.slabDivider} />
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Telibandha → Nava Raipur</Text>
              <Text style={styles.slabPrice}>₹20–₹25</Text>
            </View>
            <View style={styles.slabDivider} />
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Railway Stn → Mantralaya</Text>
              <Text style={styles.slabPrice}>₹30</Text>
            </View>
            <View style={styles.slabDivider} />
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Railway Stn → HNLU Gate</Text>
              <Text style={styles.slabPrice}>₹35</Text>
            </View>
            <View style={styles.slabDivider} />
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Railway Stn → HNLU</Text>
              <Text style={styles.slabPrice}>₹40</Text>
            </View>
            <View style={styles.slabDivider} />
            <View style={styles.slabRow}>
              <Text style={styles.slabRoute}>Railway Stn → Muktangan</Text>
              <Text style={styles.slabPrice}>₹40</Text>
            </View>
          </View>
        </View>

        {/* 5. OFFICIAL TICKETING POLICY (CLEAN STATIC CARD) */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeaderRow}>
            <ShieldCheck size={16} color="#002081" style={{ marginRight: 8 }} />
            <Text style={styles.policyTitle}>Official ticketing policy</Text>
          </View>

          <View style={styles.policyBody}>
            <View style={styles.policyBulletRow}>
              <Text style={styles.policyDot}>•</Text>
              <Text style={styles.policyBullet}>Under 5 years · Free</Text>
            </View>
            <View style={styles.policyBulletRow}>
              <Text style={styles.policyDot}>•</Text>
              <Text style={styles.policyBullet}>QR / Smart Card · Valid across all 25 shelters</Text>
            </View>
            <View style={styles.policyBulletRow}>
              <Text style={styles.policyDot}>•</Text>
              <Text style={styles.policyBullet}>Student pass · 50% concession</Text>
            </View>
            <View style={styles.policyBulletRow}>
              <Text style={styles.policyDot}>•</Text>
              <Text style={styles.policyBullet}>AC buses · Standard government fares</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- REDBUS-STYLE FULL-WIDTH STATION SEARCH MODAL (IMAGE 1 DESIGN) --- */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          {/* TAP OVERLAY OUTSIDE TO CLOSE */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closePicker}
          />

          {/* FULL-WIDTH SEARCH CONTAINER */}
          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateY: drawerSlideAnim }] },
            ]}
          >
            {/* TOP SEARCH BAR PILL WITH INLINE BACK ARROW (AS IN UPLOADED IMAGE 1) */}
            <View style={[styles.searchHeaderWrapper, { paddingTop: Math.max(insets.top, 14) }]}>
              <View style={[styles.searchPillContainer, isSearchFocused && styles.searchPillFocused]}>
                <TouchableOpacity
                  onPress={closePicker}
                  style={styles.searchBackBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Back to fare calculator"
                >
                  <ArrowLeft size={20} color="#10131A" strokeWidth={2.2} />
                </TouchableOpacity>

                <TextInput
                  style={[styles.searchInputPill, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
                  placeholder={activePicker === 'from' ? 'Search Boarding Point' : 'Search Destination Point'}
                  placeholderTextColor="#9CA3AF"
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
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* SECTION HEADING: Popular Stations near you (AS IN UPLOADED IMAGE 1) */}
            <View style={styles.searchSectionHeaderRow}>
              <Text style={styles.searchSectionTitle}>
                {searchQuery ? 'Search Results' : 'Popular Stations near you'}
              </Text>
            </View>

            {/* FULL-WIDTH STATIONS LIST */}
            <FlatList
              data={filteredStops}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
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
    backgroundColor: '#F8F9FC',
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 110,
  },
  header: {
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26, // Page title: 26 px / 700
    lineHeight: 32, // Line-height around 32 px
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 13.5, // Secondary/supporting: 13–14 px / 500
    lineHeight: 19, // Line-height around 18–20 px
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },

  /* HERO FARE LOOKUP CARD */
  calcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  calcTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  selectorBlock: {
    marginBottom: 4,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  selectorBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  selectorBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#18258F',
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  swapDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(24, 37, 143, 0.08)',
  },
  swapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(24, 37, 143, 0.08)',
    marginTop: 14,
    marginBottom: 12,
  },
  fareResultCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  farePriceHero: {
    fontFamily: FONT.bold,
    fontSize: 32, // Large heading: 30–32 px / 700
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  fareRouteText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18258F',
    marginTop: 2,
  },
  fareTypeSub: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },

  /* APPROVED FARE SLABS */
  slabsSection: {
    marginTop: 2,
  },
  sectionHeader: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  slabsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  slabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  slabRoute: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#10131A',
    fontWeight: '500',
  },
  slabPrice: {
    fontFamily: FONT.bold,
    fontSize: 15, // Fare: 14–15 px / 700
    fontWeight: '700',
    color: '#18258F',
    fontVariant: ['tabular-nums'],
  },
  slabDivider: {
    height: 1,
    backgroundColor: 'rgba(24, 37, 143, 0.06)',
  },

  /* OFFICIAL POLICY CARD */
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.4,
  },
  policyBody: {
    gap: 8,
    paddingTop: 4,
  },
  policyBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  policyDot: {
    fontSize: 13,
    color: '#18258F',
    marginRight: 6,
    lineHeight: 18,
  },
  policyBullet: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },

  /* --- REDBUS-STYLE FULL-WIDTH SEARCH MODAL STYLES (IMAGE 1) --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  searchHeaderWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  searchPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3FA',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPillFocused: {
    borderColor: '#18258F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  searchBackBtn: {
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputPill: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 14.5,
    color: '#10131A',
    fontWeight: '500',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  searchClearBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSectionHeaderRow: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  searchSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#10131A',
    letterSpacing: -0.2,
  },
  drawerListContent: {
    paddingBottom: 60,
  },
  drawerItemRow: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  drawerItemRowSelected: {
    backgroundColor: '#F0F4FF',
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
    color: '#10131A',
    letterSpacing: -0.1,
    flex: 1,
    marginRight: 8,
  },
  drawerItemNameSelected: {
    fontFamily: FONT.bold,
    color: '#18258F',
    fontWeight: '700',
  },
  drawerItemCodeBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 6.5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  drawerItemCodeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.3,
  },
  drawerItemSub: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#6B7280',
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
    color: '#18258F',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  drawerEmptySub: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
  },
});

