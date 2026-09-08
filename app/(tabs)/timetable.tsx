import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Bus,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { schedules, getCurrentMinutesOfDay } from '../../src/services/tracker';
import { Trip } from '../../src/types';
import { FONT } from '../../src/theme/typography';

// DESIGN SYSTEM TOKENS (UNIFIED WITH HOME / BUS TRACK)
const PRIMARY = '#18258F';
const PRIMARY_LIGHT = 'rgba(24, 37, 143, 0.08)';
const BG_COLOR = '#F7F7F4';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#0B132B';
const TEXT_SECONDARY = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER_COLOR = '#EDF2F7';
const BORDER_SUBTLE = '#EDF2F7';

export default function TimetableScreen() {
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>('weekday');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    if (expandedTripId) {
      setExpandedTripId(null);
      return true;
    }
    return false;
  }, [expandedTripId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__handleActiveScreenBack = handleBack;
      if ((window as any).ReactNativeWebView?.postMessage) {
        try {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'CAN_GO_BACK', canGoBack: !!expandedTripId })
          );
        } catch (e) {}
      }
    }
  }, [handleBack, expandedTripId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleBack();
    });
    return () => sub.remove();
  }, [handleBack]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && (window as any).__handleActiveScreenBack === handleBack) {
        (window as any).__handleActiveScreenBack = null;
      }
    };
  }, [handleBack]);

  const swapSpinAnim = useRef(new Animated.Value(0)).current;

  const spinInterpolate = swapSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleDirection = () => {
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
    setDirection(prev => (prev === 'up' ? 'down' : 'up'));
  };

  // Extract all available routes in the selected day & direction
  const availableRoutes = useMemo(() => {
    const list = schedules
      .filter(s => s.serviceDay === dayType && s.direction === direction)
      .map(s => s.route);
    return ['all', ...Array.from(new Set(list))];
  }, [dayType, direction]);

  // Filtered trips sorted by departure minutes
  const filteredTrips = useMemo(() => {
    const trips = schedules.filter(s => {
      if (s.serviceDay !== dayType) return false;
      if (s.direction !== direction) return false;
      if (selectedRoute !== 'all' && s.route !== selectedRoute) return false;
      return true;
    });
    return trips.sort((a, b) => a.departureMins - b.departureMins);
  }, [dayType, direction, selectedRoute]);

  // Compute Next Departure based on current real time
  const nowMins = getCurrentMinutesOfDay();
  const isActualWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const isViewingCurrentDay =
    (isActualWeekend && dayType === 'weekend') || (!isActualWeekend && dayType === 'weekday');

  const { nextTrip, upcomingDiff, regularTrips } = useMemo(() => {
    if (!isViewingCurrentDay || filteredTrips.length === 0) {
      return { nextTrip: null, upcomingDiff: null, regularTrips: filteredTrips };
    }

    const nextIndex = filteredTrips.findIndex(t => t.departureMins >= nowMins);
    if (nextIndex !== -1) {
      const next = filteredTrips[nextIndex];
      const diff = next.departureMins - nowMins;
      const rest = filteredTrips.filter((_, idx) => idx !== nextIndex);
      return { nextTrip: next, upcomingDiff: diff, regularTrips: rest };
    }

    // Past all trips today
    return { nextTrip: null, upcomingDiff: null, regularTrips: filteredTrips };
  }, [filteredTrips, isViewingCurrentDay, nowMins]);

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => (prev === id ? null : id));
  };

  const originStation = direction === 'up' ? 'HNLU' : 'Railway Station';
  const destStation = direction === 'up' ? 'Railway Station' : 'HNLU / Loop';

  // Render expanded stops timeline for a trip
  const renderStopsTimeline = (item: Trip) => (
    <View style={styles.expandedDetails}>
      <View style={styles.expandedHeaderDivider} />
      <Text style={styles.expandedTitle}>ROUTE TIMELINE ({item.stops.length} STOPS)</Text>

      <View style={styles.timelineContainer}>
        {item.stops.map((st, sIdx) => {
          const isFirst = sIdx === 0;
          const isLast = sIdx === item.stops.length - 1;

          return (
            <View key={sIdx} style={styles.timelineItemRow}>
              <View style={styles.spineCol}>
                {!isLast && <View style={styles.spineLine} />}
                <View
                  style={[
                    styles.spineDot,
                    isFirst && styles.spineDotOrigin,
                    isLast && styles.spineDotDest,
                  ]}
                />
              </View>

              <View style={styles.stopInfoCol}>
                <Text
                  style={[
                    styles.stopNameText,
                    (isFirst || isLast) && styles.stopNameBold,
                  ]}
                  numberOfLines={1}
                >
                  {st.stop}
                </Text>
                <Text
                  style={[
                    styles.stopTimeText,
                    (isFirst || isLast) && styles.stopTimeBold,
                  ]}
                >
                  {st.time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. CLEAN HEADER & ESSENTIAL TOP CONTROLS */}
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>Tatpar BRTS · Nava Raipur</Text>

        {/* QUIET SEGMENTED CONTROL: WEEKDAYS / WEEKENDS */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, dayType === 'weekday' && styles.tabToggleBtnActive]}
            onPress={() => setDayType('weekday')}
            activeOpacity={0.7}
          >
            <Calendar
              size={14}
              color={dayType === 'weekday' ? PRIMARY : TEXT_SECONDARY}
            />
            <Text
              style={[
                styles.tabToggleText,
                dayType === 'weekday' && styles.tabToggleTextActive,
              ]}
            >
              Weekdays
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabToggleBtn, dayType === 'weekend' && styles.tabToggleBtnActive]}
            onPress={() => setDayType('weekend')}
            activeOpacity={0.7}
          >
            <Calendar
              size={14}
              color={dayType === 'weekend' ? PRIMARY : TEXT_SECONDARY}
            />
            <Text
              style={[
                styles.tabToggleText,
                dayType === 'weekend' && styles.tabToggleTextActive,
              ]}
            >
              Weekends
            </Text>
          </TouchableOpacity>
        </View>

        {/* HERO ROUTE SELECTOR COMPONENT */}
        <TouchableOpacity
          style={styles.heroRouteSelector}
          onPress={toggleDirection}
          activeOpacity={0.88}
        >
          <View style={styles.heroRouteInfoCol}>
            <View style={styles.heroRoutePointsRow}>
              <View style={styles.originIndicatorDot} />
              <Text style={styles.heroRouteStationName} numberOfLines={1}>
                {originStation}
              </Text>
              <ArrowRight size={14} color={TEXT_MUTED} style={{ marginHorizontal: 6 }} />
              <View style={styles.destIndicatorDot} />
              <Text style={styles.heroRouteStationName} numberOfLines={1}>
                {destStation}
              </Text>
            </View>
            <Text style={styles.heroRouteCorridorSub}>Nava Raipur BRTS Corridor</Text>
          </View>
          <View style={styles.heroRouteSwapBtn}>
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <ArrowLeftRight size={15} color={PRIMARY} strokeWidth={2.2} />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* ROUTE FILTER CHIPS */}
        <View style={styles.routesFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesFilterContent}
          >
            {availableRoutes.map(r => {
              const isSelected = selectedRoute === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.routeChip, isSelected && styles.routeChipActive]}
                  onPress={() => setSelectedRoute(r)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.routeChipText,
                      isSelected && styles.routeChipTextActive,
                    ]}
                  >
                    {r === 'all' ? 'All' : r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* 2. TIMETABLE CONTENT */}
      <FlatList
        data={regularTrips}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* HERO NEXT DEPARTURE CARD (WHEN AVAILABLE) */}
            {nextTrip && (
              <View style={styles.nextDepContainer}>
                <TouchableOpacity
                  style={styles.nextDepCard}
                  onPress={() => toggleExpand(nextTrip.id)}
                  activeOpacity={0.9}
                >
                  {/* TOP ROW: NEXT DEPARTURE BADGE + COUNTDOWN */}
                  <View style={styles.nextDepTopRow}>
                    <View style={styles.nextDepBadge}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.nextDepBadgeText}>NEXT DEPARTURE</Text>
                    </View>
                    <View style={styles.nextDepCountdownWrap}>
                      <Clock size={11} color={PRIMARY} strokeWidth={2} />
                      <Text style={styles.nextDepCountdownText}>
                        {upcomingDiff === 0
                          ? 'Departs NOW'
                          : upcomingDiff !== null && upcomingDiff < 60
                          ? `Departs in ${upcomingDiff} min`
                          : `Departs in ${Math.floor((upcomingDiff || 0) / 60)}h ${(upcomingDiff || 0) % 60}m`}
                      </Text>
                    </View>
                  </View>

                  {/* MAIN TIME & CORRIDOR ROW */}
                  <View style={styles.nextDepTimesRow}>
                    <View style={styles.nextDepStopCol}>
                      <Text style={styles.nextDepTimeHero}>{nextTrip.departureTime}</Text>
                      <Text style={styles.nextDepStopLabel} numberOfLines={1}>
                        {nextTrip.origin}
                      </Text>
                    </View>

                    <View style={styles.nextDepArrowCol}>
                      <ArrowRight size={16} color={PRIMARY} strokeWidth={2.4} />
                      <Text style={styles.nextDepStopsLabel}>
                        {nextTrip.stops.length} stops
                      </Text>
                    </View>

                    <View style={[styles.nextDepStopCol, { alignItems: 'flex-end' }]}>
                      <Text style={styles.nextDepTimeHero}>{nextTrip.arrivalTime}</Text>
                      <Text style={styles.nextDepStopLabel} numberOfLines={1}>
                        {nextTrip.destination}
                      </Text>
                    </View>
                  </View>

                  {/* BOTTOM META ROW */}
                  <View style={styles.nextDepBottomRow}>
                    <View style={styles.nextDepMetaLeft}>
                      <Bus size={12} color={PRIMARY} strokeWidth={2.2} />
                      <Text style={styles.nextDepRouteText}>{nextTrip.route}</Text>
                      <Text style={styles.nextDepDotSep}>·</Text>
                      <Text style={styles.nextDepMetaText}>
                        {nextTrip.stops.length} stops
                      </Text>
                      <Text style={styles.nextDepDotSep}>·</Text>
                      <Text style={styles.nextDepMetaText}>
                        {nextTrip.arrivalMins >= nextTrip.departureMins
                          ? nextTrip.arrivalMins - nextTrip.departureMins
                          : nextTrip.arrivalMins + 1440 - nextTrip.departureMins}{' '}
                        min
                      </Text>
                    </View>

                    <View style={styles.viewStopsToggle}>
                      <Text style={styles.viewStopsToggleText}>
                        {expandedTripId === nextTrip.id ? 'Hide stops' : 'View stops'}
                      </Text>
                      {expandedTripId === nextTrip.id ? (
                        <ChevronUp size={13} color={PRIMARY} />
                      ) : (
                        <ChevronDown size={13} color={PRIMARY} />
                      )}
                    </View>
                  </View>

                  {/* EXPANDED STOPS TIMELINE */}
                  {expandedTripId === nextTrip.id && renderStopsTimeline(nextTrip)}
                </TouchableOpacity>
              </View>
            )}

            {/* SECTION HEADER FOR SUBSEQUENT DEPARTURES */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                {nextTrip ? 'SUBSEQUENT DEPARTURES' : 'ALL DEPARTURES'} ({regularTrips.length})
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const isExpanded = expandedTripId === item.id;
          const isLastItem = index === regularTrips.length - 1;
          const duration =
            item.arrivalMins >= item.departureMins
              ? item.arrivalMins - item.departureMins
              : item.arrivalMins + 1440 - item.departureMins;

          return (
            <View style={styles.unifiedTableContainer}>
              <TouchableOpacity
                style={[
                  styles.departureRow,
                  isExpanded && styles.departureRowExpanded,
                  !isLastItem && styles.departureRowBorder,
                ]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                {/* TIME & STATIONS */}
                <View style={styles.rowMainTimes}>
                  <View style={styles.rowTimeCol}>
                    <Text style={styles.rowTimeBold}>{item.departureTime}</Text>
                    <Text style={styles.rowStationName} numberOfLines={1}>
                      {item.origin}
                    </Text>
                  </View>

                  <View style={styles.rowArrowCol}>
                    <ArrowRight size={13} color={TEXT_MUTED} strokeWidth={2} />
                  </View>

                  <View style={[styles.rowTimeCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.rowTimeBold}>{item.arrivalTime}</Text>
                    <Text style={styles.rowStationName} numberOfLines={1}>
                      {item.destination}
                    </Text>
                  </View>
                </View>

                {/* ROUTE + STOPS + DURATION SUBTEXT */}
                <View style={styles.rowMetaBar}>
                  <View style={styles.rowMetaLeft}>
                    <Bus size={11} color={PRIMARY} strokeWidth={2} style={{ marginRight: 4 }} />
                    <Text style={styles.rowRouteText}>{item.route}</Text>
                    <Text style={styles.rowDotSep}>·</Text>
                    <Text style={styles.rowMetaSecondary}>{item.stops.length} stops</Text>
                    <Text style={styles.rowDotSep}>·</Text>
                    <Text style={styles.rowMetaSecondary}>{duration} min</Text>
                  </View>

                  <View style={styles.rowMetaRight}>
                    <Text style={styles.rowExpandHint}>
                      {isExpanded ? 'Hide' : 'Stops'}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={12} color={TEXT_MUTED} />
                    ) : (
                      <ChevronDown size={12} color={TEXT_MUTED} />
                    )}
                  </View>
                </View>

                {/* EXPANDED STOPS TIMELINE */}
                {isExpanded && renderStopsTimeline(item)}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Bus size={32} color={TEXT_MUTED} />
            <Text style={styles.emptyStateTitle}>No scheduled departures</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try switching between Weekday / Weekend or select another route filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F7F7F4',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
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
    marginBottom: 12,
  },

  /* 1. QUIET SEGMENTED WEEKDAY TOGGLE */
  tabToggleRow: {
    height: 38,
    flexDirection: 'row',
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    gap: 6,
  },
  tabToggleBtnActive: {
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tabToggleText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  tabToggleTextActive: {
    fontFamily: FONT.bold,
    color: TEXT_PRIMARY,
    fontWeight: '700',
  },

  /* 2. HERO ROUTE SELECTOR */
  heroRouteSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  heroRouteInfoCol: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  heroRoutePointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#12B76A',
    marginRight: 6,
  },
  destIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: PRIMARY,
    marginRight: 6,
  },
  heroRouteStationName: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  heroRouteCorridorSub: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: TEXT_SECONDARY,
    marginTop: 3,
  },
  heroRouteSwapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },

  /* 3. ROUTE FILTER CHIPS */
  routesFilterContainer: {
    marginBottom: 4,
  },
  routesFilterContent: {
    paddingVertical: 2,
    gap: 8,
  },
  routeChip: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },
  routeChipActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: PRIMARY,
  },
  routeChipText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  routeChipTextActive: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: PRIMARY,
  },

  /* LIST CONTENT */
  listContent: {
    padding: 16,
    paddingBottom: 120, // Breathing space for floating bottom nav dock
  },

  /* HERO NEXT DEPARTURE CARD */
  nextDepContainer: {
    marginBottom: 16,
  },
  nextDepCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(36, 56, 184, 0.22)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 24px rgba(36, 56, 184, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
        } as any)
      : {}),
  },
  nextDepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nextDepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 6,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#12B76A',
  },
  nextDepBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 0.6,
  },
  nextDepCountdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
  },
  nextDepCountdownText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY,
    fontVariant: ['tabular-nums'],
  },
  nextDepTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  nextDepStopCol: {
    flex: 1,
    minWidth: 0,
  },
  nextDepTimeHero: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  nextDepStopLabel: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 2,
  },
  nextDepArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  nextDepStopsLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  nextDepBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  nextDepMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDepRouteText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: PRIMARY,
    marginLeft: 4,
  },
  nextDepDotSep: {
    color: TEXT_MUTED,
    marginHorizontal: 5,
    fontSize: 12,
  },
  nextDepMetaText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  viewStopsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewStopsToggleText: {
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    color: PRIMARY,
    fontWeight: '600',
  },

  /* SECTION HEADER FOR SUBSEQUENT DEPARTURES */
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* UNIFIED DEPARTURE TABLE CONTAINER */
  unifiedTableContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  departureRow: {
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  departureRowExpanded: {
    backgroundColor: '#FAFAFC',
  },
  departureRowBorder: {
    // Individual rows inside container
  },
  rowMainTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTimeCol: {
    flex: 1,
    minWidth: 0,
  },
  rowTimeBold: {
    fontFamily: FONT.bold,
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  rowStationName: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 1,
  },
  rowArrowCol: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
  },
  rowMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRouteText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  rowDotSep: {
    color: TEXT_MUTED,
    marginHorizontal: 5,
    fontSize: 11,
  },
  rowMetaSecondary: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  rowMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rowExpandHint: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: TEXT_MUTED,
  },

  /* EXPANDED STOP DETAILS — EDITORIAL TIMELINE */
  expandedDetails: {
    marginTop: 12,
    paddingTop: 10,
  },
  expandedHeaderDivider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginBottom: 10,
  },
  expandedTitle: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  timelineContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  timelineItemRow: {
    flexDirection: 'row',
    minHeight: 30,
  },
  spineCol: {
    width: 18,
    alignItems: 'center',
    position: 'relative',
  },
  spineLine: {
    position: 'absolute',
    top: 10,
    bottom: -6,
    width: 1.5,
    backgroundColor: '#E4E7EC',
    left: 8,
  },
  spineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D0D5DD',
    marginTop: 4,
  },
  spineDotOrigin: {
    backgroundColor: '#12B76A',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 3,
  },
  spineDotDest: {
    backgroundColor: PRIMARY,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 3,
  },
  stopInfoCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingBottom: 8,
  },
  stopNameText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#344054',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  stopNameBold: {
    fontFamily: FONT.bold,
    color: TEXT_PRIMARY,
    fontWeight: '700',
  },
  stopTimeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontVariant: ['tabular-nums'],
  },
  stopTimeBold: {
    fontFamily: FONT.bold,
    color: PRIMARY,
    fontWeight: '700',
  },

  /* EMPTY STATE */
  emptyStateContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
