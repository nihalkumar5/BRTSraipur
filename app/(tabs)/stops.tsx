import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Linking,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search,
  X,
  MapPin,
  Bus,
  Navigation,
  ArrowRight,
  Clock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import {
  stops,
  getStationDepartures,
  getRoutesServingStation,
  getCurrentMinutesOfDay,
  getNearbyStations,
  StationDeparture,
} from '../../src/services/tracker';
import { Stop } from '../../src/types';
import { FONT } from '../../src/theme/typography';

// DESIGN SYSTEM TOKENS (CONSISTENT WITH HOME / BUS TRACK PAGE)
const PRIMARY = '#18258F';
const PRIMARY_LIGHT = 'rgba(24, 37, 143, 0.08)';
const PRIMARY_DARK = '#101A72';
const BG_COLOR = '#F8F6F0';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#0B132B';
const TEXT_SECONDARY = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER_COLOR = '#EDF2F7';
const LIVE_GREEN = '#10B981';

export default function AllStopsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'hub' | 'hospital' | 'campus'>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const handleBack = useCallback(() => {
    if (selectedStop) {
      setSelectedStop(null);
      return true;
    }
    return false;
  }, [selectedStop]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__handleActiveScreenBack = handleBack;
      if ((window as any).ReactNativeWebView?.postMessage) {
        try {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'CAN_GO_BACK', canGoBack: !!selectedStop })
          );
        } catch (e) {}
      }
    }
  }, [handleBack, selectedStop]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleBack();
    });
    return () => sub.remove();
  }, [handleBack]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedStop) {
      if (!window.history.state || !window.history.state.tatparStopModal) {
        window.history.pushState({ tatparStopModal: true }, '');
      }
    }
    const onPopState = () => {
      if (selectedStop) {
        setSelectedStop(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (typeof window !== 'undefined' && (window as any).__handleActiveScreenBack === handleBack) {
        (window as any).__handleActiveScreenBack = null;
      }
    };
  }, [selectedStop, handleBack]);

  const nowMins = getCurrentMinutesOfDay();

  // Categorize stops cleanly
  const matchesFilter = (stop: Stop, selectedFilter: 'all' | 'hub' | 'hospital' | 'campus'): boolean => {
    if (selectedFilter === 'all') return true;
    const nameLower = stop.name.toLowerCase();
    const lmarkLower = stop.landmark.toLowerCase();

    if (selectedFilter === 'hub') {
      return stop.interchange || stop.id === 'NBK' || stop.id === 'CBD' || stop.id === 'RRS' || stop.id === 'TEL';
    }
    if (selectedFilter === 'hospital') {
      return nameLower.includes('hospital') || lmarkLower.includes('hospital') || stop.id === 'BMC';
    }
    if (selectedFilter === 'campus') {
      return (
        nameLower.includes('iim') ||
        nameLower.includes('iiit') ||
        nameLower.includes('iit') ||
        nameLower.includes('college') ||
        nameLower.includes('university') ||
        nameLower.includes('hnlu')
      );
    }
    return true;
  };

  const filtered = useMemo(() => {
    return stops.filter(s => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.shortName.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.hindiName.includes(search) ||
        s.landmark.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      return matchesFilter(s, filter);
    });
  }, [search, filter]);

  // Departures for the selected stop modal
  const selectedStopDepartures = useMemo(() => {
    if (!selectedStop) return [];
    return getStationDepartures(selectedStop.name, nowMins);
  }, [selectedStop, nowMins]);

  // Routes for selected stop
  const selectedStopRoutes = useMemo(() => {
    if (!selectedStop) return [];
    return getRoutesServingStation(selectedStop.name);
  }, [selectedStop]);

  // Open external navigation in Google / Apple maps
  const openNavigation = (stop: Stop) => {
    const lat = stop.coordinates.latitude;
    const lng = stop.coordinates.longitude;
    const label = encodeURIComponent(`BRTS Shelter: ${stop.name}`);
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    Linking.openURL(url).catch(() => {});
  };

  // Plan journey from here
  const planFromHere = (stopName: string) => {
    setSelectedStop(null);
    router.navigate({ pathname: '/', params: { from: stopName } });
  };

  // Plan journey to here
  const planToHere = (stopName: string) => {
    setSelectedStop(null);
    router.navigate({ pathname: '/', params: { to: stopName } });
  };

  // Format clean human ETA string
  const formatEta = (diffMins: number): string => {
    if (diffMins === 0) return 'Due now';
    if (diffMins > 60) {
      const hrs = Math.floor(diffMins / 60);
      const rem = diffMins % 60;
      return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
    }
    return `in ${diffMins}m`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. HEADER (CLEAN DIRECTORY STYLE) */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Stations & Shelters</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{stops.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Live departure boards & directions for Tatpar BRTS shelters
        </Text>

        {/* 2. SEARCH BOX */}
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={16} color={isFocused ? PRIMARY : TEXT_SECONDARY} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
            placeholder="Search stations, hospitals..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color={TEXT_SECONDARY} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 3. FILTERS (MATCHING SCHEDULE / TIMETABLE TAB CHIPS STYLE) */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'hub' && styles.filterTabActive]}
              onPress={() => setFilter('hub')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === 'hub' && styles.filterTabTextActive]}>
                Interchange
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'hospital' && styles.filterTabActive]}
              onPress={() => setFilter('hospital')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === 'hospital' && styles.filterTabTextActive]}>
                Hospitals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filter === 'campus' && styles.filterTabActive]}
              onPress={() => setFilter('campus')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === 'campus' && styles.filterTabTextActive]}>
                Campuses
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* 4. STATION LIST ITEMS (CLEAN DIRECTORY ROWS WITH ZERO CHROMATIC CLUTTER) */}
      <FlatList
        style={styles.flatList}
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const nextDepartures = getStationDepartures(item.name, nowMins);
          const nextBus = nextDepartures.length > 0 ? nextDepartures[0] : null;
          const routes = getRoutesServingStation(item.name);

          return (
            <TouchableOpacity
              style={styles.stationCard}
              onPress={() => setSelectedStop(item)}
              activeOpacity={0.72}
            >
              {/* STATION NAME & CODE */}
              <View style={styles.stationTopRow}>
                <Text style={styles.stationNameText} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.stationCodeBadge}>{item.code}</Text>
              </View>

              {/* HINDI LOCAL NAME */}
              {item.hindiName ? (
                <Text style={styles.stationHindiText}>{item.hindiName}</Text>
              ) : null}

              {/* LANDMARK LOCATION */}
              <View style={styles.stationLocationRow}>
                <Text style={styles.locationSymbol}>⌖</Text>
                <Text style={styles.stationLocationText} numberOfLines={1}>
                  {item.landmark}
                </Text>
              </View>

              {/* NEXT BUS INFORMATION (TYPOGRAPHY HIERARCHY, CALM GREEN LIVE DOT) */}
              {nextBus ? (
                <View style={styles.nextBusSection}>
                  <Text style={styles.nextBusPreLabel}>Next bus</Text>
                  <View style={styles.nextBusDataRow}>
                    <Text style={styles.nextBusRouteTime}>
                      {nextBus.route} · {nextBus.departureTime}
                    </Text>
                    <View style={styles.nextBusEtaWrapper}>
                      <Text style={styles.nextBusEtaText}>{formatEta(nextBus.diffMins)}</Text>
                      <View style={styles.liveGreenDot} />
                    </View>
                  </View>
                </View>
              ) : null}

              {/* ROUTE NUMBERS & LIVE BOARD CTA */}
              <View style={styles.stationFooterRow}>
                <View style={styles.routesRow}>
                  {routes.slice(0, 4).map(r => (
                    <Text key={r} style={styles.routeNumberText}>
                      {r}
                    </Text>
                  ))}
                  {routes.length > 4 ? (
                    <Text style={styles.routesMoreText}>+{routes.length - 4}</Text>
                  ) : null}
                </View>

                <View style={styles.liveBoardLink}>
                  <Text style={styles.liveBoardText}>Live board →</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 5. INTERACTIVE STATION DEPARTURE & DETAILS MODAL */}
      <Modal
        visible={!!selectedStop}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedStop(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropTap}
            activeOpacity={1}
            onPress={() => setSelectedStop(null)}
          />
          {selectedStop && (
            <View style={styles.modalContainer}>
              {/* HANDLE DRAG BAR */}
              <View style={styles.modalDragHandle} />

              {/* MODAL HEADER */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitleText}>{selectedStop.name}</Text>
                    <Text style={styles.stationCodeBadge}>{selectedStop.code}</Text>
                  </View>
                  <Text style={styles.stationHindiText}>{selectedStop.hindiName}</Text>
                  <View style={styles.stationLocationRow}>
                    <Text style={styles.locationSymbol}>⌖</Text>
                    <Text style={styles.stationLocationText}>{selectedStop.landmark}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedStop(null)}
                >
                  <X size={18} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>

              {/* ACTION BUTTONS (PLAN JOURNEY / GET DIRECTIONS) */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => planFromHere(selectedStop.name)}
                  activeOpacity={0.8}
                >
                  <Bus size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnPrimaryText}>Board Here</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => planToHere(selectedStop.name)}
                  activeOpacity={0.8}
                >
                  <ArrowRight size={14} color={PRIMARY} style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnSecondaryText}>Go Here</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnNav}
                  onPress={() => openNavigation(selectedStop)}
                  activeOpacity={0.8}
                >
                  <Navigation size={14} color="#059669" style={{ marginRight: 5 }} />
                  <Text style={styles.actionBtnNavText}>Maps</Text>
                </TouchableOpacity>
              </View>

              {/* LIVE DEPARTURES BOARD TABLE */}
              <View style={styles.departuresSection}>
                <View style={styles.departuresHeaderRow}>
                  <Clock size={14} color={PRIMARY} style={{ marginRight: 6 }} />
                  <Text style={styles.departuresHeaderTitle}>Live Station Departures</Text>
                </View>

                <ScrollView
                  style={styles.departuresScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedStopDepartures.length > 0 ? (
                    selectedStopDepartures.map((dep, idx) => (
                      <View key={idx} style={styles.departureItemRow}>
                        <View style={styles.depRouteCol}>
                          <Text style={styles.depRouteNumber}>{dep.route}</Text>
                        </View>

                        <View style={styles.depDestCol}>
                          <Text style={styles.depDestText} numberOfLines={1}>
                            ➔ {dep.destination}
                          </Text>
                          <Text style={styles.depTimeText}>{dep.departureTime}</Text>
                        </View>

                        <View style={styles.depEtaCol}>
                          <Text style={styles.depEtaText}>
                            {dep.diffMins === 0 ? 'NOW' : `${dep.diffMins}m`}
                          </Text>
                          <View style={styles.liveGreenDot} />
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noDeparturesBox}>
                      <Text style={styles.noDeparturesText}>
                        No further departures scheduled today. Check morning services tomorrow.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* STATION AMENITIES & FACILITIES */}
              {selectedStop.facilities && selectedStop.facilities.length > 0 ? (
                <View style={styles.modalFacilitiesBox}>
                  <Text style={styles.modalFacilitiesTitle}>SHELTER FACILITIES</Text>
                  <View style={styles.modalFacilitiesRow}>
                    {selectedStop.facilities.map((fac, idx) => (
                      <View key={idx} style={styles.modalFacilityChip}>
                        <CheckCircle2 size={11} color={LIVE_GREEN} style={{ marginRight: 4 }} />
                        <Text style={styles.modalFacilityText}>{fac}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* NEARBY SHELTERS & WALKING DISTANCES */}
              <View style={styles.modalNearbyBox}>
                <Text style={styles.modalFacilitiesTitle}>NEARBY STATIONS & WALKING DISTANCES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalNearbyRow}>
                  {getNearbyStations(selectedStop.name, 3.0).slice(0, 5).map((ns, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.modalNearbyChip}
                      onPress={() => setSelectedStop(ns.stop)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={11} color={PRIMARY} />
                      <Text style={styles.modalNearbyName}>{ns.stop.shortName}</Text>
                      <Text style={styles.modalNearbyDist}>
                        ({ns.routeTimeMins ? `${ns.routeTimeMins}m on route` : `${ns.distanceFormatted} · ~${ns.walkingMins}m`})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
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
  flatList: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: BG_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#344054',
    fontVariant: ['tabular-nums'],
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 3,
    marginBottom: 14,
  },
  searchBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchBarFocused: {
    borderColor: PRIMARY,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FONT.medium,
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  filterRow: {
    marginTop: 2,
    marginBottom: 4,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  filterTab: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  filterTabActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: PRIMARY,
  },
  filterTabText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  filterTabTextActive: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: PRIMARY,
  },

  /* STATION DIRECTORY ITEMS */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
    gap: 12,
  },
  stationCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    padding: 16,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stationNameText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  stationCodeBadge: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#344054',
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  stationHindiText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  stationLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationSymbol: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginRight: 5,
  },
  stationLocationText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    flex: 1,
  },

  /* NEXT BUS CLEAN TYPOGRAPHY (NO LOUD GREEN CONTAINER) */
  nextBusSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  nextBusPreLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nextBusDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextBusRouteTime: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  nextBusEtaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextBusEtaText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LIVE_GREEN,
  },

  /* ROUTE NUMBERS & CTA FOOTER */
  stationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  routesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeNumberText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#344054',
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  routesMoreText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  liveBoardLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBoardText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D0D5DD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    height: 40,
    borderRadius: 10,
  },
  actionBtnPrimaryText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
    height: 40,
    borderRadius: 10,
  },
  actionBtnSecondaryText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  actionBtnNav: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    height: 40,
    borderRadius: 10,
  },
  actionBtnNavText: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#059669',
  },
  departuresSection: {
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 14,
  },
  departuresHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  departuresHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  departuresScroll: {
    maxHeight: 220,
  },
  departureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  depRouteCol: {
    width: 60,
  },
  depRouteNumber: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  depDestCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  depDestText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  depTimeText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    fontWeight: '400',
    color: TEXT_SECONDARY,
    marginTop: 1,
  },
  depEtaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  depEtaText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  noDeparturesBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noDeparturesText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  modalFacilitiesBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  modalFacilitiesTitle: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modalFacilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalFacilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalFacilityText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#344054',
  },
  modalNearbyBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  modalNearbyRow: {
    gap: 8,
  },
  modalNearbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  modalNearbyName: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: PRIMARY,
  },
  modalNearbyDist: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: TEXT_SECONDARY,
  },
});
