import React, { useState, useMemo, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Bus, ArrowRight, ArrowLeftRight } from 'lucide-react-native';
import { schedules } from '../../src/services/tracker';
import { Trip } from '../../src/types';
import { FONT } from '../../src/theme/typography';

export default function TimetableScreen() {
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>('weekday');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'trunk' | 'feeder'>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

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

  const availableRoutes = useMemo(() => {
    const list = schedules
      .filter(s => {
        if (s.serviceDay !== dayType) return false;
        if (s.direction !== direction) return false;
        if (serviceFilter !== 'all' && (s.routeType || 'trunk') !== serviceFilter) return false;
        return true;
      })
      .map(s => s.route);
    return ['all', ...Array.from(new Set(list))];
  }, [dayType, direction, serviceFilter]);

  const filteredTrips = useMemo(() => {
    return schedules.filter(s => {
      if (s.serviceDay !== dayType) return false;
      if (s.direction !== direction) return false;
      if (serviceFilter !== 'all' && (s.routeType || 'trunk') !== serviceFilter) return false;
      if (selectedRoute !== 'all' && s.route !== selectedRoute) return false;
      return true;
    });
  }, [dayType, direction, serviceFilter, selectedRoute]);

  const toggleExpand = (id: string) => {
    setExpandedTripId(prev => (prev === id ? null : id));
  };

  const currentRouteName =
    direction === 'up' ? 'HNLU → Railway Station' : 'Railway Stn → HNLU / Loop';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER & TOP CONTROLS */}
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>Tatpar BRTS · Nava Raipur</Text>

        {/* 1. WEEKDAY / WEEKEND QUIET SEGMENTED CONTROL */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, dayType === 'weekday' && styles.tabToggleBtnActive]}
            onPress={() => setDayType('weekday')}
            activeOpacity={0.7}
          >
            <Calendar size={13} color={dayType === 'weekday' ? '#18258F' : '#6B7280'} />
            <Text style={[styles.tabToggleText, dayType === 'weekday' && styles.tabToggleTextActive]}>
              Weekdays
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabToggleBtn, dayType === 'weekend' && styles.tabToggleBtnActive]}
            onPress={() => setDayType('weekend')}
            activeOpacity={0.7}
          >
            <Calendar size={13} color={dayType === 'weekend' ? '#18258F' : '#6B7280'} />
            <Text style={[styles.tabToggleText, dayType === 'weekend' && styles.tabToggleTextActive]}>
              Weekends
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. NETWORK FILTER: ALL / TRUNK / FEEDER */}
        <View style={styles.networkToggleRow}>
          <TouchableOpacity
            style={[styles.networkToggleBtn, serviceFilter === 'all' && styles.networkToggleBtnActive]}
            onPress={() => { setServiceFilter('all'); setSelectedRoute('all'); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.networkToggleText, serviceFilter === 'all' && styles.networkToggleTextActive]}>
              All Services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.networkToggleBtn, serviceFilter === 'trunk' && styles.networkToggleBtnActive]}
            onPress={() => { setServiceFilter('trunk'); setSelectedRoute('all'); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.networkToggleText, serviceFilter === 'trunk' && styles.networkToggleTextActive]}>
              Trunk Express
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.networkToggleBtn, serviceFilter === 'feeder' && styles.networkToggleBtnActive]}
            onPress={() => { setServiceFilter('feeder'); setSelectedRoute('all'); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.networkToggleText, serviceFilter === 'feeder' && styles.networkToggleTextActive]}>
              Feeder & Last-Mile
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. PRIMARY DIRECTION SELECTOR */}
        <TouchableOpacity
          style={styles.primaryDirectionBar}
          onPress={toggleDirection}
          activeOpacity={0.8}
        >
          <Text style={styles.directionBarText} numberOfLines={1}>
            {currentRouteName}
          </Text>
          <View style={styles.swapIconPill}>
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <ArrowLeftRight size={13} color="#18258F" />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* 3. ROUTE FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.routeFilterScroll}
          contentContainerStyle={styles.routeFilterContent}
        >
          {availableRoutes.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.routePill, selectedRoute === r && styles.routePillActive]}
              onPress={() => setSelectedRoute(r)}
              activeOpacity={0.7}
            >
              <Text style={[styles.routePillText, selectedRoute === r && styles.routePillTextActive]}>
                {r === 'all' ? 'All Routes' : r}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TIMETABLE LIST */}
      <FlatList
        data={filteredTrips}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isExpanded = expandedTripId === item.id;
          const duration =
            item.arrivalMins >= item.departureMins
              ? item.arrivalMins - item.departureMins
              : item.arrivalMins + 1440 - item.departureMins;

          return (
            <TouchableOpacity
              style={styles.tripCard}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.8}
            >
              {/* TOP BADGE & DURATION ROW */}
              <View style={styles.tripTopRow}>
                <View style={[styles.badge, item.routeType === 'feeder' && styles.feederBadge]}>
                  <Bus size={12} color={item.routeType === 'feeder' ? '#059669' : '#18258F'} style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, item.routeType === 'feeder' && styles.feederBadgeText]}>{item.route}</Text>
                </View>
                {item.routeType === 'feeder' ? (
                  <View style={styles.feederTag}>
                    <Text style={styles.feederTagText}>Last-Mile Feeder</Text>
                  </View>
                ) : null}
                <Text style={styles.durationText}>{duration} min</Text>
              </View>

              {/* MAIN HERO TIME & STATIONS ROW */}
              <View style={styles.tripMainRow}>
                {/* DEPARTURE */}
                <View style={styles.stopCol}>
                  <Text style={styles.timeBold}>{item.departureTime}</Text>
                  <Text style={styles.stopLabel} numberOfLines={1}>{item.origin}</Text>
                </View>

                {/* CENTER ARROW & STOPS COUNT */}
                <View style={styles.arrowCol}>
                  <ArrowRight size={15} color="#18258F" />
                  <Text style={styles.stopsCount}>{item.stops.length} stops</Text>
                </View>

                {/* ARRIVAL */}
                <View style={[styles.stopCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.timeBold}>{item.arrivalTime}</Text>
                  <Text style={styles.stopLabel} numberOfLines={1}>{item.destination}</Text>
                </View>
              </View>

              {/* EXPANDED STOP DETAILS — EDITORIAL TIMELINE */}
              {isExpanded ? (
                <View style={styles.expandedDetails}>
                  <View style={styles.expandedHeaderDivider} />
                  <Text style={styles.expandedTitle}>ROUTE TIMELINE</Text>

                  <View style={styles.timelineContainer}>
                    {item.stops.map((st, sIdx) => {
                      const isFirst = sIdx === 0;
                      const isLast = sIdx === item.stops.length - 1;

                      return (
                        <View key={sIdx} style={styles.timelineItemRow}>
                          {/* SPINE COLUMN */}
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

                          {/* STOP NAME & TIME */}
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
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
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
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.08)',
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
    marginBottom: 12,
  },

  /* 1. QUIET SEGMENTED WEEKDAY TOGGLE */
  tabToggleRow: {
    height: 38,
    flexDirection: 'row',
    backgroundColor: '#F1F3FA',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDE2F0',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  tabToggleText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  tabToggleTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },
  networkToggleRow: {
    height: 34,
    flexDirection: 'row',
    backgroundColor: '#F1F3FA',
    borderRadius: 10,
    padding: 2.5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDE2F0',
  },
  networkToggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  networkToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  networkToggleText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  networkToggleTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* 2. PRIMARY ROUTE SELECTOR — SINGLE CLEAN CONTROL */
  primaryDirectionBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.10)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  directionBarText: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 15.5, // Route name: 15–16 px / 700
    lineHeight: 22,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.1,
  },
  swapIconPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 3. ROUTE FILTER CHIPS */
  routeFilterScroll: {
    marginHorizontal: -16,
  },
  routeFilterContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  routePill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePillActive: {
    backgroundColor: '#E9ECFF',
    borderColor: '#18258F',
  },
  routePillText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  routePillTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* TIMETABLE LIST & CARDS */
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tripTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.3,
  },
  feederBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  feederBadgeText: {
    color: '#047857',
  },
  feederTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  feederTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  durationText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  tripMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopCol: {
    flex: 1,
    minWidth: 0,
  },
  timeBold: {
    fontFamily: FONT.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.3,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
  stopLabel: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  arrowCol: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopsCount: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },

  /* EXPANDED EDITORIAL TIMELINE */
  expandedDetails: {
    marginTop: 14,
    paddingTop: 10,
  },
  expandedHeaderDivider: {
    height: 1,
    backgroundColor: 'rgba(24, 37, 143, 0.08)',
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 32,
  },
  spineCol: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'stretch',
    marginRight: 10,
  },
  spineLine: {
    position: 'absolute',
    top: 7,
    bottom: -7,
    width: 1.5,
    backgroundColor: 'rgba(24, 37, 143, 0.12)',
  },
  spineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    marginTop: 5,
    zIndex: 2,
  },
  spineDotOrigin: {
    backgroundColor: '#18258F',
    borderColor: '#18258F',
  },
  spineDotDest: {
    backgroundColor: '#F26B52',
    borderColor: '#F26B52',
  },
  stopInfoCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  stopNameText: {
    fontSize: 13,
    color: '#10131A',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  stopNameBold: {
    color: '#18258F',
    fontWeight: '700',
  },
  stopTimeText: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  stopTimeBold: {
    color: '#18258F',
    fontWeight: '700',
  },
});

