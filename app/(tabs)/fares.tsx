import React, { useState, useMemo, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpDown, ShieldCheck, Search, X } from 'lucide-react-native';
import { stops, getFare } from '../../src/services/tracker';
import { Stop } from '../../src/types';
import { FONT } from '../../src/theme/typography';

export default function FaresScreen() {
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
    drawerSlideAnim.setValue(420);
    Animated.timing(drawerSlideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const closePicker = () => {
    Animated.timing(drawerSlideAnim, {
      toValue: 420,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setModalVisible(false);
    });
  };

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

      {/* --- STEP 10A: RIGHT-SIDE SLIDE-IN STATION PICKER DRAWER --- */}
      <Modal visible={modalVisible} animationType="none" transparent={true}>
        <View style={styles.modalOverlay}>
          {/* TAP OVERLAY OUTSIDE TO CLOSE */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closePicker}
          />

          {/* RIGHT-SIDE DRAWER CONTAINER */}
          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: drawerSlideAnim }] },
            ]}
          >
            {/* DRAWER HEADER */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {activePicker === 'from' ? 'Boarding station' : 'Destination station'}
              </Text>
              <TouchableOpacity
                onPress={closePicker}
                style={styles.drawerCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <X size={20} color="#002081" />
              </TouchableOpacity>
            </View>

            {/* SEARCH FIELD */}
            <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
              <Search size={16} color={isSearchFocused ? '#002081' : '#556080'} />
              <TextInput
                style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
                placeholder="Search station, landmark..."
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
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={15} color="#556080" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* STATION LIST */}
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
                    activeOpacity={0.7}
                  >
                    {/* BULLET / DOT INDICATOR */}
                    <View
                      style={[
                        styles.drawerItemDot,
                        isSelected && styles.drawerItemDotSelected,
                      ]}
                    />

                    {/* STATION INFO */}
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

  /* --- STEP 10A: RIGHT-SIDE SLIDE-IN STATION PICKER STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)', // Lightweight 12% overlay
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  drawerContainer: {
    backgroundColor: '#F8F9FC',
    width: 400,
    maxWidth: '92%',
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 24,
    shadowColor: '#18258F',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(24, 37, 143, 0.06)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.3,
  },
  drawerCloseBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.10)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchBarFocused: {
    borderColor: '#18258F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: '#10131A',
    paddingVertical: 0,
    fontWeight: '500',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  drawerListContent: {
    paddingBottom: 40,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.06)',
    borderRadius: 10,
  },
  drawerItemRowSelected: {
    backgroundColor: '#E9ECFF',
  },
  drawerItemDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
  },
  drawerItemDotSelected: {
    backgroundColor: '#18258F',
  },
  drawerItemInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  drawerItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  drawerItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10131A',
    flex: 1,
    letterSpacing: -0.1,
  },
  drawerItemNameSelected: {
    color: '#18258F',
  },
  drawerItemCodeBadge: {
    backgroundColor: '#F5EAD8',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  drawerItemCodeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: 0.2,
  },
  drawerItemSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
});

