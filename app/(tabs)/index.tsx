import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  Platform,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Compass,
  ArrowRight,
  ArrowUpRight,
  ArrowUpDown,
  Search,
  X,
  Bus,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  BellRing,
  Calendar,
  Navigation,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import {
  stops,
  popularRoutes,
  getFare,
  calculateJourney,
  getCurrentMinutesOfDay,
  formatMinutesToTime,
} from '../../src/services/tracker';
import {
  scheduleBusNotification,
  ScheduledReminder,
  getActiveReminders,
} from '../../src/services/notifications';
import { Stop, ActiveJourney, PopularRoute } from '../../src/types';

function EditorialBusIllustration({
  width = 155,
  height = 66,
  color = '#FFFFFF',
  wheelBg = '#101A72',
  accentColor = '#F26B52',
  style,
}: {
  width?: number;
  height?: number;
  color?: string;
  wheelBg?: string;
  accentColor?: string;
  style?: any;
}) {
  return (
    <View style={style}>
      <Svg width={width} height={height} viewBox="0 0 215 92" fill="none">
        {/* Subtle Hand-Drawn Motion Trails Behind the Bus */}
        <Path
          d="M 6 40 C 14 40, 18 41, 24 41"
          stroke={color}
          strokeWidth="1.6"
          opacity={0.35}
          strokeLinecap="round"
        />
        <Path
          d="M 10 50 C 18 50, 22 51, 26 51"
          stroke={color}
          strokeWidth="1.6"
          opacity={0.28}
          strokeLinecap="round"
        />

        {/* Hand-drawn Aerodynamic Roof AC/Battery Pod */}
        <Path
          d="M 52 14 C 52 10, 60 9, 74 9 L 126 9 C 140 9, 148 10, 148 14 Z"
          stroke={color}
          strokeWidth="1.8"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 32, 95, 0.04)'}
          strokeLinejoin="round"
        />
        <Path d="M 64 12 C 78 12, 122 12, 136 12" stroke={color} strokeWidth="1.1" opacity={0.6} />

        {/* Genuinely Hand-Drawn Editorial Bus Body Contour */}
        <Path
          d="M 28 68 L 26 23 C 26 17 31 14 38 14 L 176 14 C 186 14 195 20 200 32 L 206 52 C 207 58 206 68 202 68 Z"
          stroke={color}
          strokeWidth="2.2"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(23, 32, 95, 0.02)'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Slanted Driver Windshield Pane */}
        <Path
          d="M 174 19 L 196 36 L 198 50 L 174 50 Z"
          stroke={color}
          strokeWidth="1.8"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(23, 32, 95, 0.06)'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Simplified 3 Large Editorial Passenger Windows */}
        <Path
          d="M 36 19 L 76 19 L 76 50 L 36 50 Z"
          stroke={color}
          strokeWidth="1.6"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 32, 95, 0.04)'}
          strokeLinejoin="round"
        />
        <Path
          d="M 83 19 L 123 19 L 123 50 L 83 50 Z"
          stroke={color}
          strokeWidth="1.6"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 32, 95, 0.04)'}
          strokeLinejoin="round"
        />
        <Path
          d="M 130 19 L 167 19 L 167 50 L 130 50 Z"
          stroke={color}
          strokeWidth="1.6"
          fill={color === '#FFFFFF' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 32, 95, 0.04)'}
          strokeLinejoin="round"
        />

        {/* Mid-Body Artistic Speed Line */}
        <Path
          d="M 28 55 C 72 54, 150 54, 203 55"
          stroke={color}
          strokeWidth="1.3"
          opacity={0.45}
          strokeLinecap="round"
        />

        {/* Rear Wheel Arch & Hand-drawn Wheel */}
        <Path d="M 44 68 C 44 54, 76 54, 76 68" stroke={color} strokeWidth="2" fill={wheelBg} />
        <Circle cx="60" cy="68" r="11" stroke={color} strokeWidth="2.2" fill={wheelBg} />
        <Circle cx="60" cy="68" r="6" stroke={color} strokeWidth="1.3" fill="none" opacity={0.75} />
        <Circle cx="60" cy="68" r="2.2" fill={color} />

        {/* Front Wheel Arch & Hand-drawn Wheel */}
        <Path d="M 154 68 C 154 54, 186 54, 186 68" stroke={color} strokeWidth="2" fill={wheelBg} />
        <Circle cx="170" cy="68" r="11" stroke={color} strokeWidth="2.2" fill={wheelBg} />
        <Circle cx="170" cy="68" r="6" stroke={color} strokeWidth="1.3" fill="none" opacity={0.75} />
        <Circle cx="170" cy="68" r="2.2" fill={color} />

        {/* Front Headlight Pill */}
        <Rect x="204" y="52" width="3.2" height="6" rx="1.5" fill={color} opacity={0.95} />

        {/* Tail Light Accent */}
        <Rect x="25" y="50" width="2.4" height="6.5" rx="1" fill={accentColor} opacity={0.9} />
      </Svg>
    </View>
  );
}

function EditorialStopIcon({ size = 20, color = '#18258F' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bus stop sign pole */}
      <Path d="M 6 22 L 6 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Bus stop sign plate */}
      <Rect x="4" y="3" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" fill="rgba(24, 37, 143, 0.05)" />
      {/* Minimal bus silhouette inside plate */}
      <Rect x="7" y="5" width="8" height="5" rx="1" stroke={color} strokeWidth="1.2" />
      <Circle cx="8.5" cy="11.5" r="0.8" fill={color} />
      <Circle cx="13.5" cy="11.5" r="0.8" fill={color} />
    </Svg>
  );
}

export default function LiveBusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string; to?: string }>();

  // Initial state: starts empty by default so the clean Popular Routes screen is the default home screen.
  // Once the user enters stations (or taps a popular route), their chosen route is remembered as the active home screen.
  const [fromStation, setFromStation] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem('brts_saved_from_station') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  const [toStation, setToStation] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem('brts_saved_to_station') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  useEffect(() => {
    if (params.from) {
      setFromStation(params.from);
    }
    if (params.to) {
      setToStation(params.to);
    }
  }, [params.from, params.to]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (fromStation) {
          window.localStorage.setItem('brts_saved_from_station', fromStation);
        } else {
          window.localStorage.removeItem('brts_saved_from_station');
        }
      } catch (e) {}
    }
  }, [fromStation]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (toStation) {
          window.localStorage.setItem('brts_saved_to_station', toStation);
        } else {
          window.localStorage.removeItem('brts_saved_to_station');
        }
      } catch (e) {}
    }
  }, [toStation]);
  
  // Planning Mode: 'next' (Boarding next bus) vs 'onboard' (I'm on this bus / Live Route Tracker)
  const [planningMode, setPlanningMode] = useState<'next' | 'onboard'>('next');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Station search modal
  const [modalVisible, setModalVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location?.search?.includes('sheet=open')) {
      return true;
    }
    return false;
  });
  const [activePicker, setActivePicker] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location?.search?.includes('focused=1')) {
      return true;
    }
    return false;
  });

  // Notification state
  const [reminderBanner, setReminderBanner] = useState<string | null>(null);
  const [activeReminders, setActiveReminders] = useState<ScheduledReminder[]>([]);

  // Time simulation
  const [currentTimeMins, setCurrentTimeMins] = useState<number>(() => getCurrentMinutesOfDay());
  const [isLiveClock, setIsLiveClock] = useState(true);

  // Animation hooks
  const busGlideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const busFloatAnim = useRef(new Animated.Value(0)).current;
  const swapSpinAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Bus track horizontal gliding loop
    const busGlideLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busGlideAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(busGlideAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    busGlideLoop.start();

    // 2. Pulse Green Dot & Live Badge
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    // 3. Radar Wave Animation
    const radarLoop = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    radarLoop.start();

    // 4. Subtle 3D Bus Floating levitation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(busFloatAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(busFloatAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    floatLoop.start();

    return () => {
      busGlideLoop.stop();
      pulseLoop.stop();
      radarLoop.stop();
      floatLoop.stop();
    };
  }, []);

  // Auto-refresh clock in real-time
  useEffect(() => {
    if (!isLiveClock) return;
    const updateTime = () => setCurrentTimeMins(getCurrentMinutesOfDay());
    updateTime();
    const interval = setInterval(updateTime, 5000);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', updateTime);
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', updateTime);
      }
    }

    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', updateTime);
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', updateTime);
        }
      }
    };
  }, [isLiveClock]);

  // Compute active journey based on mode
  const journey: ActiveJourney | null = useMemo(() => {
    if (!fromStation || !toStation) return null;
    return calculateJourney(
      fromStation,
      toStation,
      currentTimeMins,
      planningMode === 'onboard' ? 'onboard' : 'next',
      selectedTripId || undefined
    );
  }, [fromStation, toStation, currentTimeMins, planningMode, selectedTripId]);

  // Derived next stop details for live operational dashboard
  const nextStopObj = useMemo(() => {
    if (!journey?.nextStopName) return null;
    return stops.find(s => s.name === journey.nextStopName || s.shortName === journey.nextStopName) || null;
  }, [journey?.nextStopName]);

  const nextStopIdx = useMemo(() => {
    if (!journey) return -1;
    return journey.intermediateStops.findIndex(s => s.isCurrentNext);
  }, [journey]);

  const nextStopItem = useMemo(() => {
    if (!journey || nextStopIdx < 0) return null;
    return journey.intermediateStops[nextStopIdx];
  }, [journey, nextStopIdx]);

  const followingStopItem = useMemo(() => {
    if (!journey || nextStopIdx < 0 || nextStopIdx >= journey.intermediateStops.length - 1) return null;
    return journey.intermediateStops[nextStopIdx + 1];
  }, [journey, nextStopIdx]);

  // Filter stations for modal picker
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

  const drawerSlideAnim = useRef(new Animated.Value(420)).current;

  const triggerCardBounce = () => {
    cardScaleAnim.setValue(0.95);
    Animated.spring(cardScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const spinInterpolate = swapSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
      setFromStation(station.name);
    } else {
      setToStation(station.name);
    }
    closePicker();
    triggerCardBounce();
  };

  const swapStations = () => {
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

    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    triggerCardBounce();
  };

  const selectPopularRoute = (route: PopularRoute) => {
    setFromStation(route.from);
    setToStation(route.to);
    triggerCardBounce();
  };

  const clearFrom = () => setFromStation('');
  const clearTo = () => setToStation('');

  // Handle scheduling 30 min and 15 min notifications
  const handleScheduleNotifications = async () => {
    if (!journey) return;

    try {
      const rem30 = await scheduleBusNotification({
        routeBadge: journey.routeBadge,
        fromStop: journey.fromStop.shortName,
        toStop: journey.toStop.shortName,
        departureTime: journey.fromTime,
        arrivalTime: journey.toTime,
        departureMins: journey.departureMins,
        minutesBefore: 30,
      });

      const rem15 = await scheduleBusNotification({
        routeBadge: journey.routeBadge,
        fromStop: journey.fromStop.shortName,
        toStop: journey.toStop.shortName,
        departureTime: journey.fromTime,
        arrivalTime: journey.toTime,
        departureMins: journey.departureMins,
        minutesBefore: 15,
      });

      setActiveReminders(getActiveReminders());
      const msg = `✓ Reminders set! You will be alerted at ${rem30?.triggerTime || '30m prior'} and ${rem15?.triggerTime || '15m prior'} before departure (${journey.fromTime}).`;
      setReminderBanner(msg);
    } catch (e) {
  console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* --- TOP PLANNING MODE SWITCHER (PILL SEGMENT CONTROL) --- */}
      <View style={styles.topTabBar}>
        {/* TAB 1: Bus Search */}
        <TouchableOpacity
          style={[
            styles.topTabItem,
            planningMode === 'next' && styles.topTabItemActive,
          ]}
          onPress={() => {
            setPlanningMode('next');
            setSelectedTripId(null);
            triggerCardBounce();
          }}
          activeOpacity={0.7}
        >
          <Bus
            size={15}
            color={planningMode === 'next' ? '#18258F' : '#556080'}
            strokeWidth={planningMode === 'next' ? 2 : 1.75}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.topTabLabel,
              planningMode === 'next' && styles.topTabLabelActive,
            ]}
          >
            Bus tickets
          </Text>
        </TouchableOpacity>

        {/* TAB 2: I'm Onboard */}
        <TouchableOpacity
          style={[
            styles.topTabItem,
            planningMode === 'onboard' && styles.topTabItemActive,
          ]}
          onPress={() => {
            setPlanningMode('onboard');
            setSelectedTripId(null);
            triggerCardBounce();
          }}
          activeOpacity={0.7}
        >
          <Navigation
            size={15}
            color={planningMode === 'onboard' ? '#18258F' : '#556080'}
            strokeWidth={planningMode === 'onboard' ? 2 : 1.75}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.topTabLabel,
              planningMode === 'onboard' && styles.topTabLabelActive,
            ]}
          >
            I'm onboard
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* PAGE HEADING */}
        <View style={styles.pageHeaderTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageMainHeading}>
              {planningMode === 'next'
                ? 'Bus Tickets'
                : "I'm Onboard · Live"}
            </Text>
            <Text style={styles.pageSubHeading}>
              {planningMode === 'next'
                ? 'Tatpar BRTS · Nava Raipur Express'
                : 'Real-time in-bus stop tracking & drop-off alerts'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/about' as any)}
            style={styles.infoIconButton}
            activeOpacity={0.7}
            accessibilityLabel="About and support"
          >
            <Info size={20} color="#18258F" />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATION CONFIRMATION BANNER */}
        {reminderBanner ? (
          <View style={styles.bannerContainer}>
            <BellRing size={18} color="#15803D" style={{ marginRight: 8 }} />
            <Text style={styles.bannerText}>{reminderBanner}</Text>
            <TouchableOpacity onPress={() => setReminderBanner(null)} style={{ padding: 4 }}>
              <X size={14} color="#15803D" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ========================================================================= */}
        {/*               1. BUS TICKETS — PLAN YOUR RIDE (CALM / EDITORIAL)           */}
        {/* ========================================================================= */}
        {planningMode === 'next' ? (
          <>
            {/* DOMINANT FROM / TO SELECTION CARD */}
            <View style={styles.headerCard}>
              {/* FROM ROW */}
              <View style={styles.stationRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
                <TouchableOpacity
                  style={styles.stationInputTouch}
                  onPress={() => openPicker('from')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.inputLabel}>FROM</Text>
                  <Text
                    style={[
                      styles.stationText,
                      !fromStation && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {fromStation ? stops.find(s => s.name === fromStation)?.shortName || fromStation : 'Boarding station'}
                  </Text>
                </TouchableOpacity>

                {fromStation ? (
                  <TouchableOpacity onPress={clearFrom} style={styles.clearBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={15} color="#556080" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* DIVIDER & SWAP BUTTON */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <TouchableOpacity onPress={swapStations} style={styles.swapBtn} activeOpacity={0.7}>
                  <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                    <ArrowUpDown size={13} color="#18258F" />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {/* TO ROW */}
              <View style={styles.stationRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F26B52' }]} />
                <TouchableOpacity
                  style={styles.stationInputTouch}
                  onPress={() => openPicker('to')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.inputLabel}>TO</Text>
                  <Text
                    style={[
                      styles.stationText,
                      !toStation && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {toStation ? stops.find(s => s.name === toStation)?.shortName || toStation : 'Destination station'}
                  </Text>
                </TouchableOpacity>

                {toStation ? (
                  <TouchableOpacity onPress={clearTo} style={styles.clearBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={15} color="#556080" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {!fromStation || !toStation ? (
              /* STATE 1: UNSELECTED PROMPT */
              <View style={styles.unselectedSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Popular routes</Text>
                  <Text style={styles.sectionHeaderHint}>Fast corridor direct</Text>
                </View>

                {/* COMPACT GROUPED ROUTE LIST */}
                <View style={styles.popularGroupedCard}>
                  {popularRoutes.slice(0, 4).map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.popularRouteRow,
                        index === popularRoutes.slice(0, 4).length - 1 && styles.popularRouteRowLast,
                      ]}
                      onPress={() => selectPopularRoute(item)}
                      activeOpacity={0.7}
                    >
                      {/* Route Details */}
                      <View style={styles.popularRouteInfoCol}>
                        <View style={styles.popularRouteTitleRow}>
                          <Text style={styles.popularStationName}>{item.fromDisplay}</Text>
                          <ArrowRight size={12} color="#94A3B8" style={{ marginHorizontal: 6 }} />
                          <Text style={styles.popularStationName}>{item.toDisplay}</Text>
                        </View>
                        <View style={styles.popularRouteMetaRow}>
                          <Text style={styles.popularRouteMetaDuration}>{item.typicalDuration}</Text>
                          <Text style={styles.popularRouteMetaDot}>·</Text>
                          <Text style={styles.popularRouteMetaTag}>{item.tag}</Text>
                        </View>
                      </View>

                      {/* Fare Pill & Chevron */}
                      <View style={styles.popularRouteRightCol}>
                        <View style={styles.popularFarePill}>
                          <Text style={styles.popularFareText}>{`₹${getFare(item.from, item.to) || item.fare}`}</Text>
                        </View>
                        <ChevronRight size={15} color="#94A3B8" style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* SUBTLE EMPTY STATE */}
                <View style={styles.emptyStateSection}>
                  <View style={styles.emptyIllustrationWrapper}>
                    <EditorialBusIllustration
                      width={146}
                      height={62}
                      color="#17205F"
                      wheelBg="#F7F6F2"
                      accentColor="#687080"
                    />
                  </View>
                  <Text style={styles.emptyStateTitle}>Find your next ride</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Choose a route above to see live departures
                  </Text>
                </View>
              </View>
            ) : journey ? (
              /* STATE 2: ACTIVE SEARCH RESULT */
              <View style={styles.activeSection}>
                {/* NEXT BUS SIGNATURE HERO CARD */}
                <Animated.View style={[styles.royalBlueHeroCard, { transform: [{ scale: cardScaleAnim }] }]}>
                  <View style={styles.heroInfoContent}>
                    <Text style={styles.heroPreLabel}>NEXT BUS</Text>
                    <Text style={styles.heroTimeText}>{journey.fromTime}</Text>
                    <View style={styles.heroRouteRow}>
                      <Text style={styles.heroRouteCodes}>
                        {journey.fromStop.code} <Text style={styles.heroArrowText}>→</Text> {journey.toStop.code}
                      </Text>
                    </View>
                    <Text style={styles.heroStationNames} numberOfLines={1}>
                      {journey.fromStop.shortName} → {journey.toStop.shortName}
                    </Text>
                  </View>

                  <View style={styles.heroIllustrationWrapper} pointerEvents="none">
                    <EditorialBusIllustration />
                  </View>

                  <View style={styles.heroBottomRow}>
                    <View>
                      <Text style={styles.heroMetaTitle}>{journey.routeBadge}</Text>
                      <Text style={styles.heroMetaSubtitle}>
                        {journey.isTransfer ? `Transfer at ${journey.transferHub}` : 'AC Express'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.heroMetaTitle}>{journey.durationMins} min</Text>
                      <Text style={styles.heroMetaDeparts}>{journey.countdownText.toUpperCase()}</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* TRANSFER ALERT BANNER */}
                {journey.isTransfer && (
                  <View style={styles.transferAlertBanner}>
                    <View style={styles.transferAlertBadge}>
                      <Text style={styles.transferAlertBadgeText}>TRANSFER HUB</Text>
                    </View>
                    <Text style={styles.transferAlertText}>
                      Change buses at <Text style={{ fontWeight: '700', color: '#18258F' }}>{journey.transferHub}</Text> ({journey.transferWaitMins}m sync wait)
                    </Text>
                  </View>
                )}

                {/* UPCOMING DEPARTURES STRIP */}
                {journey.upcomingDepartures && journey.upcomingDepartures.length > 1 ? (
                  <View style={[styles.upcomingContainer, styles.upcomingContainerTickets]}>
                    <Text style={styles.upcomingHeaderTitle}>Upcoming departures</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.depScrollContent}
                    >
                      {journey.upcomingDepartures.map(dep => {
                        const isSelected = journey.trip.id === dep.tripId;
                        const isCurrent = dep.diffMins === 0;
                        const diffLabel = isCurrent
                          ? 'NOW'
                          : dep.isNextDay
                          ? 'TOMORROW'
                          : dep.diffMins < 60
                          ? `${dep.diffMins} MIN`
                          : `${Math.floor(dep.diffMins / 60)}H ${dep.diffMins % 60}M`;

                        return (
                          <TouchableOpacity
                            key={dep.tripId}
                            style={[
                              styles.depCard,
                              isSelected && styles.depCardSelected,
                            ]}
                            onPress={() => {
                              setSelectedTripId(dep.tripId);
                              triggerCardBounce();
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.depCardHeader}>
                              {isCurrent ? (
                                <View
                                  style={[
                                    styles.depLiveDot,
                                    isSelected && { backgroundColor: '#18258F' },
                                  ]}
                                />
                              ) : null}
                              <Text
                                style={[
                                  styles.depTimeText,
                                  isSelected ? styles.depTimeTextSelected : styles.depTimeTextFuture,
                                ]}
                              >
                                {dep.departureTime}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.depStatusText,
                                isSelected ? styles.depStatusTextSelected : styles.depStatusTextFuture,
                              ]}
                            >
                              {diffLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {/* REMAINING TIME & FARE DUAL PREMIUM CARDS */}
                <View style={styles.metricsGridRow}>
                  {/* CARD 1: TRAVEL TIME */}
                  <View style={[styles.metricCard, styles.metricCardRemaining]}>
                    <View style={styles.metricCardHeader}>
                      <View style={styles.metricLabelGroup}>
                        <Clock size={13} color="#17268F" strokeWidth={2.4} />
                        <Text style={styles.metricCardLabel}>TRAVEL TIME</Text>
                      </View>
                      <View style={styles.metricBadgeRemaining}>
                        <Text style={styles.metricBadgeTextRemaining}>DIRECT</Text>
                      </View>
                    </View>
                    <Text style={styles.metricCardValue}>
                      {journey.durationMins} <Text style={styles.metricUnitText}>min</Text>
                    </Text>
                    <Text style={styles.metricCardSub} numberOfLines={1}>
                      to {journey.toStop.shortName}
                    </Text>
                  </View>

                  {/* CARD 2: OFFICIAL FARE */}
                  <View style={[styles.metricCard, styles.metricCardFare]}>
                    <View style={styles.metricCardHeader}>
                      <View style={styles.metricLabelGroup}>
                        <ShieldCheck size={13.5} color="#17268F" strokeWidth={2.4} />
                        <Text style={styles.metricCardLabel}>FARE</Text>
                      </View>
                      <View style={styles.metricBadgeFare}>
                        <Text style={styles.metricBadgeTextFare}>AC RIDE</Text>
                      </View>
                    </View>
                    <Text style={styles.metricCardValue}>₹{journey.fare}</Text>
                    <Text style={styles.metricCardSub} numberOfLines={1}>
                      {journey.trip.serviceDay === 'weekend' ? 'Weekend Express' : 'AC Express'}
                    </Text>
                  </View>
                </View>

                {/* DEPARTURE REMINDER ACTION CARD */}
                <TouchableOpacity
                  style={styles.notificationActionCard}
                  onPress={handleScheduleNotifications}
                  activeOpacity={0.8}
                >
                  <View style={styles.notificationIconBox}>
                    {activeReminders.length > 0 ? (
                      <BellRing size={16} color="#F26B52" strokeWidth={2.2} />
                    ) : (
                      <Bell size={16} color="#F26B52" strokeWidth={2.2} />
                    )}
                  </View>
                  <View style={styles.notificationTextBox}>
                    <Text style={styles.notificationTitle}>Departure reminder</Text>
                    <Text style={styles.notificationSubtitle}>
                      {activeReminders.length > 0 ? 'Alerts active for this ride' : 'Alert me 30 min before departure'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.notificationSetBtn,
                      activeReminders.length > 0 && styles.notificationSetBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.notificationSetBtnText,
                        activeReminders.length > 0 && styles.notificationSetBtnTextActive,
                      ]}
                    >
                      {activeReminders.length > 0 ? 'Active' : 'Set reminder'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* OFFICIAL TIMETABLE & STOPPAGES */}
                <View style={styles.stopsTimelineContainer}>
                  <View style={styles.timelineHeaderRow}>
                    <View style={styles.scheduledRoutePill}>
                      <Text style={styles.scheduledRoutePillText}>OFFICIAL TIMETABLE</Text>
                    </View>
                    <Text style={styles.timelineTitle}>Route Stoppages & Schedule</Text>
                  </View>

                  <View style={styles.timelineSummaryBar}>
                    <View style={styles.timelineSummaryItem}>
                      <Text style={styles.timelineSummaryValue}>{journey.fromTime}</Text>
                      <Text style={styles.timelineSummarySub} numberOfLines={1}>{journey.fromStop.shortName}</Text>
                    </View>
                    <View style={styles.timelineSummaryMid}>
                      <Text style={styles.timelineSummaryDuration}>{journey.durationMins} min</Text>
                      <ArrowRight size={13} color="#18258F" style={{ marginTop: 2 }} />
                    </View>
                    <View style={[styles.timelineSummaryItem, { alignItems: 'flex-end' }]}>
                      <Text style={styles.timelineSummaryValue}>{journey.toTime}</Text>
                      <Text style={styles.timelineSummarySub} numberOfLines={1}>{journey.toStop.shortName}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineListContainer}>
                    {journey.intermediateStops.map((stopItem, index) => {
                      const isFirst = index === 0;
                      const isLast = index === journey.intermediateStops.length - 1;

                      return (
                        <View key={index} style={styles.timelineRow}>
                          <View style={styles.timelineDotCol}>
                            {!isLast && <View style={styles.timelineVerticalLine} />}
                            {isFirst ? (
                              <View style={[styles.timelineDot, styles.timelineDotOrigin]}>
                                <View style={styles.timelineDotInnerWhite} />
                              </View>
                            ) : isLast ? (
                              <View style={[styles.timelineDot, styles.timelineDotDest]}>
                                <View style={styles.timelineDotInnerWhite} />
                              </View>
                            ) : (
                              <View style={[styles.timelineDot, styles.timelineDotIntermediate]} />
                            )}
                          </View>

                          <View style={[styles.timelineInfoRow, isLast && { paddingBottom: 4 }]}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Text
                                  style={[
                                    styles.timelineStationName,
                                    (isFirst || isLast) ? styles.timelineStationBold : styles.timelineStationMuted,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {stopItem.name}
                                </Text>
                                {isFirst ? (
                                  <View style={styles.originTagBadge}>
                                    <Text style={styles.originTagBadgeText}>Boarding</Text>
                                  </View>
                                ) : isLast ? (
                                  <View style={styles.destTagBadge}>
                                    <Text style={styles.destTagBadgeText}>Drop-off</Text>
                                  </View>
                                ) : null}
                              </View>
                              {isFirst ? (
                                <Text style={styles.timelineShelterSub}>Platform 1 · Gate opens 2m prior</Text>
                              ) : isLast ? (
                                <Text style={styles.timelineShelterSub}>Final interchange terminal</Text>
                              ) : index === 1 ? (
                                <Text style={styles.timelineShelterSub}>Nava Raipur BRTS Shelter</Text>
                              ) : (
                                <Text style={styles.timelineShelterSub}>Designated bus shelter</Text>
                              )}
                            </View>

                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                              <Text
                                style={[
                                  styles.timelineTimeText,
                                  (isFirst || isLast) ? styles.timelineTimeBold : styles.timelineTimeMuted,
                                ]}
                              >
                                {stopItem.time}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.timelineFooterNotice}>
                    <Info size={13} color="#18258F" style={{ marginTop: 2, marginRight: 6, opacity: 0.7 }} />
                    <Text style={styles.timelineFooterNoticeText}>
                      Timings follow official Nava Raipur BRTS express schedule. Buses halt for 30–45s at designated shelters.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noRouteBox}>
                <Text style={styles.noRouteTitle}>No Direct Route Found</Text>
                <Text style={styles.noRouteSub}>
                  Try swapping origin and destination or select an interchange stop like CBD or Telibandha.
                </Text>
              </View>
            )}
          </>
        ) : (
          /* ========================================================================= */
          /*               2. I'M ONBOARD — WATCH YOUR RIDE (LIVE / OPERATIONAL)       */
          /* ========================================================================= */
          journey ? (
            <View style={styles.onboardContainer}>
              {/* COMPACT ROUTE SWITCHER BAR */}
              <View style={styles.onboardRouteStrip}>
                <View style={styles.onboardRouteInfo}>
                  <View style={styles.liveGreenDotPulse} />
                  <Text style={styles.onboardRouteText} numberOfLines={1}>
                    {journey.fromStop.shortName} → {journey.toStop.shortName}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.onboardChangeRouteBtn}
                  onPress={() => openPicker('to')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.onboardChangeRouteText}>Switch Bus ✎</Text>
                </TouchableOpacity>
              </View>

              {/* LIVE ONBOARD DASHBOARD HERO */}
              <Animated.View style={[styles.onboardHeroCard, { transform: [{ scale: cardScaleAnim }] }]}>
                <View style={styles.onboardHeroTopRow}>
                  <View style={styles.onboardLiveBadge}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.onboardLiveBadgeText}>LIVE ONBOARD</Text>
                  </View>
                  <View style={styles.onboardIllustrationWrapper} pointerEvents="none">
                    <EditorialBusIllustration width={112} height={46} />
                  </View>
                </View>

                {/* CURRENT TIME */}
                <Text style={styles.onboardHeroTime}>{journey.fromTime}</Text>

                {/* ROUTE LINE: BMC ─────────→ CBD */}
                <View style={styles.onboardRouteCodeRow}>
                  <Text style={styles.onboardRouteCode}>{journey.fromStop.code}</Text>
                  <View style={styles.onboardRouteArrowWrapper}>
                    <Svg width={72} height={14} viewBox="0 0 72 14" fill="none">
                      <Line x1="2" y1="7" x2="64" y2="7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity={0.65} />
                      <Path d="M 58 3 L 64 7 L 58 11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.onboardRouteCode}>{journey.toStop.code}</Text>
                </View>
                <Text style={styles.onboardHeroStationNames} numberOfLines={1}>
                  {journey.fromStop.shortName} → {journey.toStop.shortName}
                </Text>

                {/* BOTTOM METADATA ROW */}
                <View style={styles.onboardHeroBottomRow}>
                  <View>
                    <Text style={styles.heroMetaTitle}>{journey.routeBadge}</Text>
                    <Text style={styles.heroMetaSubtitle}>AC Express</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.heroMetaTitle}>
                      {Math.max(1, Math.round(journey.durationMins * (1 - journey.progressPercent / 100)))} min
                    </Text>
                    <Text style={styles.heroMetaDeparts}>IN TRANSIT</Text>
                  </View>
                </View>

                {/* EMBEDDED JOURNEY PROGRESS BAR */}
                <View style={styles.onboardProgressSection}>
                  <View style={styles.onboardProgressHeader}>
                    <Text style={styles.onboardProgressTitle}>{journey.progressPercent}% journey</Text>
                    <Text style={styles.onboardProgressSub}>{journey.remainingStopsCount} stops left</Text>
                  </View>
                  <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBarTrack, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}>
                      <View style={[styles.progressBarFill, { backgroundColor: '#10B981', width: `${journey.progressPercent}%` }]} />
                    </View>
                    <View
                      style={[
                        styles.progressBarBusBadge,
                        { left: `${Math.min(94, Math.max(2, journey.progressPercent))}%` },
                      ]}
                    >
                      <Bus size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* 🟢 NEXT STOP OPERATIONAL STATUS CARD (72-88px) */}
              <View style={styles.onboardNextStopCard}>
                {/* TOP ROW: LIVE STATUS */}
                <View style={styles.nextStopTopRow}>
                  <View style={styles.nextStopLiveHeader}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.nextStopPreLabel}>NEXT STOP</Text>
                  </View>
                  <View style={styles.nextStopStatusBadge}>
                    <View style={styles.liveGreenDotSmall} />
                    <Text style={styles.nextStopStatusText}>
                      {!journey.nextStopETA ||
                      journey.nextStopETA.toLowerCase().includes('now') ||
                      journey.nextStopETA === '0m' ||
                      journey.nextStopETA === '1m'
                        ? 'ARRIVING NOW'
                        : `ARRIVING IN ${journey.nextStopETA.replace('m', ' MIN').toUpperCase()}`}
                    </Text>
                  </View>
                </View>

                {/* MAIN ROW: STATION NAME, SUBTITLE & SCHEDULED TIME */}
                <View style={styles.nextStopMainBody}>
                  <View style={styles.nextStopLeftCol}>
                    <Text style={styles.nextStopTitle}>{journey.nextStopName || 'Sector 29'}</Text>
                    <Text style={styles.nextStopHindiSubtitle} numberOfLines={1}>
                      {nextStopObj?.hindiName ? `${nextStopObj.hindiName} · ` : ''}Nava Raipur BRTS Express Shelter
                    </Text>
                  </View>

                  <View style={styles.nextStopRightCol}>
                    <Text style={styles.nextStopTimeValue}>{nextStopItem?.time || journey.fromTime}</Text>
                    <Text style={styles.nextStopTimeLabel}>SCHEDULED</Text>
                  </View>
                </View>
              </View>

              {/* UPCOMING DEPARTURES STRIP */}
              {journey.upcomingDepartures && journey.upcomingDepartures.length > 1 ? (
                <View style={styles.upcomingContainer}>
                  <Text style={styles.upcomingHeaderTitle}>Upcoming departures</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.depScrollContent}
                  >
                    {journey.upcomingDepartures.map(dep => {
                      const isSelected = journey.trip.id === dep.tripId;
                      const isCurrent = dep.isInTransit || dep.diffMins === 0;
                      const diffLabel = isCurrent
                        ? 'NOW'
                        : dep.diffMins < 60
                        ? `${dep.diffMins} MIN`
                        : `${Math.floor(dep.diffMins / 60)}H ${dep.diffMins % 60}M`;

                      return (
                        <TouchableOpacity
                          key={dep.tripId}
                          style={[
                            styles.depCard,
                            isSelected && styles.depCardSelected,
                          ]}
                          onPress={() => {
                            setSelectedTripId(dep.tripId);
                            triggerCardBounce();
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.depCardHeader}>
                            {isCurrent ? (
                              <View
                                style={[
                                  styles.depLiveDot,
                                  isSelected && { backgroundColor: '#18258F' },
                                ]}
                              />
                            ) : null}
                            <Text
                              style={[
                                styles.depTimeText,
                                isSelected ? styles.depTimeTextSelected : styles.depTimeTextFuture,
                              ]}
                            >
                              {dep.departureTime}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.depStatusText,
                              isSelected ? styles.depStatusTextSelected : styles.depStatusTextFuture,
                            ]}
                          >
                            {diffLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* REMAINING & FARE DUAL PREMIUM CARDS */}
              <View style={styles.metricsGridRow}>
                {/* CARD 1: REMAINING TIME IN TRANSIT */}
                <View style={[styles.metricCard, styles.metricCardRemaining]}>
                  <View style={styles.metricCardHeader}>
                    <View style={styles.metricLabelGroup}>
                      <Clock size={13} color="#17268F" strokeWidth={2.4} />
                      <Text style={styles.metricCardLabel}>REMAINING</Text>
                    </View>
                    <View style={[styles.metricBadgeRemaining, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                      <Text style={[styles.metricBadgeTextRemaining, { color: '#065F46' }]}>LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.metricCardValue}>
                    {Math.max(1, Math.round(journey.durationMins * (1 - journey.progressPercent / 100)))}{' '}
                    <Text style={styles.metricUnitText}>min</Text>
                  </Text>
                  <Text style={styles.metricCardSub} numberOfLines={1}>
                    to {journey.toStop.shortName}
                  </Text>
                </View>

                {/* CARD 2: OFFICIAL FARE */}
                <View style={[styles.metricCard, styles.metricCardFare]}>
                  <View style={styles.metricCardHeader}>
                    <View style={styles.metricLabelGroup}>
                      <ShieldCheck size={13.5} color="#17268F" strokeWidth={2.4} />
                      <Text style={styles.metricCardLabel}>FARE</Text>
                    </View>
                    <View style={styles.metricBadgeFare}>
                      <Text style={styles.metricBadgeTextFare}>AC RIDE</Text>
                    </View>
                  </View>
                  <Text style={styles.metricCardValue}>₹{journey.fare}</Text>
                  <Text style={styles.metricCardSub} numberOfLines={1}>
                    {journey.trip.serviceDay === 'weekend' ? 'Weekend Express' : 'AC Express'}
                  </Text>
                </View>
              </View>

              {/* DROP-OFF REMINDER ACTION CARD */}
              <TouchableOpacity
                style={styles.notificationActionCard}
                onPress={handleScheduleNotifications}
                activeOpacity={0.8}
              >
                <View style={styles.notificationIconBox}>
                  {activeReminders.length > 0 ? (
                    <BellRing size={16} color="#F26B52" strokeWidth={2.2} />
                  ) : (
                    <Bell size={16} color="#F26B52" strokeWidth={2.2} />
                  )}
                </View>
                <View style={styles.notificationTextBox}>
                  <Text style={styles.notificationTitle}>Drop-off reminder</Text>
                  <Text style={styles.notificationSubtitle} numberOfLines={1}>
                    {activeReminders.length > 0
                      ? `Alert active: 1 stop before ${journey.toStop.shortName}`
                      : `Alert me 1 stop before ${journey.toStop.shortName}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.notificationSetBtn,
                    activeReminders.length > 0 && styles.notificationSetBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.notificationSetBtnText,
                      activeReminders.length > 0 && styles.notificationSetBtnTextActive,
                    ]}
                  >
                    {activeReminders.length > 0 ? 'Active' : 'Set reminder'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* FULL LIVE ONBOARD ROUTE TIMELINE */}
              <View style={styles.stopsTimelineContainer}>
                <View style={styles.timelineHeaderRow}>
                  <View style={[styles.scheduledRoutePill, { backgroundColor: '#E9ECFF' }]}>
                    <Text style={[styles.scheduledRoutePillText, { color: '#18258F' }]}>LIVE GPS CORRIDOR</Text>
                  </View>
                  <Text style={styles.timelineTitle}>Live Onboard Route Progress</Text>
                </View>

                {/* TIMELINE TOP SUMMARY STRIP */}
                <View style={styles.timelineSummaryBar}>
                  <View style={styles.timelineSummaryItem}>
                    <Text style={styles.timelineSummaryValue}>{journey.fromTime}</Text>
                    <Text style={styles.timelineSummarySub} numberOfLines={1}>{journey.fromStop.shortName}</Text>
                  </View>
                  <View style={styles.timelineSummaryMid}>
                    <Text style={styles.timelineSummaryDuration}>{journey.durationMins} min</Text>
                    <ArrowRight size={13} color="#18258F" style={{ marginTop: 2 }} />
                  </View>
                  <View style={[styles.timelineSummaryItem, { alignItems: 'flex-end' }]}>
                    <Text style={styles.timelineSummaryValue}>{journey.toTime}</Text>
                    <Text style={styles.timelineSummarySub} numberOfLines={1}>{journey.toStop.shortName}</Text>
                  </View>
                </View>

                <View style={styles.timelineListContainer}>
                  {journey.intermediateStops.map((stopItem, index) => {
                    const isFirst = index === 0;
                    const isLast = index === journey.intermediateStops.length - 1;
                    const isPassed = stopItem.passed;
                    const isCurrent = stopItem.isCurrentNext;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.timelineRow,
                          isCurrent && styles.timelineRowCurrent,
                        ]}
                      >
                        <View style={styles.timelineDotCol}>
                          {!isLast && (
                            <View
                              style={[
                                styles.timelineVerticalLine,
                                isPassed && styles.timelineVerticalLinePassed,
                              ]}
                            />
                          )}

                          {isCurrent ? (
                            <View style={styles.timelineCurrentMarkerBox}>
                              <Bus size={11} color="#FFFFFF" strokeWidth={2.4} />
                            </View>
                          ) : isPassed ? (
                            <View style={styles.timelineDotPassed}>
                              <CheckCircle2 size={15} color="#10B981" />
                            </View>
                          ) : isFirst ? (
                            <View style={[styles.timelineDot, styles.timelineDotOrigin]}>
                              <View style={styles.timelineDotInnerWhite} />
                            </View>
                          ) : isLast ? (
                            <View style={[styles.timelineDot, styles.timelineDotDest]}>
                              <View style={styles.timelineDotInnerWhite} />
                            </View>
                          ) : (
                            <View style={[styles.timelineDot, styles.timelineDotIntermediate]} />
                          )}
                        </View>

                        <View style={[styles.timelineInfoRow, isLast && { paddingBottom: 4 }]}>
                          <View style={{ flex: 1, marginRight: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text
                                style={[
                                  styles.timelineStationName,
                                  (isFirst || isLast || isCurrent) ? styles.timelineStationBold : styles.timelineStationMuted,
                                  isPassed && styles.timelineStationPassed,
                                  isCurrent && { color: '#18258F', fontWeight: '800' },
                                ]}
                                numberOfLines={1}
                              >
                                {stopItem.name}
                              </Text>

                              {isFirst ? (
                                <View style={styles.originTagBadge}>
                                  <Text style={styles.originTagBadgeText}>Boarding</Text>
                                </View>
                              ) : isLast ? (
                                <View style={styles.destTagBadge}>
                                  <Text style={styles.destTagBadgeText}>Drop-off</Text>
                                </View>
                              ) : null}
                            </View>

                            {isFirst ? (
                              <Text style={styles.timelineShelterSub}>Platform 1 · Gate opens 2m prior</Text>
                            ) : isLast ? (
                              <Text style={styles.timelineShelterSub}>Final interchange terminal</Text>
                            ) : isCurrent ? (
                              <Text style={[styles.timelineShelterSub, { color: '#059669', fontWeight: '600' }]}>
                                Approaching designated BRTS platform
                              </Text>
                            ) : (
                              <Text style={styles.timelineShelterSub}>Nava Raipur BRTS Shelter</Text>
                            )}
                          </View>

                          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Text
                              style={[
                                styles.timelineTimeText,
                                (isFirst || isLast || isCurrent) ? styles.timelineTimeBold : styles.timelineTimeMuted,
                                isPassed && styles.timelineTimePassed,
                                isCurrent && { color: '#18258F', fontWeight: '800' },
                              ]}
                            >
                              {stopItem.time}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.timelineFooterNotice}>
                  <Info size={13} color="#18258F" style={{ marginTop: 2, marginRight: 6, opacity: 0.7 }} />
                  <Text style={styles.timelineFooterNoticeText}>
                    In-bus tracker estimates are synchronized with Nava Raipur BRTS corridor RFID sensors.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noRouteBox}>
              <Text style={styles.noRouteTitle}>No Active Bus Found</Text>
              <Text style={styles.noRouteSub}>
                Please select an active route from the station picker.
              </Text>
            </View>
          )
        )}


      </ScrollView>

      {/* --- STEP 10A: RIGHT-SIDE SLIDE-IN STATION PICKER PANEL --- */}
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
                <X size={20} color="#18258F" />
              </TouchableOpacity>
            </View>

            {/* SEARCH FIELD */}
            <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
              <Search size={16} color={isSearchFocused ? '#18258F' : '#6B7280'} />
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

            {/* STATIONS LIST */}
            <FlatList
              data={filteredStops}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.drawerListContent}
              renderItem={({ item }) => {
                const isSelected =
                  (activePicker === 'from' && fromStation === item.name) ||
                  (activePicker === 'to' && toStation === item.name);

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
    backgroundColor: '#F7F7F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  /* TOP MODE TAB BAR (PILL SEGMENT CONTROL) */
  topTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(247, 247, 244, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    zIndex: 20,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(22px) saturate(180%)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%)',
        } as any)
      : {}),
  },
  topTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  topTabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topTabLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#556080',
  },
  topTabLabelActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* PAGE HEADING */
  pageHeaderTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF0F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  pageMainHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  pageSubHeading: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },

  /* HEADER & INPUT CARD */
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 14,
  },
  stationInputTouch: {
    flex: 1,
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  stationText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.2,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 22,
  },
  dividerLine: {
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
    marginLeft: 8,
  },
  chipsScroll: {
    marginTop: 14,
    marginHorizontal: -4,
  },
  chipsContent: {
    paddingRight: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: '#18258F',
    fontWeight: '600',
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 3,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeToggleTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* NOTIFICATION CONFIRMATION BANNER */
  bannerContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 16,
  },

  /* STATE 1: UNSELECTED PROMPT */
  unselectedSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17205F',
    letterSpacing: -0.2,
  },
  sectionHeaderHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  popularGroupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    overflow: 'hidden',
    shadowColor: '#17205F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  popularRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F9',
    backgroundColor: '#FFFFFF',
  },
  popularRouteRowLast: {
    borderBottomWidth: 0,
  },
  popularRouteInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  popularRouteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularStationName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.2,
  },
  popularRouteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  popularRouteMetaDuration: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  popularRouteMetaDot: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  popularRouteMetaTag: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  popularRouteRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  popularFarePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularFareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyStateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    marginBottom: 60,
  },
  emptyIllustrationWrapper: {
    width: 148,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    opacity: 0.95,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17205F',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  emptyStateSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#687080',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },

  /* STATE 2: SIGNATURE DEEP NAVY HERO CARD */
  activeSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  royalBlueHeroCard: {
    backgroundColor: '#18258F', // Signature Deep Navy Background
    borderRadius: 18,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  heroInfoContent: {
    zIndex: 2,
    maxWidth: '56%',
  },
  heroPreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroTimeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF', // ① Dominant White Time
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  heroRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRouteCodes: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF', // ② Corridor Codes
    letterSpacing: -0.3,
  },
  heroArrowText: {
    color: '#E0E7FF',
    fontWeight: '700',
    fontSize: 18,
    marginHorizontal: 4,
  },
  heroStationNames: {
    fontSize: 11.5,
    color: '#E0E7FF',
    opacity: 0.85,
    marginTop: 2,
    marginBottom: 0,
  },
  heroIllustrationWrapper: {
    position: 'absolute',
    top: 14,
    right: 12,
    zIndex: 1,
    opacity: 0.95,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 4,
    zIndex: 2,
  },
  heroMetaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroMetaSubtitle: {
    fontSize: 11,
    color: '#C7D2FE', // Light blue subtitle
    marginTop: 1,
  },
  heroMetaDeparts: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E0E7FF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  heroOnboardProgress: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  heroOnboardText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroOnboardRemaining: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  countdownHighlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F26B52',
    letterSpacing: 0.3,
  },

  /* METRICS DUAL-CARD GRID (REMAINING & FARE) */
  metricsGridRow: {
    flexDirection: 'row',
    gap: 16, // User spec: 16–20 px gap between cards
    marginBottom: 24, // User spec: Stats to Reminder = 24 px!
    width: '100%',
  },
  metricCard: {
    flex: 1,
    height: 114, // User spec: Target: 110–120 px
    backgroundColor: '#FFFFFF', // Elevated white surface
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(23, 38, 143, 0.08)',
    shadowColor: '#17268F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  metricCardRemaining: {
    backgroundColor: '#FFFFFF', // Clean white surface
    borderColor: 'rgba(23, 38, 143, 0.08)',
  },
  metricCardFare: {
    backgroundColor: '#FFFFFF', // White surface, NOT bright yellow
    borderColor: 'rgba(23, 38, 143, 0.08)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricCardLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#17268F', // Navy label
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  metricBadgeRemaining: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  metricBadgeTextRemaining: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  metricBadgeFare: {
    backgroundColor: '#FDF8E7', // Tiny warm-amber micro tag (#F4E6B8 accent)
    borderWidth: 1,
    borderColor: '#F4E6B8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  metricBadgeTextFare: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17268F', // Navy typography
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  metricUnitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  metricCardSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B', // Neutral muted subtitle
    marginTop: 1,
  },

  /* NOTIFICATION ACTION CARD (Coral reserved for Alerts/Reminders) */
  notificationActionCard: {
    height: 68, // User spec: Target height: 64–72 px!
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16, // User spec: Padding: 16 px!
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // User spec: Reminder to Corridor = 16 px!
    borderWidth: 1.2,
    borderColor: 'rgba(23, 38, 143, 0.08)',
    shadowColor: '#17268F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF1EE', // Soft coral container for reminder/action
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationTextBox: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  notificationSetBtn: {
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDC5BA',
  },
  notificationSetBtnActive: {
    backgroundColor: '#F26B52',
    borderColor: '#F26B52',
  },
  notificationSetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F26B52',
  },
  notificationSetBtnTextActive: {
    color: '#FFFFFF',
  },

  /* CORRIDOR CARD */
  corridorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  corridorTextBox: {
    flex: 1,
  },
  corridorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10131A',
  },
  corridorSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },

  /* ROUTE TIMELINE (SIGNATURE CREAM MICRO-ACCENT PRESERVED) */
  stopsTimelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 96, // Clear 64px floating bottom nav + margin!
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.06)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineHeaderRow: {
    marginBottom: 14,
  },
  scheduledRoutePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5EAD8', // Signature Cream Micro-accent
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  scheduledRoutePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.2,
  },

  /* TIMELINE SUMMARY STRIP */
  timelineSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.06)',
  },
  timelineSummaryItem: {
    flex: 1,
  },
  timelineSummaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.3,
  },
  timelineSummarySub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  timelineSummaryMid: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  timelineSummaryDuration: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
  },

  /* TIMELINE LIST & ROWS */
  timelineListContainer: {
    position: 'relative',
    paddingVertical: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 46,
    position: 'relative',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 1,
  },
  timelineRowCurrent: {
    backgroundColor: '#EEF2FF', // Soft ice-navy highlight for approaching stop
  },
  timelineDotCol: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'stretch',
    marginRight: 12,
  },
  timelineVerticalLine: {
    position: 'absolute',
    top: 14,
    bottom: -14,
    width: 2,
    backgroundColor: '#E2E8F0',
    left: 11,
    zIndex: 1,
  },
  timelineVerticalLinePassed: {
    backgroundColor: '#10B981',
  },
  timelineDot: {
    zIndex: 2,
  },
  timelineDotOrigin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  timelineDotDest: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F26B52',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  timelineDotInnerWhite: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#FFFFFF',
  },
  timelineDotIntermediate: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
    borderColor: '#9CA3AF',
    borderWidth: 2,
    marginTop: 5,
  },
  timelineDotPassed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    zIndex: 2,
  },
  timelineCurrentMarkerBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    zIndex: 3,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineInfoRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 22,
  },
  timelineStationName: {
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  timelineStationBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18258F',
  },
  timelineStationMuted: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  timelineStationPassed: {
    color: '#94A3B8',
  },
  timelineShelterSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  originTagBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  originTagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#18258F',
  },
  destTagBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  destTagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F26B52',
  },
  timelineTimeText: {
    fontSize: 13,
  },
  timelineTimeBold: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18258F',
  },
  timelineTimeMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  timelineTimePassed: {
    color: '#94A3B8',
  },
  timelineFooterNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F7F7F4',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  timelineFooterNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },

  /* ========================================================================= */
  /*               I'M ONBOARD DEDICATED STYLES (WATCH YOUR RIDE)              */
  /* ========================================================================= */
  onboardContainer: {
    paddingHorizontal: 16,
    marginTop: 0,
  },
  onboardRouteStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: 66, // Target: 64–72 px
    paddingHorizontal: 16, // 16 px horizontal
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16, // Route context ➔ HERO = 16 px!
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  onboardRouteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  liveGreenDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  onboardRouteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18258F',
  },
  onboardChangeRouteBtn: {
    backgroundColor: '#F1F3FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE2F0',
  },
  onboardChangeRouteText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
  },
  onboardHeroCard: {
    backgroundColor: '#18258F',
    borderRadius: 20,
    padding: 24, // Hero padding: 24 px! Top-left anchored!
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16, // HERO ➔ NEXT STOP = 16 px!
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  onboardHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveGreenDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#065F46',
    marginRight: 5,
  },
  onboardLiveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  onboardIllustrationWrapper: {
    position: 'absolute',
    top: 24,
    right: 20,
    zIndex: 1,
    opacity: 0.95,
  },
  onboardHeroTime: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginTop: 16, // Badge ➔ time: 16 px!
  },
  onboardRouteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Time ➔ route: 8–12 px (10 px)!
  },
  onboardRouteCode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  onboardRouteArrowWrapper: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardHeroStationNames: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C7D2FE',
    marginTop: 4, // Route ➔ subtitle: 4 px!
  },
  onboardHeroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24, // Subtitle ➔ bus information: 24 px!
  },
  onboardProgressSection: {
    marginTop: 16, // Bus information ➔ divider: 16 px!
    paddingTop: 12, // Divider ➔ progress information: 12 px!
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  onboardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardProgressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onboardProgressSub: {
    fontSize: 11,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  progressBarWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginTop: 10, // Progress text ➔ bar: 10–12 px (10 px)!
    paddingVertical: 4,
  },
  onboardNextStopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16, // 16 px horizontal padding!
    paddingVertical: 14, // Height ~78–82 px (Target: 72–88 px)!
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 24, // NEXT STOP ➔ UPCOMING DEPARTURES = 24 px!
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStopTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nextStopLiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextStopPreLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nextStopStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextStopStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  nextStopMainBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextStopLeftCol: {
    flex: 1,
    marginRight: 12,
  },
  nextStopTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.3,
  },
  nextStopHindiSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  nextStopRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  nextStopTimeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.3,
  },
  nextStopTimeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  nextStopFooterDivider: {
    height: 1,
    backgroundColor: 'rgba(24, 37, 143, 0.07)',
    marginTop: 10,
    marginBottom: 8,
  },
  nextStopFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nextStopFollowingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextStopFollowingLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  nextStopFollowingName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  nextStopRemainingStops: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
  },


  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#16A979',
  },
  progressBarBusBadge: {
    position: 'absolute',
    top: '50%',
    marginTop: -9.5,
    marginLeft: -9.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  upcomingChipInTransit: {
    borderColor: '#16A979',
    backgroundColor: '#E6F7F0',
  },

  noRouteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
  },
  noRouteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18258F',
    marginBottom: 6,
  },
  noRouteSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* --- RIGHT-SIDE SLIDE-IN STATION PICKER STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 26, 114, 0.16)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as any)
      : {}),
  },
  drawerContainer: {
    backgroundColor: 'rgba(250, 249, 246, 0.94)',
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
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } as any)
      : {}),
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
    backgroundColor: 'rgba(24, 37, 143, 0.03)',
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
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
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

  /* UPCOMING DEPARTURES TIMELINE */
  upcomingContainer: {
    marginBottom: 24, // User spec: Upcoming departures ➔ Stats = 24 px!
  },
  upcomingContainerTickets: {
    marginTop: 16, // Extra breathing space below solid Navy Hero card (matching Onboard tab)
  },
  upcomingHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18258F',
    marginBottom: 12, // Heading ➔ departure cards = 12 px!
    letterSpacing: -0.2,
  },
  depScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  depCard: {
    height: 66, // User spec: Height: 64–68 px
    paddingHorizontal: 16, // User spec: 16 px horizontal
    paddingVertical: 10, // User spec: 10–12 px vertical
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  depCardSelected: {
    backgroundColor: '#E9ECFF', // Very light navy tint
    borderColor: '#18258F',
  },
  depCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  depLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  depTimeText: {
    fontSize: 14,
    letterSpacing: -0.3,
  },
  depTimeTextSelected: {
    fontWeight: '800',
    color: '#18258F',
  },
  depTimeTextFuture: {
    fontWeight: '600',
    color: '#334155',
  },
  depStatusText: {
    fontSize: 11,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  depStatusTextSelected: {
    fontWeight: '800',
    color: '#18258F',
  },
  depStatusTextFuture: {
    fontWeight: '600',
    color: '#64748B',
  },
  transferAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  transferAlertBadge: {
    backgroundColor: '#18258F',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  transferAlertBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  transferAlertText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1E3A8A',
    fontWeight: '500',
  },
});
