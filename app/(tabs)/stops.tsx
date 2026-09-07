import React, { useState, useMemo } from 'react';
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
  Share,
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
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
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

export default function AllStopsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'hub' | 'hospital' | 'campus' | 'feeder' | 'corridor'>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const nowMins = getCurrentMinutesOfDay();

  // Categorize stops
  const getStopCategory = (stop: Stop): { label: string; color: string; bg: string; border: string } => {
    const nameLower = stop.name.toLowerCase();
    const lmarkLower = stop.landmark.toLowerCase();

    if (stop.interchange || stop.id === 'NBK' || stop.id === 'CBD' || stop.id === 'RRS' || stop.id === 'TEL') {
      return { label: 'Transfer Hub', color: '#18258F', bg: '#EFF6FF', border: '#BFDBFE' };
    }
    if (nameLower.includes('hospital') || lmarkLower.includes('hospital') || stop.id === 'BMC') {
      return { label: 'Hospital', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' };
    }
    if (nameLower.includes('iim') || nameLower.includes('iiit') || nameLower.includes('iit') || nameLower.includes('college') || nameLower.includes('university') || nameLower.includes('hnlu')) {
      return { label: 'Campus', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' };
    }
    if (stop.corridor.includes('Feeder') || nameLower.includes('gate') || nameLower.includes('block')) {
      return { label: 'Feeder Loop', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' };
    }
    return { label: 'Corridor 1', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' };
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

      const cat = getStopCategory(s);
      if (filter === 'hub') return cat.label === 'Transfer Hub';
      if (filter === 'hospital') return cat.label === 'Hospital';
      if (filter === 'campus') return cat.label === 'Campus';
      if (filter === 'feeder') return cat.label === 'Feeder Loop';
      if (filter === 'corridor') return s.corridor === 'Corridor 1';
      return true;
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Stations & Shelters</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{stops.length} Shelters</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Live departure boards & directions for all Tatpar BRTS bus shelters
        </Text>

        {/* 2. SEARCH BAR */}
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={16} color={isFocused ? '#18258F' : '#6B7280'} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
            placeholder="Search shelter, hospital, campus, landmark..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 3. QUICK CATEGORY FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({stops.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'hub' && styles.filterChipActive]}
            onPress={() => setFilter('hub')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'hub' && styles.filterTextActive]}>
              ⚡ Interchange Hubs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'hospital' && styles.filterChipActive]}
            onPress={() => setFilter('hospital')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'hospital' && styles.filterTextActive]}>
              🏥 Hospitals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'campus' && styles.filterChipActive]}
            onPress={() => setFilter('campus')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'campus' && styles.filterTextActive]}>
              🎓 Universities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'feeder' && styles.filterChipActive]}
            onPress={() => setFilter('feeder')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'feeder' && styles.filterTextActive]}>
              Feeder Loops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'corridor' && styles.filterChipActive]}
            onPress={() => setFilter('corridor')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'corridor' && styles.filterTextActive]}>
              Trunk Corridor 1
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. STATION CARDS LIST */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const category = getStopCategory(item);
          const nextDepartures = getStationDepartures(item.name, nowMins);
          const nextBus = nextDepartures.length > 0 ? nextDepartures[0] : null;
          const routes = getRoutesServingStation(item.name);

          return (
            <TouchableOpacity
              style={styles.stopCard}
              onPress={() => setSelectedStop(item)}
              activeOpacity={0.8}
            >
              {/* TOP HEADER ROW: STATION NAME & CODE */}
              <View style={styles.stopTopRow}>
                <View style={styles.stopNameBlock}>
                  <Text style={styles.stopNameText} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.hindiNameText}>{item.hindiName}</Text>
                </View>
                <View style={styles.badgeCode}>
                  <Text style={styles.badgeCodeText}>{item.code}</Text>
                </View>
              </View>

              {/* LANDMARK & CATEGORY */}
              <View style={styles.landmarkRow}>
                <MapPin size={12.5} color="#6B7280" style={{ marginRight: 5, marginTop: 1 }} />
                <Text style={styles.landmarkText} numberOfLines={1}>
                  {item.landmark}
                </Text>
              </View>

              {/* LIVE NEXT BUS INDICATOR ROW */}
              {nextBus ? (
                <View style={styles.nextBusStrip}>
                  <View style={styles.nextBusPulseDot} />
                  <Text style={styles.nextBusLabel}>Next bus:</Text>
                  <Text style={styles.nextBusRoute}>{nextBus.route}</Text>
                  <Text style={styles.nextBusTime}>({nextBus.departureTime})</Text>
                  <View style={styles.nextBusDiffBadge}>
                    <Text style={styles.nextBusDiffText}>
                      {nextBus.diffMins === 0 ? 'NOW' : `in ${nextBus.diffMins}m`}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* FOOTER: CONNECTING ROUTES & TAP CTA */}
              <View style={styles.cardFooterRow}>
                <View style={styles.routesPillsContainer}>
                  <Text style={styles.routesLabel}>Routes:</Text>
                  {routes.slice(0, 4).map(r => (
                    <View key={r} style={styles.routeMiniPill}>
                      <Text style={styles.routeMiniPillText}>{r}</Text>
                    </View>
                  ))}
                  {routes.length > 4 ? (
                    <Text style={styles.routesMoreText}>+{routes.length - 4}</Text>
                  ) : null}
                </View>

                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>Live Board</Text>
                  <ChevronRight size={13} color="#18258F" />
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
                    <View style={styles.modalCodeBadge}>
                      <Text style={styles.modalCodeText}>{selectedStop.code}</Text>
                    </View>
                  </View>
                  <Text style={styles.modalHindiText}>{selectedStop.hindiName}</Text>
                  <View style={styles.modalLandmarkRow}>
                    <MapPin size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.modalLandmarkText}>{selectedStop.landmark}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedStop(null)}
                >
                  <X size={18} color="#374151" />
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
                  <ArrowRight size={14} color="#18258F" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnSecondaryText}>Go Here</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnNav}
                  onPress={() => openNavigation(selectedStop)}
                  activeOpacity={0.8}
                >
                  <Navigation size={14} color="#047857" style={{ marginRight: 5 }} />
                  <Text style={styles.actionBtnNavText}>Maps</Text>
                </TouchableOpacity>
              </View>

              {/* LIVE DEPARTURES BOARD TABLE */}
              <View style={styles.departuresSection}>
                <View style={styles.departuresHeaderRow}>
                  <Clock size={13} color="#18258F" style={{ marginRight: 5 }} />
                  <Text style={styles.departuresHeaderTitle}>Live Station Departures</Text>
                  <View style={styles.liveSyncBadge}>
                    <Text style={styles.liveSyncText}>UPDATED</Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.departuresScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedStopDepartures.length > 0 ? (
                    selectedStopDepartures.map((dep, idx) => (
                      <View key={idx} style={styles.departureItemRow}>
                        <View style={styles.depRouteCol}>
                          <View
                            style={[
                              styles.depRoutePill,
                              dep.routeType === 'feeder' && styles.depRoutePillFeeder,
                            ]}
                          >
                            <Text
                              style={[
                                styles.depRoutePillText,
                                dep.routeType === 'feeder' && styles.depRoutePillFeederText,
                              ]}
                            >
                              {dep.route}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.depDestCol}>
                          <Text style={styles.depDestText} numberOfLines={1}>
                            ➔ {dep.destination}
                          </Text>
                          <Text style={styles.depTimeText}>{dep.departureTime}</Text>
                        </View>

                        <View style={styles.depEtaCol}>
                          <View
                            style={[
                              styles.etaBadge,
                              dep.diffMins <= 5 && styles.etaBadgeUrgent,
                            ]}
                          >
                            <Text
                              style={[
                                styles.etaBadgeText,
                                dep.diffMins <= 5 && styles.etaBadgeUrgentText,
                              ]}
                            >
                              {dep.diffMins === 0 ? 'NOW' : `${dep.diffMins}m`}
                            </Text>
                          </View>
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
              <View style={styles.modalFacilitiesBox}>
                <Text style={styles.modalFacilitiesTitle}>SHELTER FACILITIES</Text>
                <View style={styles.modalFacilitiesRow}>
                  {selectedStop.facilities.map((fac, idx) => (
                    <View key={idx} style={styles.modalFacilityChip}>
                      <CheckCircle2 size={11} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={styles.modalFacilityText}>{fac}</Text>
                    </View>
                  ))}
                </View>
              </View>

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
                      <MapPin size={11} color="#18258F" />
                      <Text style={styles.modalNearbyName}>{ns.stop.shortName}</Text>
                      <Text style={styles.modalNearbyDist}>({ns.distanceFormatted} · ~{ns.walkingMins}m)</Text>
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
    backgroundColor: '#F8F9FC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.5,
  },
  totalBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#18258F',
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  searchBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchBarFocused: {
    borderColor: '#18258F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: '#10131A',
    fontWeight: '500',
  },
  filterScroll: {
    marginHorizontal: -16,
    marginBottom: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#E9ECFF',
    borderColor: '#18258F',
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* STATION CARDS */
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  stopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  stopTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stopNameBlock: {
    flex: 1,
    marginRight: 10,
  },
  stopNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10131A',
    letterSpacing: -0.2,
  },
  hindiNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  badgeCode: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 7.5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: 0.4,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  landmarkText: {
    fontSize: 12.5,
    color: '#4B5563',
    flex: 1,
  },
  nextBusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  nextBusPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  nextBusLabel: {
    fontSize: 11.5,
    color: '#166534',
    fontWeight: '600',
  },
  nextBusRoute: {
    fontSize: 11.5,
    color: '#14532D',
    fontWeight: '700',
  },
  nextBusTime: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  nextBusDiffBadge: {
    marginLeft: 'auto',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  nextBusDiffText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  routesPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routesLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 2,
  },
  routeMiniPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeMiniPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  routesMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 2,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18258F',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingBottom: 32,
    paddingTop: 10,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10131A',
    letterSpacing: -0.3,
  },
  modalCodeBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18258F',
  },
  modalHindiText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  modalLandmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modalLandmarkText: {
    fontSize: 12.5,
    color: '#4B5563',
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionBtnPrimary: {
    flex: 1.3,
    height: 42,
    backgroundColor: '#18258F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1.1,
    height: 42,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  actionBtnSecondaryText: {
    color: '#18258F',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnNav: {
    height: 42,
    paddingHorizontal: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnNavText: {
    color: '#047857',
    fontSize: 12.5,
    fontWeight: '700',
  },
  departuresSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  departuresHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  departuresHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18258F',
    flex: 1,
  },
  liveSyncBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  liveSyncText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  departuresScroll: {
    maxHeight: 180,
  },
  departureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  depRouteCol: {
    width: 95,
  },
  depRoutePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  depRoutePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#18258F',
  },
  depRoutePillFeeder: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  depRoutePillFeederText: {
    color: '#047857',
  },
  depDestCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  depDestText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  depTimeText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  depEtaCol: {
    alignItems: 'flex-end',
  },
  etaBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  etaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18258F',
  },
  etaBadgeUrgent: {
    backgroundColor: '#FEF2F2',
  },
  etaBadgeUrgentText: {
    color: '#DC2626',
  },
  noDeparturesBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  noDeparturesText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalFacilitiesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
  },
  modalFacilitiesTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalFacilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalFacilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalFacilityText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  modalNearbyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  modalNearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalNearbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalNearbyName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalNearbyDist: {
    fontSize: 10.5,
    color: '#64748B',
  },
});
