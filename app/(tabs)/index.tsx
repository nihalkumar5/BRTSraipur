import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowUpDown,
  Search,
  X,
  Bus,
  Clock,
  MapPin,
  CheckCircle2,
  Check,
  RotateCcw,
  Bell,
  BellRing,
  Calendar,
  Navigation,
  Info,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import {
  stops,
  popularRoutes,
  getFare,
  calculateJourney,
  getCurrentMinutesOfDay,
  formatMinutesToTime,
  findNearbyDirectAlternatives,
  getNearbyStations,
  getNearbyStationsWithService,
} from '../../src/services/tracker';
import {
  scheduleBusNotification,
  ScheduledReminder,
  getActiveReminders,
} from '../../src/services/notifications';
import { Stop, ActiveJourney, PopularRoute, NearbyDirectAlternative, NearbyServiceStation } from '../../src/types';
import { FONT, typography } from '../../src/theme/typography';

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

function NoServiceBusIllustration({ width = 145, height = 82 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, height, overflow: 'visible' }}>
      <Svg width={width} height={height} viewBox="0 0 170 95" fill="none">
        {/* Soft background skyline & street line */}
        <Path d="M 0 70 L 170 70" stroke="#E2E8F0" strokeWidth="1.5" />
        <Rect x="15" y="32" width="16" height="38" fill="#F1F5F9" />
        <Rect x="26" y="24" width="14" height="46" fill="#E2E8F0" opacity="0.75" />
        <Rect x="44" y="36" width="18" height="34" fill="#F1F5F9" />
        <Circle cx="8" cy="54" r="8" fill="#E2E8F0" opacity="0.6" />
        <Circle cx="14" cy="50" r="6" fill="#CBD5E1" opacity="0.5" />

        {/* Bus Stop Shelter Canopy & Support Pillar */}
        <Path d="M 116 28 C 124 25, 140 25, 156 30 L 156 33 C 140 28, 124 28, 116 31 Z" fill="#94A3B8" />
        <Line x1="150" y1="30" x2="150" y2="70" stroke="#94A3B8" strokeWidth="2" />
        <Line x1="126" y1="30" x2="126" y2="70" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Shelter bench */}
        <Rect x="131" y="53" width="17" height="3" rx="1.5" fill="#94A3B8" />
        <Line x1="134" y1="56" x2="134" y2="70" stroke="#94A3B8" strokeWidth="1" />
        <Line x1="145" y1="56" x2="145" y2="70" stroke="#94A3B8" strokeWidth="1" />

        {/* Ground shadow beneath bus */}
        <Path d="M 38 72 C 60 74, 112 74, 140 72" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

        {/* Sleek Modern BRTS Bus Body */}
        <Path
          d="M 44 67 L 44 32 C 44 29 47 28 50 28 L 118 28 C 125 28 133 30 136 34 L 139 50 C 140 54 139 64 137 67 Z"
          fill="#FFFFFF"
          stroke="#64748B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Aerodynamic Roof Pod */}
        <Path d="M 64 26 C 64 24 68 23 74 23 L 98 23 C 104 23 108 24 108 26 Z" fill="#CBD5E1" />

        {/* Dark Tinted Windshield */}
        <Path
          d="M 120 32 L 133 34 C 135 37 136 44 136 48 L 120 48 Z"
          fill="#334155"
        />
        {/* Side Passenger Windows */}
        <Rect x="48" y="32" width="14" height="15" rx="1" fill="#475569" />
        <Rect x="64" y="32" width="16" height="15" rx="1" fill="#334155" />
        <Rect x="82" y="32" width="16" height="15" rx="1" fill="#475569" />
        <Rect x="100" y="32" width="16" height="15" rx="1" fill="#334155" />

        {/* Driver side mirror */}
        <Path d="M 137 37 L 141 38 L 140 42" stroke="#475569" strokeWidth="1.2" fill="none" />

        {/* Front Headlight & Lower Bumper Line */}
        <Path d="M 134 54 C 137 54 138 56 137 58 L 133 58" fill="#FBBF24" />
        <Line x1="44" y1="59" x2="137" y2="59" stroke="#E2E8F0" strokeWidth="1" />

        {/* Bus Wheels */}
        {/* Rear Wheel */}
        <Circle cx="58" cy="67" r="7.5" fill="#1E293B" />
        <Circle cx="58" cy="67" r="4" fill="#94A3B8" />
        <Circle cx="58" cy="67" r="1.5" fill="#F8FAFC" />
        {/* Front Wheel */}
        <Circle cx="120" cy="67" r="7.5" fill="#1E293B" />
        <Circle cx="120" cy="67" r="4" fill="#94A3B8" />
        <Circle cx="120" cy="67" r="1.5" fill="#F8FAFC" />

        {/* Soft Red Prohibition Circle Overlay */}
        <Circle cx="145" cy="22" r="15" fill="#FEE2E2" opacity="0.65" />
        <Circle cx="145" cy="22" r="11" stroke="#EF4444" strokeWidth="2.2" fill="#FFFFFF" opacity="0.9" />
        <Line x1="137" y1="14" x2="153" y2="30" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      </Svg>
    </View>
  );
}

// Module-level in-memory session store: persists during app run, resets when app is closed
let sessionFromStation = '';
let sessionToStation = '';

if (typeof window !== 'undefined') {
  try {
    // Clear old localStorage entries so app close genuinely resets as requested
    window.localStorage?.removeItem('brts_saved_from_station');
    window.localStorage?.removeItem('brts_saved_to_station');
    if (window.sessionStorage) {
      sessionFromStation = window.sessionStorage.getItem('brts_session_from_station') || '';
      sessionToStation = window.sessionStorage.getItem('brts_session_to_station') || '';
    }
  } catch (e) {}
}

export default function LiveBusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const insets = useSafeAreaInsets();

  // Session-persisted station state: stays preserved when clicking Home or switching tabs,
  // but resets when the app is closed.
  const [fromStation, setFromStation] = useState<string>(() => {
    if (params.from) return params.from;
    return sessionFromStation;
  });
  const [toStation, setToStation] = useState<string>(() => {
    if (params.to) return params.to;
    return sessionToStation;
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
    sessionFromStation = fromStation;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (fromStation) {
          window.sessionStorage.setItem('brts_session_from_station', fromStation);
        } else {
          window.sessionStorage.removeItem('brts_session_from_station');
        }
      } catch (e) {}
    }
  }, [fromStation]);

  useEffect(() => {
    sessionToStation = toStation;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (toStation) {
          window.sessionStorage.setItem('brts_session_to_station', toStation);
        } else {
          window.sessionStorage.removeItem('brts_session_to_station');
        }
      } catch (e) {}
    }
  }, [toStation]);
  
  // Planning Mode: 'next' (Boarding next bus) vs 'onboard' (I'm on this bus / Live Route Tracker)
  const [planningMode, setPlanningMode] = useState<'next' | 'onboard'>('next');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Always reset selectedTripId when origin or destination changes
  useEffect(() => {
    setSelectedTripId(null);
  }, [fromStation, toStation]);

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

  // Popular routes "View all" modal state
  const [allPopularModalVisible, setAllPopularModalVisible] = useState(false);
  const [popularCategory, setPopularCategory] = useState<'all' | 'secretariat' | 'campus' | 'tourist' | 'hospital' | 'shuttle'>('all');
  const [popularSearchQuery, setPopularSearchQuery] = useState('');

  // Route details popup modal state (View route)
  const [routeDetailsModalVisible, setRouteDetailsModalVisible] = useState(false);
  const [showAllOnboardStops, setShowAllOnboardStops] = useState(false);
  const [departuresExpanded, setDeparturesExpanded] = useState(false);

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

  // If no direct or transfer route found, find nearby stations that have direct service
  const noRouteAlternatives: NearbyDirectAlternative[] = useMemo(() => {
    if (journey || !fromStation || !toStation || fromStation === toStation) return [];
    return findNearbyDirectAlternatives(fromStation, toStation, planningMode ? 'weekday' : undefined, currentTimeMins, 2.5);
  }, [journey, fromStation, toStation, planningMode, currentTimeMins]);

  // Nearby stations that specifically offer bus service to destination
  const nearbyServiceStations: NearbyServiceStation[] = useMemo(() => {
    if (journey || !fromStation || !toStation || fromStation === toStation) return [];
    return getNearbyStationsWithService(fromStation, toStation, planningMode ? 'weekday' : undefined, currentTimeMins, 2.5);
  }, [journey, fromStation, toStation, planningMode, currentTimeMins]);

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

  // Onboard departure and arrival states
  const isBeforeDeparture = useMemo(() => {
    if (!journey) return false;
    return currentTimeMins < journey.departureMins;
  }, [journey, currentTimeMins]);

  const isJourneyCompleted = useMemo(() => {
    if (!journey) return false;
    return currentTimeMins >= journey.arrivalMins;
  }, [journey, currentTimeMins]);

  // Active current stop index for Onboard
  const activeCurrentStopIdx = useMemo(() => {
    if (!journey) return -1;
    if (nextStopIdx >= 0) return nextStopIdx;
    if (currentTimeMins < journey.departureMins) return 0;
    if (journey.intermediateStops.every(s => s.passed)) return journey.intermediateStops.length - 1;
    const firstUnpassed = journey.intermediateStops.findIndex(s => !s.passed);
    return firstUnpassed >= 0 ? firstUnpassed : 0;
  }, [journey, nextStopIdx, currentTimeMins]);

  // Stops left count for Onboard
  const onboardStopsLeftCount = useMemo(() => {
    if (!journey) return 0;
    if (isJourneyCompleted) return 0;
    return journey.remainingStopsCount ?? Math.max(1, journey.intermediateStops.length - 1 - Math.max(0, activeCurrentStopIdx));
  }, [journey, isJourneyCompleted, activeCurrentStopIdx]);

  // Dynamic next stop name for Hero
  const heroStationName = useMemo(() => {
    if (!journey) return 'Sector 29';
    if (isBeforeDeparture) {
      return journey.fromStop.shortName || journey.fromStop.name;
    }
    if (isJourneyCompleted) {
      return journey.toStop.shortName || journey.toStop.name;
    }
    if (journey.nextStopName) {
      return journey.nextStopName;
    }
    if (activeCurrentStopIdx >= 0 && activeCurrentStopIdx < journey.intermediateStops.length) {
      return journey.intermediateStops[activeCurrentStopIdx].name;
    }
    return journey.toStop.shortName || journey.toStop.name;
  }, [journey, isBeforeDeparture, isJourneyCompleted, activeCurrentStopIdx]);

  // Dynamic ETA badge text for Hero
  const heroEtaBadgeText = useMemo(() => {
    if (!journey) return '● Arriving now';
    if (isBeforeDeparture) {
      const diff = Math.max(0, journey.departureMins - currentTimeMins);
      return diff <= 5 && diff > 0 ? `● Departs in ${diff} min` : `● Departs at ${journey.fromTime}`;
    }
    if (isJourneyCompleted) {
      return `● Arrived at ${journey.toTime}`;
    }
    if (!journey.nextStopETA || journey.nextStopETA.toLowerCase().includes('now') || journey.nextStopETA === '0m' || journey.nextStopETA === '1m') {
      return '● Arriving now';
    }
    return `● Arriving in ~${journey.nextStopETA.replace('m', ' min')}`;
  }, [journey, isBeforeDeparture, isJourneyCompleted, currentTimeMins]);

  // Focused stops to display in compact journey map (up to 3 passed + current + next 4 upcoming)
  const displayedOnboardStops = useMemo(() => {
    if (!journey) return [];
    const total = journey.intermediateStops.length;
    if (total <= 8 || showAllOnboardStops) {
      return journey.intermediateStops.map((stop, originalIndex) => ({ stop, originalIndex }));
    }
    const startIdx = Math.max(0, activeCurrentStopIdx - 3);
    const endIdx = Math.min(total, activeCurrentStopIdx + 5);
    return journey.intermediateStops
      .map((stop, originalIndex) => ({ stop, originalIndex }))
      .slice(startIdx, endIdx);
  }, [journey, activeCurrentStopIdx, showAllOnboardStops]);

  // Hidden upcoming stops count beyond the compact view
  const hiddenUpcomingCount = useMemo(() => {
    if (!journey || showAllOnboardStops) return 0;
    const total = journey.intermediateStops.length;
    const displayedMaxIdx = displayedOnboardStops.length > 0 
      ? displayedOnboardStops[displayedOnboardStops.length - 1].originalIndex 
      : 0;
    return Math.max(0, total - 1 - displayedMaxIdx);
  }, [journey, displayedOnboardStops, showAllOnboardStops]);

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

  // Filter popular routes for "View all" modal
  const filteredPopularRoutes = useMemo(() => {
    return popularRoutes.filter(item => {
      if (popularCategory === 'secretariat') {
        const t = (item.tag + ' ' + item.from + ' ' + item.to).toLowerCase();
        if (!t.includes('secretariat') && !t.includes('capital') && !t.includes('mantralaya')) return false;
      } else if (popularCategory === 'campus') {
        const t = (item.tag + ' ' + item.from + ' ' + item.to).toLowerCase();
        if (!t.includes('campus') && !t.includes('hnlu') && !t.includes('iiit')) return false;
      } else if (popularCategory === 'tourist') {
        const t = (item.tag + ' ' + item.from + ' ' + item.to).toLowerCase();
        if (!t.includes('tourist') && !t.includes('safari') && !t.includes('muktangan')) return false;
      } else if (popularCategory === 'hospital') {
        const t = (item.tag + ' ' + item.from + ' ' + item.to).toLowerCase();
        if (!t.includes('hospital') && !t.includes('medical') && !t.includes('balco') && !t.includes('aiims') && !t.includes('sai')) return false;
      } else if (popularCategory === 'shuttle') {
        const t = (item.tag + ' ' + item.from + ' ' + item.to).toLowerCase();
        if (!t.includes('shuttle') && !t.includes('loop') && !t.includes('feeder')) return false;
      }

      if (!popularSearchQuery.trim()) return true;
      const q = popularSearchQuery.toLowerCase();
      return (
        item.from.toLowerCase().includes(q) ||
        item.to.toLowerCase().includes(q) ||
        item.fromDisplay.toLowerCase().includes(q) ||
        item.toDisplay.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      );
    });
  }, [popularCategory, popularSearchQuery]);

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

  const selectStation = (station: Stop) => {
    if (activePicker === 'from') {
      setFromStation(station.name);
    } else {
      setToStation(station.name);
    }
    setSelectedTripId(null);
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
    setSelectedTripId(null);
    triggerCardBounce();
  };

  const selectPopularRoute = (route: PopularRoute) => {
    setFromStation(route.from);
    setToStation(route.to);
    setSelectedTripId(null);
    setAllPopularModalVisible(false);
    triggerCardBounce();
  };

  const clearFrom = () => {
    setFromStation('');
    setSelectedTripId(null);
  };
  const clearTo = () => {
    setToStation('');
    setSelectedTripId(null);
  };

  // Comprehensive Back navigation handler (closes modals/sheets/inspectors only)
  const handleBack = useCallback(() => {
    // 0. If route details modal is open, close it
    if (routeDetailsModalVisible) {
      setRouteDetailsModalVisible(false);
      return true;
    }
    // 0b. If departures card is expanded, collapse it
    if (departuresExpanded) {
      setDeparturesExpanded(false);
      return true;
    }
    // 1. If station picker sheet is open, close it
    if (modalVisible) {
      closePicker();
      return true;
    }
    // 2. If all popular routes modal is open, close it
    if (allPopularModalVisible) {
      setAllPopularModalVisible(false);
      return true;
    }
    // 3. If inspecting a trip detail inspector, dismiss inspector
    if (selectedTripId) {
      setSelectedTripId(null);
      return true;
    }
    return false;
  }, [routeDetailsModalVisible, departuresExpanded, modalVisible, allPopularModalVisible, selectedTripId]);

  const isBackable = routeDetailsModalVisible || departuresExpanded || modalVisible || allPopularModalVisible || !!selectedTripId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__handleActiveScreenBack = handleBack;
      if ((window as any).ReactNativeWebView?.postMessage) {
        try {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'CAN_GO_BACK', canGoBack: isBackable })
          );
        } catch (e) {}
      }
    }
  }, [handleBack, isBackable]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return handleBack();
    });
    return () => sub.remove();
  }, [handleBack]);

  // Browser & Mobile Web history popstate support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isBackable) {
      if (!window.history.state || !window.history.state.tatparBack) {
        window.history.pushState({ tatparBack: true }, '');
      }
    }

    const onPopState = () => {
      handleBack();
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (typeof window !== 'undefined' && (window as any).__handleActiveScreenBack === handleBack) {
        (window as any).__handleActiveScreenBack = null;
      }
    };
  }, [isBackable, handleBack]);

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
      {/* --- REDBUS-STYLE 2-SECTION TOP HEADER (BLUE ACTIVE) --- */}
      <View style={styles.topTabBar}>
        {/* SECTION 1: Bus tickets */}
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            setPlanningMode('next');
            setSelectedTripId(null);
            triggerCardBounce();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.topTabContent}>
            <View style={styles.topTabIconBox}>
              <Bus
                size={23}
                color={planningMode === 'next' ? '#18258F' : '#64748B'}
                strokeWidth={planningMode === 'next' ? 2.2 : 1.75}
              />
            </View>
            <Text
              style={[
                styles.topTabLabel,
                planningMode === 'next'
                  ? styles.topTabLabelActive
                  : styles.topTabLabelInactive,
              ]}
            >
              Bus track
            </Text>
          </View>
          <View
            style={[
              styles.topTabIndicator,
              planningMode === 'next' && styles.topTabIndicatorActive,
            ]}
          />
        </TouchableOpacity>

        {/* SECTION 2: I'm onboard */}
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            setPlanningMode('onboard');
            setSelectedTripId(null);
            triggerCardBounce();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.topTabContent}>
            <View style={styles.topTabIconBox}>
              <Navigation
                size={22}
                color={planningMode === 'onboard' ? '#18258F' : '#64748B'}
                strokeWidth={planningMode === 'onboard' ? 2.2 : 1.75}
              />
            </View>
            <Text
              style={[
                styles.topTabLabel,
                planningMode === 'onboard'
                  ? styles.topTabLabelActive
                  : styles.topTabLabelInactive,
              ]}
            >
              I'm onboard
            </Text>
          </View>
          <View
            style={[
              styles.topTabIndicator,
              planningMode === 'onboard' && styles.topTabIndicatorActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* FULL WIDTH HERO BANNER — ONLY IN INITIAL UNSEARCHED STATE */}
        {planningMode === 'next' && (!fromStation || !toStation) ? (
          <View style={styles.heroBannerContainer}>
            <Image
              source={require('../../assets/images/brtshero.webp')}
              style={styles.heroBannerImage}
              resizeMode="cover"
              accessibilityLabel="Nava Raipur BRTS Transit Corridor"
            />
          </View>
        ) : null}

        {/* PAGE HEADING */}
        <View style={styles.pageHeaderTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageMainHeading}>
              {planningMode === 'next'
                ? 'Bus Track'
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
                <View style={styles.popularSectionHeaderRow}>
                  <Text style={styles.popularSectionTitle}>Popular Routes</Text>
                  <TouchableOpacity
                    onPress={() => setAllPopularModalVisible(true)}
                    style={styles.popularViewAllBtn}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="View all popular routes"
                  >
                    <Text style={styles.popularViewAllText}>View all</Text>
                    <ChevronRight size={14} color="#18258F" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>

                {/* INDIVIDUAL POPULAR ROUTE CARDS (MATCHING USER UPLOADED DESIGN) */}
                <View style={styles.popularCardsList}>
                  {popularRoutes.slice(0, 4).map((item) => {
                    const routeFare = getFare(item.from, item.to) || item.fare;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.popularCard}
                        onPress={() => selectPopularRoute(item)}
                        activeOpacity={0.75}
                      >
                        {/* BUS SQUIRCLE ICON */}
                        <View style={styles.popularIconWrap}>
                          <Bus size={20} color="#18258F" strokeWidth={2.2} />
                        </View>

                        {/* ROUTE INFO */}
                        <View style={styles.popularInfoCol}>
                          <View style={styles.popularTitleRow}>
                            <Text style={styles.popularStationText}>{item.fromDisplay}</Text>
                            <ArrowRight size={12} color="#94A3B8" strokeWidth={2.2} style={{ marginHorizontal: 6 }} />
                            <Text style={styles.popularStationText}>{item.toDisplay}</Text>
                          </View>
                          <Text style={styles.popularMetaText}>
                            {item.typicalDuration}  ·  {item.tag}
                          </Text>
                        </View>

                        {/* FARE BADGE & CHEVRON */}
                        <View style={styles.popularRightCol}>
                          <View style={styles.popularFareBadge}>
                            <Text style={styles.popularFareBadgeText}>₹{routeFare}</Text>
                          </View>
                          <ChevronRight size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
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
                {/* ⚡ SMART ROUTE RECOMMENDATION */}
                {journey.optimalProximity && !journey.isProximityOptimized && (() => {
                  const opt = journey.optimalProximity;
                  const bus = opt.shortHopBus;
                  const busNumber = bus?.busNumber || journey.routeBadge;
                  const nextDeparture = bus?.departureTime || journey.fromTime;
                  const durationMins = bus
                    ? (bus.totalCommuteMins || bus.busRideMins)
                    : opt.directWalkingMins;
                  const stopsCount = bus ? (opt.directDistanceKm <= 3.5 ? '1 stop' : `${journey.intermediateStopsCount} stops`) : 'Direct connection';

                  return (
                    <View style={styles.smartRouteCard}>
                      {/* Top Header Row */}
                      <View style={styles.smartRouteHeaderRow}>
                        <View style={styles.smartRouteLabelBox}>
                          <Zap size={12} color="#18258F" strokeWidth={2.6} />
                          <Text style={styles.smartRoutePreLabel}>RECOMMENDED</Text>
                        </View>
                        {opt.minutesSaved > 0 ? (
                          <View style={styles.smartRouteFasterBadge}>
                            <Text style={styles.smartRouteFasterText}>
                              {opt.minutesSaved}m faster
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Station Title & Duration / Stops */}
                      <View style={styles.smartRouteBody}>
                        <Text style={styles.smartRouteTitle} numberOfLines={1}>
                          {journey.fromStop.shortName} → {journey.toStop.shortName}
                        </Text>
                        <Text style={styles.smartRouteSubMetrics}>
                          {durationMins} min · {stopsCount}
                        </Text>
                      </View>

                      {/* Primary Actionable Bus Row */}
                      <View style={styles.smartRouteBusRow}>
                        <View style={styles.smartRouteBusInfo}>
                          <Bus size={15} color="#18258F" strokeWidth={2.4} />
                          <Text style={styles.smartRouteBusText} numberOfLines={1}>
                            <Text style={styles.smartRouteBusBold}>BRT {busNumber.replace(/^BRT\s*/i, '')}</Text>
                            {' · Next departure '}{nextDeparture}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.smartRouteViewBtn}
                          onPress={() => {
                            if (bus?.dropStationShortName) {
                              setToStation(bus.dropStationShortName);
                              setSelectedTripId(null);
                              triggerCardBounce();
                            } else {
                              triggerCardBounce();
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.smartRouteViewBtnText}>View bus →</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Subtle Secondary Alternative */}
                      <View style={styles.smartRouteAltRow}>
                        <Text style={styles.smartRouteAltLabel}>Alternative:</Text>
                        <Text style={styles.smartRouteAltText}>
                          {opt.directDistanceKm <= 2.5
                            ? `Walk ~${opt.directWalkingMins} min or Auto / E-rickshaw ~5 min`
                            : `Auto / E-rickshaw · ~15 min`}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {/* ⚠️ SERVICE ENDED TODAY + PROMINENT ACTIVE TONIGHT ALTERNATIVES */}
                {journey.serviceEndedToday && (
                  <View style={styles.serviceEndedCard}>
                    <View style={styles.serviceEndedHeaderRow}>
                      <View style={styles.serviceEndedIconWrap}>
                        <Clock size={18} color="#DC2626" strokeWidth={2.4} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceEndedTitle}>
                          Direct Service to {journey.toStop.shortName} Ended Today
                        </Text>
                        <Text style={styles.serviceEndedSub}>
                          {journey.lastDepartedTodayTime ? `Last direct bus left at ${journey.lastDepartedTodayTime}. ` : ''}
                          {journey.nearbyDirectAlternatives && journey.nearbyDirectAlternatives.some(a => a.isToday)
                            ? (journey.nearbyDirectAlternatives.some(a => a.isToday && a.type === 'nearby_destination')
                                ? `Lekin paas ke station tak abhi bus mil rahi hai (paidal ya auto se aage ja sakte hain):`
                                : `Paas ke stations se abhi direct bus mil sakti hai:`)
                            : `Is route par agli bus kal subah ${journey.fromTime} ko chalegi.`}
                        </Text>
                      </View>
                    </View>

                    {/* Nearby Active Stops Tonight */}
                    {journey.nearbyDirectAlternatives && journey.nearbyDirectAlternatives.filter(a => a.isToday).length > 0 && (
                      <View style={styles.serviceEndedOptionsWrap}>
                        {journey.nearbyDirectAlternatives.filter(a => a.isToday).slice(0, 2).map((alt, idx) => {
                          const isDest = alt.type === 'nearby_destination';
                          return (
                            <TouchableOpacity
                              key={`ended-alt-${idx}`}
                              style={styles.serviceEndedOptionItem}
                              onPress={() => {
                                if (alt.type === 'nearby_origin') {
                                  setFromStation(alt.suggestedStop.shortName);
                                } else {
                                  setToStation(alt.suggestedStop.shortName);
                                }
                                setSelectedTripId(null);
                                triggerCardBounce();
                              }}
                              activeOpacity={0.8}
                            >
                              <View style={{ flex: 1, marginRight: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <Text style={styles.serviceEndedStopName}>
                                    {isDest ? `Drop at ${alt.suggestedStop.shortName}` : alt.suggestedStop.shortName}
                                  </Text>
                                  <Text style={styles.serviceEndedDistBadge}>
                                    ({alt.stopsAway
                                      ? `${alt.stopsAway} stop${alt.stopsAway > 1 ? 's' : ''} before ${journey.toStop.shortName} · ~${alt.routeTimeDeltaMins}m on route`
                                      : `${alt.distanceFormatted} ${isDest ? `from ${journey.toStop.shortName}` : 'away'} · ~${alt.walkingMins}m walk`})
                                  </Text>
                                </View>
                                <Text style={styles.serviceEndedTripInfo}>
                                  Bus {alt.routeNumber} at <Text style={{ fontWeight: '800', color: '#047857' }}>{alt.departureTime}</Text> (in {alt.minutesUntilDeparture}m) · ₹{alt.fare}
                                  {alt.previousDepartureTime ? ` · (Prev: ${alt.previousDepartureTime})` : ''}
                                </Text>
                              </View>
                              <View style={styles.serviceEndedSwitchBtn}>
                                <Text style={styles.serviceEndedSwitchBtnText}>
                                  {isDest ? 'Drop here ➔' : 'Board here ➔'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                {/* ⚡ SMART OPTIMIZED ROUTE BANNER */}
                {journey.isProximityOptimized && (
                  <View style={styles.proximityOptimizedBanner}>
                    <View style={styles.proximityOptimizedBadge}>
                      <Zap size={13} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={styles.proximityOptimizedBadgeText}>SMART DIRECT ROUTE</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.proximityOptimizedTitle}>
                        {journey.originalOriginStop
                          ? `Board at ${journey.fromStop.shortName} (${journey.proximityBoardWalkFormatted || 'nearby'})`
                          : `Routed to ${journey.toStop.shortName}`}
                        {journey.targetDestinationStop ? ` · ${journey.proximityWalkFormatted || '1 stop'} to ${journey.targetDestinationStop.shortName}` : ''}
                      </Text>
                      <Text style={styles.proximityOptimizedSub}>
                        {journey.circuitTransferDurationMins ? `${journey.circuitTransferDurationMins}m / ₹${journey.circuitTransferFare || 70} ka detour hata diya gaya hai. ` : ''}Direct Bus {journey.trip.routeNumber} se sirf {journey.durationMins} min me pahunchein (Sirf ₹{journey.fare})!
                      </Text>
                    </View>
                  </View>
                )}

                {/* NEXT BUS SIGNATURE HERO CARD OR REDESIGNED NO SERVICE CARD */}
                {journey.serviceEndedToday ? (
                  <Animated.View
                    style={[
                      styles.noServiceCard,
                      { transform: [{ scale: cardScaleAnim }] },
                    ]}
                  >
                    {/* TOP SECTION: BADGE, HEADLINE, SUBTITLE & BUS SHELTER ILLUSTRATION */}
                    <View style={styles.noServiceTopRow}>
                      <View style={styles.noServiceLeftCol}>
                        {/* NO SERVICE PILL BADGE */}
                        <View style={styles.noServiceBadge}>
                          <Clock size={12} color="#EF4444" strokeWidth={2.4} />
                          <Text style={styles.noServiceBadgeText}>No Service Today</Text>
                        </View>

                        {/* HEADLINE */}
                        <Text style={styles.noServiceTitle}>No Buses Left Today</Text>

                        {/* SUBTITLE */}
                        <Text style={styles.noServiceSubtitle}>
                          {journey.lastDepartedTodayTime ? `The last bus departed at ${journey.lastDepartedTodayTime}.\n` : 'Service has ended for today.\n'}
                          Tomorrow’s service will resume after 12:00 AM (next bus at {journey.fromTime}).
                        </Text>
                      </View>

                      {/* RIGHT ILLUSTRATION */}
                      <View style={styles.noServiceIllustrationWrap} pointerEvents="none">
                        <NoServiceBusIllustration width={138} height={82} />
                      </View>
                    </View>

                    {/* NEARBY ALTERNATIVE (IF ACTIVE TONIGHT) */}
                    {journey.nearbyDirectAlternatives && journey.nearbyDirectAlternatives.some(a => a.isToday) && (
                      <TouchableOpacity
                        style={styles.heroAlternativeHintPill}
                        onPress={() => {
                          const firstActive = journey.nearbyDirectAlternatives?.find(a => a.isToday);
                          if (firstActive) {
                            if (firstActive.type === 'nearby_origin') {
                              setFromStation(firstActive.suggestedStop.shortName);
                            } else {
                              setToStation(firstActive.suggestedStop.shortName);
                            }
                            setSelectedTripId(null);
                            triggerCardBounce();
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Zap size={13} color="#FBBF24" strokeWidth={2.4} />
                        <Text style={styles.heroAlternativeHintText}>
                          {journey.nearbyDirectAlternatives.find(a => a.isToday)?.type === 'nearby_destination'
                            ? `Take bus till ${journey.nearbyDirectAlternatives.find(a => a.isToday)?.suggestedStop.shortName} tonight (${journey.nearbyDirectAlternatives.find(a => a.isToday)?.stopsAway ? `${journey.nearbyDirectAlternatives.find(a => a.isToday)?.stopsAway} stop${(journey.nearbyDirectAlternatives.find(a => a.isToday)?.stopsAway || 1) > 1 ? 's' : ''} before ${journey.toStop.shortName}` : `${journey.nearbyDirectAlternatives.find(a => a.isToday)?.distanceFormatted} to ${journey.toStop.shortName}`}) ➔`
                            : `Board from ${journey.nearbyDirectAlternatives.find(a => a.isToday)?.suggestedStop.shortName} tonight ➔`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* MIDDLE SECTION: ROUTE & BUS BOX (MATCHING UPLOADED IMAGE 1) */}
                    <View style={styles.noServiceRouteBox}>
                      {/* LEFT: ROUTE DETAILS */}
                      <View style={styles.noServiceRouteCol}>
                        <View style={styles.routePinTrack}>
                          <MapPin size={15} color="#2563EB" strokeWidth={2.5} />
                          <View style={styles.routePinDashLine} />
                          <View style={styles.routePinDot} />
                        </View>
                        <View style={styles.routePinTextCol}>
                          <Text style={styles.routeMicroLabel}>ROUTE</Text>
                          <Text style={styles.routeCodeText}>
                            {journey.fromStop.code}  <Text style={{ color: '#94A3B8' }}>→</Text>  {journey.toStop.code}
                          </Text>
                          <Text style={styles.routeStationNameText} numberOfLines={1}>
                            {journey.fromStop.shortName} → {journey.toStop.shortName}
                          </Text>
                        </View>
                      </View>

                      {/* VERTICAL DIVIDER */}
                      <View style={styles.noServiceDivider} />

                      {/* RIGHT: BUS SERVICE */}
                      <View style={styles.noServiceBusCol}>
                        <View style={styles.noServiceBusIconWrap}>
                          <Bus size={18} color="#18258F" strokeWidth={2.2} />
                        </View>
                        <View style={styles.noServiceBusTextCol}>
                          <Text style={styles.busRouteNumText}>
                            {journey.routeBadge || `BRT ${journey.trip.routeNumber}`}
                          </Text>
                          <Text style={styles.busRouteStatusText} numberOfLines={1}>
                            Service ended for today
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* BOTTOM SECTION: NEXT SERVICE REMINDER BANNER (MATCHING UPLOADED IMAGE 1) */}
                    <TouchableOpacity
                      style={styles.noServiceNextBox}
                      onPress={handleScheduleNotifications}
                      activeOpacity={0.8}
                    >
                      <View style={styles.noServiceCalendarIconWrap}>
                        <Calendar size={20} color="#18258F" strokeWidth={2.2} />
                      </View>
                      <View style={styles.noServiceNextTextCol}>
                        <Text style={styles.nextServiceMicroLabel}>NEXT SERVICE</Text>
                        <Text style={styles.nextServiceTimeText}>
                          Tomorrow, {journey.fromTime}
                        </Text>
                        <Text style={styles.nextServiceSubText}>
                          Set a reminder and we’ll notify you.
                        </Text>
                      </View>
                      <ChevronRight size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      styles.modernBusCard,
                      { transform: [{ scale: cardScaleAnim }] },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.92}
                      onPress={() => setSelectedTripId(journey.trip.id)}
                    >
                      {/* TOP ROW: INFO ON LEFT, 3D RED BUS ON RIGHT */}
                      <View style={styles.busCardTopRow}>
                        <View style={styles.busCardLeftCol}>
                          {/* ● NEXT BUS BADGE */}
                          <View style={styles.heroLiveBadgeRow}>
                            <View style={styles.heroLiveDot} />
                            <Text style={styles.heroLiveBadgeText}>
                              {journey.isProximityOptimized ? 'SMART DIRECT' : 'NEXT BUS'}
                            </Text>
                          </View>

                          {/* DEPARTURE TIME */}
                          <Text style={styles.busCardTimeText}>{journey.fromTime}</Text>

                          {/* CORRIDOR ROUTE CODES */}
                          <View style={styles.busCardRouteCodesRow}>
                            <Text style={styles.busCardRouteCodes}>
                              {journey.fromStop.code || journey.fromStop.shortName.slice(0, 3).toUpperCase()}
                            </Text>
                            <Text style={styles.busCardArrow}>→</Text>
                            <Text style={styles.busCardRouteCodes}>
                              {journey.toStop.code || journey.toStop.shortName.slice(0, 4).toUpperCase()}
                            </Text>
                          </View>

                          {/* FULL STATION NAMES */}
                          <Text style={styles.busCardStationNames} numberOfLines={1}>
                            {journey.originalOriginStop ? `${journey.originalOriginStop.shortName} ➔ ` : ''}
                            {journey.fromStop.shortName} → {journey.toStop.shortName}
                            {journey.targetDestinationStop && ` (for ${journey.targetDestinationStop.shortName})`}
                          </Text>

                          {/* ROUTE META LINE (ROUTE · SERVICE · FARE) */}
                          <Text style={styles.heroRouteMetaText} numberOfLines={1}>
                            {journey.routeBadge} · {journey.isTransfer ? `Via ${journey.transferHub}` : 'AC Express'} · ₹{journey.fare}
                          </Text>
                        </View>

                        {/* RIGHT 3D BUS ILLUSTRATION */}
                        <View style={styles.busCardRightIllustration} pointerEvents="none">
                          <Image
                            source={require('../../assets/images/redbus_3d.png')}
                            style={styles.busCard3DImage}
                            resizeMode="contain"
                          />
                        </View>
                      </View>

                      {/* CLEAN DIVIDER */}
                      <View style={styles.heroDividerLine} />

                      {/* BOTTOM ROW: DEPARTS IN */}
                      <View style={styles.heroDepartsInRow}>
                        <Text style={styles.heroDepartsInLabel}>Departs in</Text>
                        <Text style={styles.heroDepartsInValue}>
                          {(() => {
                            let diff = journey.departureMins - currentTimeMins;
                            if (diff < 0) diff += 1440;
                            if (diff === 0) return 'NOW';
                            const hrs = Math.floor(diff / 60);
                            const mins = diff % 60;
                            if (hrs > 0) return `${hrs}h ${mins}m`;
                            return `${mins} min`;
                          })()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* TRANSFER ALERT BANNER */}
                {journey.isTransfer && (
                  <View style={styles.transferAlertBanner}>
                    <View style={styles.transferAlertBadge}>
                      <Text style={styles.transferAlertBadgeText}>BUS CHANGE</Text>
                    </View>
                    <Text style={styles.transferAlertText}>
                      Take <Text style={{ fontWeight: '700', color: '#18258F' }}>Bus {journey.trip.routeNumber}</Text> → Change at <Text style={{ fontWeight: '700', color: '#18258F' }}>{journey.transferHub}</Text> ({journey.transferWaitMins}m wait) → Take <Text style={{ fontWeight: '700', color: '#059669' }}>Bus {journey.connectingTrip?.routeNumber}</Text>
                    </Text>
                  </View>
                )}

                {/* TRANSFER FAST DIRECT PROXIMITY SHORTCUT */}
                {journey.isTransfer && journey.optimalProximity?.shortHopBus && (
                  <TouchableOpacity
                    style={styles.transferProximityPill}
                    onPress={() => {
                      if (journey.optimalProximity?.shortHopBus?.dropStationShortName) {
                        setToStation(journey.optimalProximity.shortHopBus.dropStationShortName);
                        setSelectedTripId(null);
                        triggerCardBounce();
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Zap size={13} color="#047857" strokeWidth={2.4} />
                    <Text style={styles.transferProximityPillText}>
                      ⚡ Fast Option: Take Bus {journey.optimalProximity.shortHopBus.busNumber} to {journey.optimalProximity.shortHopBus.dropStationShortName} in {journey.optimalProximity.shortHopBus.busRideMins}m (Save {journey.optimalProximity.minutesSaved}m) ➔
                    </Text>
                  </TouchableOpacity>
                )}

                {/* NEXT DEPARTURES STRIP (CLEAN MINIMAL TEXT ROW) */}
                {(() => {
                  const allUpcomingDeps = journey.upcomingDepartures || [];
                  if (allUpcomingDeps.length === 0) return null;

                  const otherDeps = allUpcomingDeps
                    .filter(dep => dep.tripId !== journey.trip.id)
                    .slice(0, 3);
                  if (otherDeps.length === 0 && !departuresExpanded) return null;

                  return (
                    <View style={[styles.cleanNextDeparturesCard, departuresExpanded && styles.cleanNextDeparturesCardExpanded]}>
                      <View style={styles.cleanNextDeparturesHeaderRow}>
                        <Text style={styles.cleanNextDeparturesTitle}>
                          {departuresExpanded ? `All departures (${allUpcomingDeps.length})` : 'Next departures'}
                        </Text>
                        {departuresExpanded ? (
                          <TouchableOpacity
                            onPress={() => setDeparturesExpanded(false)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.cleanDeparturesCloseBtn}
                            accessibilityLabel="Close all departures"
                          >
                            <X size={15} color="#475569" strokeWidth={2.4} />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => setDeparturesExpanded(true)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={styles.cleanViewFullTimetableLink}>View all departures →</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {departuresExpanded ? (
                        <View style={styles.cleanDeparturesExpandedContent}>
                          <View style={styles.cleanDeparturesGrid}>
                            {allUpcomingDeps.map((dep) => {
                              const isSelected = journey.trip.id === dep.tripId;
                              return (
                                <TouchableOpacity
                                  key={`${dep.tripId}_${dep.departureTime}`}
                                  onPress={() => {
                                    setSelectedTripId(dep.tripId);
                                    triggerCardBounce();
                                  }}
                                  activeOpacity={0.75}
                                  style={[
                                    styles.cleanDepPill,
                                    isSelected && styles.cleanDepPillSelected,
                                  ]}
                                >
                                  {dep.route ? (
                                    <Text
                                      style={[
                                        styles.cleanDepPillRoute,
                                        isSelected && styles.cleanDepPillRouteSelected,
                                      ]}
                                    >
                                      {dep.route}
                                    </Text>
                                  ) : null}
                                  <Text
                                    style={[
                                      styles.cleanDepPillTime,
                                      isSelected && styles.cleanDepPillTimeSelected,
                                    ]}
                                  >
                                    {dep.departureTime}
                                  </Text>
                                  {isSelected && (
                                    <View style={styles.cleanDepSelectedDot} />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                          <Text style={styles.cleanDeparturesHintText}>
                            Tap any departure time to select and track that bus
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.cleanNextDeparturesTimesRow}>
                          {otherDeps.map((dep, idx) => (
                            <React.Fragment key={`${dep.tripId}_${dep.departureTime}`}>
                              {idx > 0 && <Text style={styles.cleanNextDepDot}>·</Text>}
                              <TouchableOpacity
                                onPress={() => {
                                  setSelectedTripId(dep.tripId);
                                  triggerCardBounce();
                                }}
                                activeOpacity={0.7}
                                style={styles.cleanNextDepBtn}
                              >
                                <Text
                                  style={[
                                    styles.cleanNextDepTimeText,
                                    journey.trip.id === dep.tripId && styles.cleanNextDepTimeTextSelected,
                                  ]}
                                >
                                  {dep.departureTime}
                                </Text>
                              </TouchableOpacity>
                            </React.Fragment>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })()}

                {/* ROUTE STATUS COMPONENT (COMBINES STATUS, TIME, AND LINK) */}
                <View style={styles.cleanRouteStatusCard}>
                  <View style={styles.cleanRouteStatusTopRow}>
                    <Text style={styles.cleanRouteStatusLabel}>Route status</Text>
                    <View style={styles.cleanRouteStatusLiveRow}>
                      <View style={styles.cleanStatusGreenDot} />
                      <Text style={styles.cleanRouteStatusLiveText}>On schedule</Text>
                    </View>
                  </View>

                  <Text style={styles.cleanRouteStatusStations} numberOfLines={1}>
                    {journey.fromStop.shortName} → {journey.toStop.shortName}
                  </Text>

                  <View style={styles.cleanRouteStatusBottomRow}>
                    <Text style={styles.cleanRouteStatusDetails}>
                      {journey.durationMins} min · {journey.fromTime} → {journey.toTime}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setRouteDetailsModalVisible(true)}
                      activeOpacity={0.7}
                      style={styles.cleanRouteStatusViewBtn}
                    >
                      <Text style={styles.cleanRouteStatusViewText}>View route →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* COMPACT DEPARTURE REMINDER */}
                <TouchableOpacity
                  style={styles.compactReminderCard}
                  onPress={handleScheduleNotifications}
                  activeOpacity={0.8}
                >
                  <View style={styles.compactReminderIconBox}>
                    {activeReminders.length > 0 ? (
                      <BellRing size={15} color="#EA580C" strokeWidth={2.2} />
                    ) : (
                      <Bell size={15} color="#EA580C" strokeWidth={2.2} />
                    )}
                  </View>
                  <View style={styles.compactReminderTextBox}>
                    <Text style={styles.compactReminderTitle}>Departure reminder</Text>
                    <Text style={styles.compactReminderSubtitle}>
                      {activeReminders.length > 0 ? 'Alert active for this ride' : 'Get notified 30 min before departure'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.compactReminderBtn,
                      activeReminders.length > 0 && styles.compactReminderBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.compactReminderBtnText,
                        activeReminders.length > 0 && styles.compactReminderBtnTextActive,
                      ]}
                    >
                      {activeReminders.length > 0 ? 'Active' : 'Set reminder'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* NEARBY DIRECT ROUTE PRO-TIP / FASTER ALTERNATIVE */}
                {journey.isTransfer && journey.nearbyDirectAlternatives && journey.nearbyDirectAlternatives.length > 0 && (
                  <View style={styles.nearbyAlternativeCard}>
                    <View style={styles.nearbyAltHeaderRow}>
                      <View style={styles.nearbyAltIconWrap}>
                        <Navigation size={16} color="#047857" strokeWidth={2.4} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.nearbyAltTitle}>Direct Bus Available Nearby</Text>
                          <View style={styles.nearbyAltSavePill}>
                            <Text style={styles.nearbyAltSavePillText}>Avoid Transfer</Text>
                          </View>
                        </View>
                        <Text style={styles.nearbyAltSub}>
                          {journey.nearbyDirectAlternatives[0].type === 'nearby_origin'
                            ? `Paas ke station se direct bus pakdein aur transfer se bachein:`
                            : `Destination ke paas direct bus se utrein:`}
                        </Text>
                      </View>
                    </View>

                        {journey.nearbyDirectAlternatives.slice(0, 2).map((alt, idx) => (
                      <View key={`alt-${idx}`} style={styles.nearbyAltItemRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.nearbyAltStationName}>{alt.suggestedStop.shortName}</Text>
                            <Text style={styles.nearbyAltDistText}>
                              ({alt.stopsAway
                                ? `${alt.stopsAway} stop${alt.stopsAway > 1 ? 's' : ''} on route · ~${alt.routeTimeDeltaMins}m`
                                : `${alt.distanceFormatted} away · ~${alt.walkingMins}m walk`})
                            </Text>
                            {alt.isReachableNow && (
                              <View style={styles.reachableNowPill}>
                                <Text style={styles.reachableNowPillText}>Reachable</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.nearbyAltTripDesc}>
                            {alt.isToday
                              ? `Bus ${alt.routeNumber} at ${alt.departureTime} (in ${alt.minutesUntilDeparture}m · ~${alt.walkingMins}m walk) · ₹${alt.fare}${alt.previousDepartureTime ? ` · (Prev was ${alt.previousDepartureTime})` : ''}`
                              : `Service ended today · First bus tomorrow at ${alt.departureTime} · ₹${alt.fare}`}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.nearbyAltSwitchBtn}
                          onPress={() => {
                            if (alt.type === 'nearby_origin') {
                              setFromStation(alt.suggestedStop.shortName);
                            } else {
                              setToStation(alt.suggestedStop.shortName);
                            }
                            setSelectedTripId(null);
                            triggerCardBounce();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.nearbyAltSwitchBtnText}>
                            {alt.type === 'nearby_origin' ? 'Board here' : 'Drop here'} ➔
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* DEDICATED STEP-BY-STEP BUS CHANGE GUIDE CARD */}
                {journey.isTransfer && (
                  <View style={styles.busChangeGuideCard}>
                    <View style={styles.busChangeGuideHeader}>
                      <View style={styles.busChangeIconBox}>
                        <ArrowUpDown size={18} color="#18258F" strokeWidth={2.4} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.busChangeGuideTitle}>Bus Change Guide</Text>
                          <View style={styles.busChangeCountBadge}>
                            <Text style={styles.busChangeCountBadgeText}>1 Transfer</Text>
                          </View>
                        </View>
                        <Text style={styles.busChangeGuideSubtitle}>
                          Kaun si bus kab badalni hai (Switch at {journey.transferHub})
                        </Text>
                      </View>
                    </View>

                    {/* STEP 1: FIRST BUS */}
                    <View style={styles.busChangeStepItem}>
                      <View style={styles.busChangeStepNumberBadge}>
                        <Text style={styles.busChangeStepNumberText}>1</Text>
                      </View>
                      <View style={styles.busChangeStepBody}>
                        <View style={styles.busChangeStepTopRow}>
                          <View style={styles.busChangeRoutePillLeg1}>
                            <Bus size={11} color="#FFFFFF" />
                            <Text style={styles.busChangeRoutePillText}>Bus {journey.trip.routeNumber}</Text>
                          </View>
                          <Text style={styles.busChangeStepTimeText}>{journey.fromTime} → {journey.transferArrivalTime || ''}</Text>
                        </View>
                        <Text style={styles.busChangeStepDesc}>
                          Board at <Text style={styles.busChangeBoldText}>{journey.fromStop.shortName}</Text> ({journey.fromTime}) · Alight at <Text style={styles.busChangeBoldText}>{journey.transferHub}</Text> ({journey.transferArrivalTime || ''})
                        </Text>
                      </View>
                    </View>

                    {/* STEP 2: INTERCHANGE WAIT BANNER */}
                    <View style={styles.busChangeInterchangeStep}>
                      <View style={styles.busChangeInterchangeLine} />
                      <View style={styles.busChangeInterchangeContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <Clock size={13} color="#B45309" strokeWidth={2.4} />
                          <Text style={styles.busChangeInterchangeTitle}>
                            Change Bus at {journey.transferHub} ({journey.transferWaitMins}m wait)
                          </Text>
                        </View>
                        <Text style={styles.busChangeInterchangeSub}>
                          Bus {journey.trip.routeNumber} se utrein ({journey.transferArrivalTime || ''}) → {journey.transferWaitMins} min shelter par wait karein → Connecting Bus {journey.connectingTrip?.routeNumber || ''} me baithein ({journey.connectingFromTime})
                        </Text>
                      </View>
                    </View>

                    {/* STEP 3: SECOND BUS */}
                    <View style={styles.busChangeStepItem}>
                      <View style={[styles.busChangeStepNumberBadge, { backgroundColor: '#059669' }]}>
                        <Text style={styles.busChangeStepNumberText}>2</Text>
                      </View>
                      <View style={styles.busChangeStepBody}>
                        <View style={styles.busChangeStepTopRow}>
                          <View style={styles.busChangeRoutePillLeg2}>
                            <Bus size={11} color="#FFFFFF" />
                            <Text style={styles.busChangeRoutePillText}>Bus {journey.connectingTrip?.routeNumber || 'Connecting'}</Text>
                          </View>
                          <Text style={[styles.busChangeStepTimeText, { color: '#047857' }]}>{journey.connectingFromTime} → {journey.toTime}</Text>
                        </View>
                        <Text style={styles.busChangeStepDesc}>
                          Board at <Text style={styles.busChangeBoldText}>{journey.transferHub}</Text> ({journey.connectingFromTime}) · Final arrival at <Text style={styles.busChangeBoldText}>{journey.toStop.shortName}</Text> ({journey.toTime})
                        </Text>
                      </View>
                    </View>

                    {journey.optimalProximity?.shortHopBus && (
                      <TouchableOpacity
                        style={styles.busChangeProximityFooter}
                        onPress={() => {
                          if (journey.optimalProximity?.shortHopBus?.dropStationShortName) {
                            setToStation(journey.optimalProximity.shortHopBus.dropStationShortName);
                            setSelectedTripId(null);
                            triggerCardBounce();
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Zap size={14} color="#059669" strokeWidth={2.4} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.busChangeProximityTitle}>
                            Faster Alternative: Take Bus {journey.optimalProximity.shortHopBus.busNumber} to {journey.optimalProximity.shortHopBus.dropStationShortName}
                          </Text>
                          <Text style={styles.busChangeProximitySub}>
                            Ride only {journey.optimalProximity.shortHopBus.busRideMins}m instead of {journey.durationMins}m detour · Save {journey.optimalProximity.minutesSaved}m!
                          </Text>
                        </View>
                        <Text style={styles.busChangeProximityBtnText}>Switch ➔</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* VIEW COMPLETE TIMETABLE FOOTER CTA */}
                <TouchableOpacity
                  style={styles.cleanTimetableFooterCta}
                  onPress={() => router.push('/timetable' as any)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cleanTimetableFooterLeft}>
                    <Calendar size={15} color="#18258F" strokeWidth={2.2} />
                    <Text style={styles.cleanTimetableFooterText}>View full timetable & all stops</Text>
                  </View>
                  <ChevronRight size={15} color="#18258F" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noRouteContainer}>
                <View style={styles.noRouteHeader}>
                  <View style={styles.noRouteIconBox}>
                    <MapPin size={22} color="#DC2626" />
                  </View>
                  <Text style={styles.noRouteHeaderTitle}>No Route Found Between Stations</Text>
                  <Text style={styles.noRouteHeaderSub}>
                    {fromStation} aur {toStation} ke beech direct ya connecting bus nahi mili.
                  </Text>
                </View>

                {/* IF NEARBY DIRECT ALTERNATIVES EXIST */}
                {noRouteAlternatives.length > 0 ? (
                  <View style={styles.noRouteSuggestionsBox}>
                    <View style={styles.noRouteSectionHeader}>
                      <Navigation size={16} color="#047857" strokeWidth={2.4} />
                      <Text style={styles.noRouteSectionTitle}>Nearby Stations with Direct Bus</Text>
                    </View>
                    <Text style={styles.noRouteSectionSub}>
                      In paas ke stations se destination tak direct bus chal rahi hai:
                    </Text>

                    {noRouteAlternatives.map((alt, idx) => (
                      <View key={`nra-${idx}`} style={styles.noRouteAltCard}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.noRouteAltStationName}>{alt.suggestedStop.shortName}</Text>
                            <Text style={styles.noRouteAltDistText}>({alt.distanceFormatted} · ~{alt.walkingMins}m walk)</Text>
                          </View>
                          <Text style={styles.noRouteAltDetail}>
                            {alt.isToday
                              ? `Bus ${alt.routeNumber} at ${alt.departureTime} (in ${alt.minutesUntilDeparture}m · ~${alt.walkingMins}m walk) · ₹${alt.fare}`
                              : `Service ended today · First bus tomorrow at ${alt.departureTime} · ₹${alt.fare}`}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.noRouteAltBtn}
                          onPress={() => {
                            if (alt.type === 'nearby_origin') {
                              setFromStation(alt.suggestedStop.shortName);
                            } else {
                              setToStation(alt.suggestedStop.shortName);
                            }
                            setSelectedTripId(null);
                            triggerCardBounce();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.noRouteAltBtnText}>
                            {alt.type === 'nearby_origin' ? 'Board from here' : 'Drop off here'} ➔
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : nearbyServiceStations.length > 0 ? (
                  /* ONLY SHOW NEARBY STATIONS THAT ACTUALLY GO TO DESTINATION */
                  <View style={styles.noRouteSuggestionsBox}>
                    <View style={styles.noRouteSectionHeader}>
                      <Navigation size={16} color="#047857" strokeWidth={2.4} />
                      <Text style={styles.noRouteSectionTitle}>Paas Ke Station Se Bus Pakdein:</Text>
                    </View>
                    <Text style={styles.noRouteSectionSub}>
                      {fromStation} ke paas in stations se {toStation} ke liye bus milti hai:
                    </Text>

                    {nearbyServiceStations.map((ns, idx) => (
                      <View key={`nss-${idx}`} style={styles.noRouteAltCard}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.noRouteAltStationName}>{ns.stop.shortName}</Text>
                            <Text style={styles.noRouteAltDistText}>({ns.distanceFormatted} · ~{ns.walkingMins}m walk)</Text>
                          </View>
                          <Text style={styles.noRouteAltDetail}>
                            {ns.routeSummary}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.noRouteAltBtn}
                          onPress={() => {
                            if (ns.actionType === 'board') {
                              setFromStation(ns.stop.shortName);
                            } else {
                              setToStation(ns.stop.shortName);
                            }
                            setSelectedTripId(null);
                            triggerCardBounce();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.noRouteAltBtnText}>
                            {ns.actionType === 'board' ? 'Board from here ➔' : 'Drop off here ➔'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}
          </>
        ) : (
          /* ========================================================================= */
          /*               2. I'M ONBOARD — WATCH YOUR RIDE (LIVE / OPERATIONAL)       */
          /* ========================================================================= */
          journey ? (
            <View style={styles.onboardContainer}>
              {/* COMPACT ROUTE CONTEXT / SWITCHER BAR */}
              <View style={styles.onboardRouteStrip}>
                <View style={styles.onboardRouteInfo}>
                  <View style={styles.liveGreenDotPulse} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.onboardRouteSubLabel}>I'm Onboard · Live</Text>
                    <Text style={styles.onboardRouteText} numberOfLines={1}>
                      {journey.fromStop.shortName} → {journey.toStop.shortName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.onboardChangeRouteBtn}
                  onPress={() => openPicker('to')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.onboardChangeRouteText}>Switch Bus ✎</Text>
                </TouchableOpacity>
              </View>

              {/* 1. REFINED LIVE ONBOARD HERO CARD (COMPACT, FOCUSED) */}
              <Animated.View style={[styles.onboardHeroCard, { transform: [{ scale: cardScaleAnim }] }]}>
                {/* Top Row: Live badge + light bus illustration */}
                <View style={styles.onboardHeroTopRow}>
                  <View style={styles.onboardLiveBadge}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.onboardLiveBadgeText}>LIVE ONBOARD</Text>
                  </View>
                  <View style={styles.onboardIllustrationWrapper} pointerEvents="none">
                    <EditorialBusIllustration
                      width={86}
                      height={36}
                      color="rgba(255, 255, 255, 0.85)"
                      wheelBg="#101A72"
                      accentColor="#93C5FD"
                    />
                  </View>
                </View>

                {/* Next Stop Label */}
                <Text style={styles.onboardHeroNextStopLabel}>
                  {isBeforeDeparture ? 'DEPARTING FROM' : isJourneyCompleted ? 'DESTINATION' : 'NEXT STOP'}
                </Text>

                {/* Station Name */}
                <Text style={styles.onboardHeroNextStopTitle} numberOfLines={1}>
                  {heroStationName}
                </Text>

                {/* Arrival Status */}
                <View style={styles.onboardHeroEtaRow}>
                  <View style={styles.onboardHeroEtaBadge}>
                    <Text style={styles.onboardHeroEtaText}>
                      {heroEtaBadgeText}
                    </Text>
                  </View>
                </View>

                {/* Hairline Divider */}
                <View style={styles.onboardHeroDivider} />

                {/* Route & Towards Destination context */}
                <View style={styles.onboardHeroRouteMeta}>
                  <Text style={styles.onboardHeroTowardsText} numberOfLines={1}>
                    Towards {journey.toStop.shortName || journey.toStop.name}
                  </Text>
                  <Text style={styles.onboardHeroServiceBadge}>
                    {journey.routeBadge || journey.trip.routeNumber} · {journey.trip.serviceName || 'AC Express'}
                  </Text>
                </View>

                {/* Stops Remaining with thin progress bar */}
                <View style={styles.onboardHeroProgressContainer}>
                  <Text style={styles.onboardHeroStopsRemainingText}>
                    {onboardStopsLeftCount} stops remaining
                  </Text>
                  <View style={styles.onboardHeroProgressBarTrack}>
                    <View
                      style={[
                        styles.onboardHeroProgressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.max(
                              10,
                              Math.round(
                                ((journey.intermediateStops.length - onboardStopsLeftCount) /
                                  Math.max(1, journey.intermediateStops.length)) *
                                  100
                              )
                            )
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* 2. DROP-OFF REMINDER CARD */}
              <TouchableOpacity
                style={styles.compactReminderCard}
                onPress={handleScheduleNotifications}
                activeOpacity={0.8}
              >
                <View style={styles.compactReminderIconBox}>
                  {activeReminders.length > 0 ? (
                    <BellRing size={16} color="#F26B52" strokeWidth={2.4} />
                  ) : (
                    <Bell size={16} color="#F26B52" strokeWidth={2.4} />
                  )}
                </View>
                <View style={styles.compactReminderTextBox}>
                  <Text style={styles.compactReminderTitle}>Drop-off reminder</Text>
                  <Text style={styles.compactReminderSubtitle} numberOfLines={1}>
                    {activeReminders.length > 0
                      ? `Alert active: 1 stop before ${journey.toStop.shortName || journey.toStop.name}`
                      : `Alert me 1 stop before ${journey.toStop.shortName || journey.toStop.name}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.compactReminderBtn,
                    activeReminders.length > 0 && styles.compactReminderBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.compactReminderBtnText,
                      activeReminders.length > 0 && styles.compactReminderBtnTextActive,
                    ]}
                  >
                    {activeReminders.length > 0 ? 'Active' : 'Set reminder'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 3. YOUR JOURNEY (COMPACT ROUTE PROGRESS MAP) */}
              <View style={styles.compactJourneyCard}>
                <View style={styles.compactJourneyHeader}>
                  <View style={styles.compactJourneyHeaderLeft}>
                    <Text style={styles.compactJourneyTitle}>YOUR JOURNEY</Text>
                    {!isLiveClock && (
                      <View style={styles.compactJourneySimBadge}>
                        <Text style={styles.compactJourneySimBadgeText}>PREVIEW</Text>
                      </View>
                    )}
                  </View>

                  {!isLiveClock ? (
                    <TouchableOpacity
                      style={styles.compactJourneyResetLiveBtn}
                      onPress={() => {
                        setIsLiveClock(true);
                        setCurrentTimeMins(getCurrentMinutesOfDay());
                      }}
                      activeOpacity={0.7}
                    >
                      <RotateCcw size={11} color="#18258F" strokeWidth={2.4} />
                      <Text style={styles.compactJourneyResetLiveText}>Reset to Live</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.compactJourneyStopsLeftWrap}>
                      <View style={styles.liveGreenDotSmall} />
                      <Text style={styles.compactJourneyStopsLeft}>
                        {onboardStopsLeftCount} {onboardStopsLeftCount === 1 ? 'stop' : 'stops'} left
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.compactJourneyList}>
                  {displayedOnboardStops.map(({ stop: stopItem, originalIndex }, localIndex) => {
                    const isCurrent = originalIndex === activeCurrentStopIdx;
                    const isPassed = originalIndex < activeCurrentStopIdx;
                    const isLast = originalIndex === journey.intermediateStops.length - 1;
                    const isLastInDisplayed = localIndex === displayedOnboardStops.length - 1;
                    const isBoardingStop = isBeforeDeparture && originalIndex === 0;
                    const isArrivedAtDest = isJourneyCompleted && isLast;
                    const minsDiff = Math.max(0, stopItem.mins - currentTimeMins);

                    return (
                      <TouchableOpacity
                        key={`${stopItem.name}_${originalIndex}`}
                        style={[
                          styles.compactJourneyRow,
                          isPassed && styles.compactJourneyRowPassed,
                          isCurrent && styles.compactJourneyRowCurrent,
                        ]}
                        onPress={() => {
                          setCurrentTimeMins(stopItem.mins);
                          setIsLiveClock(false);
                        }}
                        activeOpacity={0.7}
                      >
                        {/* DOT / TRACK CONNECTOR */}
                        <View style={styles.compactJourneyDotCol}>
                          {!isLastInDisplayed && (
                            <View
                              style={[
                                styles.compactJourneyVerticalLine,
                                isPassed && styles.compactJourneyVerticalLinePassed,
                              ]}
                            />
                          )}

                          {isPassed ? (
                            <View style={styles.compactJourneyPassedDotWrap}>
                              <Check size={10} color="#94A3B8" strokeWidth={2.6} />
                            </View>
                          ) : isCurrent ? (
                            <View style={styles.compactJourneyCurrentDotWrap}>
                              <View style={styles.compactJourneyCurrentDot} />
                            </View>
                          ) : isLast ? (
                            <View style={styles.compactJourneyDestDot}>
                              <View style={styles.compactJourneyDestDotInner} />
                            </View>
                          ) : (
                            <View style={styles.compactJourneyUpcomingDot} />
                          )}
                        </View>

                        {/* STOP NAME & STATUS / TIME */}
                        <View style={styles.compactJourneyInfoRow}>
                          <Text
                            style={[
                              styles.compactJourneyStationText,
                              isPassed && styles.compactJourneyStationPassed,
                              isCurrent && styles.compactJourneyStationCurrent,
                              isLast && styles.compactJourneyStationDest,
                            ]}
                            numberOfLines={1}
                          >
                            {stopItem.name}
                          </Text>

                          {isBoardingStop ? (
                            <View style={styles.compactJourneyBoardingBadge}>
                              <Text style={styles.compactJourneyBoardingBadgeText}>
                                {journey.departureMins - currentTimeMins <= 5 && journey.departureMins - currentTimeMins > 0
                                  ? `DEPARTS IN ${journey.departureMins - currentTimeMins}M`
                                  : `BOARDING · ${stopItem.time}`}
                              </Text>
                            </View>
                          ) : isArrivedAtDest ? (
                            <View style={styles.compactJourneyArrivedBadge}>
                              <Text style={styles.compactJourneyArrivedBadgeText}>ARRIVED</Text>
                            </View>
                          ) : isCurrent ? (
                            minsDiff <= 1 ? (
                              <View style={styles.compactJourneyNowBadge}>
                                <Text style={styles.compactJourneyNowBadgeText}>ARRIVING NOW</Text>
                              </View>
                            ) : (
                              <View style={styles.compactJourneyInMinBadge}>
                                <Text style={styles.compactJourneyInMinBadgeText}>IN {minsDiff} MIN</Text>
                              </View>
                            )
                          ) : isPassed ? null : (
                            <Text
                              style={[
                                styles.compactJourneyTimeText,
                                isLast && styles.compactJourneyTimeTextDest,
                              ]}
                            >
                              {stopItem.time}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* MORE STOPS / VIEW FULL ROUTE FOOTER */}
                {hiddenUpcomingCount > 0 && !showAllOnboardStops ? (
                  <View style={styles.compactJourneyMoreSection}>
                    <TouchableOpacity
                      onPress={() => setShowAllOnboardStops(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.compactJourneyMoreCount}>
                        + {hiddenUpcomingCount} more stops
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRouteDetailsModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.compactJourneyViewFullRouteLink}>
                        View full route →
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : showAllOnboardStops && journey.intermediateStops.length > 8 ? (
                  <View style={styles.compactJourneyMoreSection}>
                    <TouchableOpacity
                      onPress={() => setShowAllOnboardStops(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.compactJourneyViewFullRouteLink}>
                        Show compact map ↑
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRouteDetailsModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.compactJourneyViewFullRouteLink}>
                        View route details →
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
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
                  accessibilityLabel="Back to journey planner"
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
                  (activePicker === 'from' && fromStation === item.name) ||
                  (activePicker === 'to' && toStation === item.name);

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

      {/* --- ALL POPULAR ROUTES FULL-WIDTH MODAL (VIEW ALL) --- */}
      <Modal
        visible={allPopularModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAllPopularModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setAllPopularModalVisible(false)}
          />

          <View style={styles.drawerContainer}>
            {/* SEARCH PILL BAR WITH INLINE BACK ARROW */}
            <View style={[styles.searchHeaderWrapper, { paddingTop: Math.max(insets.top, 14) }]}>
              <View style={styles.searchPillContainer}>
                <TouchableOpacity
                  onPress={() => setAllPopularModalVisible(false)}
                  style={styles.searchBackBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Close popular routes"
                >
                  <ArrowLeft size={20} color="#10131A" strokeWidth={2.2} />
                </TouchableOpacity>

                <TextInput
                  style={[styles.searchInputPill, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
                  placeholder="Search popular routes or stops..."
                  placeholderTextColor="#9CA3AF"
                  value={popularSearchQuery}
                  onChangeText={setPopularSearchQuery}
                  autoFocus={false}
                />

                {popularSearchQuery ? (
                  <TouchableOpacity
                    onPress={() => setPopularSearchQuery('')}
                    style={styles.searchClearBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* CATEGORY FILTER CHIPS */}
            <View style={styles.categoryChipsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsScroll}>
                {[
                  { id: 'all', label: 'All Routes' },
                  { id: 'secretariat', label: 'Govt Secretariat' },
                  { id: 'campus', label: 'Colleges & IIIT' },
                  { id: 'tourist', label: 'Tourist & Safari' },
                  { id: 'hospital', label: 'Hospitals' },
                  { id: 'shuttle', label: 'Feeder & Loops' },
                ].map(chip => (
                  <TouchableOpacity
                    key={chip.id}
                    onPress={() => setPopularCategory(chip.id as any)}
                    style={[
                      styles.categoryChip,
                      popularCategory === chip.id && styles.categoryChipActive,
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        popularCategory === chip.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* SECTION TITLE */}
            <View style={styles.searchSectionHeaderRow}>
              <Text style={styles.searchSectionTitle}>
                {popularSearchQuery ? `Matching Routes (${filteredPopularRoutes.length})` : `Popular Routes (${filteredPopularRoutes.length})`}
              </Text>
            </View>

            {/* FLATLIST OF POPULAR ROUTE CARDS */}
            <FlatList
              data={filteredPopularRoutes}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.drawerListContent, { paddingHorizontal: 16 }]}
              renderItem={({ item }) => {
                const routeFare = getFare(item.from, item.to) || item.fare;
                return (
                  <TouchableOpacity
                    style={styles.popularCard}
                    onPress={() => selectPopularRoute(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.popularIconWrap}>
                      <Bus size={20} color="#18258F" strokeWidth={2.2} />
                    </View>

                    <View style={styles.popularInfoCol}>
                      <View style={styles.popularTitleRow}>
                        <Text style={styles.popularStationText}>{item.fromDisplay}</Text>
                        <ArrowRight size={12} color="#94A3B8" strokeWidth={2.2} style={{ marginHorizontal: 6 }} />
                        <Text style={styles.popularStationText}>{item.toDisplay}</Text>
                      </View>
                      <Text style={styles.popularMetaText}>
                        {item.typicalDuration}  ·  {item.tag}
                      </Text>
                    </View>

                    <View style={styles.popularRightCol}>
                      <View style={styles.popularFareBadge}>
                        <Text style={styles.popularFareBadgeText}>₹{routeFare}</Text>
                      </View>
                      <ChevronRight size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.drawerEmptyBox}>
                  <Text style={styles.drawerEmptyText}>
                    Koi route nahi mila "{popularSearchQuery}" ke liye
                  </Text>
                  <Text style={styles.drawerEmptySub}>
                    Try clearing filters or search by station name
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* --- ROUTE DETAILS POPUP MODAL (PREMIUM THEMED SHEET) --- */}
      <Modal
        visible={routeDetailsModalVisible && !!journey}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRouteDetailsModalVisible(false)}
      >
        <View style={styles.routeModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setRouteDetailsModalVisible(false)}
          />

          {journey && (
            <View style={styles.routeModalContainer}>
              {/* TOP DRAG HANDLE */}
              <View style={styles.routeModalDragHandle} />

              {/* MODAL HEADER */}
              <View style={styles.routeModalHeaderRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={styles.routeModalBadgeRow}>
                    <View style={styles.routeModalCategoryBadge}>
                      <Text style={styles.routeModalCategoryBadgeText}>CORRIDOR ROUTE</Text>
                    </View>
                    <View style={styles.routeModalLiveStatusPill}>
                      <View style={styles.routeModalLiveDot} />
                      <Text style={styles.routeModalLiveText}>On schedule</Text>
                    </View>
                  </View>
                  <Text style={styles.routeModalTitle}>Route Details</Text>
                  <Text style={styles.routeModalSubtitle} numberOfLines={1}>
                    {journey.fromStop.shortName} → {journey.toStop.shortName}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setRouteDetailsModalVisible(false)}
                  style={styles.routeModalCloseBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  accessibilityLabel="Close route details"
                >
                  <X size={18} color="#475569" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* SCROLLABLE ROUTE DETAILS */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.routeModalScrollContent,
                  { paddingBottom: Math.max(insets.bottom, 20) + 16 },
                ]}
              >
                {/* 1. ROYAL NAVY HERO CARD */}
                <View style={styles.routeModalHeroCard}>
                  {/* HERO TOP BADGES */}
                  <View style={styles.routeModalHeroTop}>
                    <View style={styles.routeModalHeroPillGroup}>
                      <View style={styles.routeModalRoutePill}>
                        <Text style={styles.routeModalRoutePillText}>
                          {journey.routeBadge || journey.trip.routeNumber}
                        </Text>
                      </View>
                      <View style={styles.routeModalServicePill}>
                        <Text style={styles.routeModalServicePillText}>
                          {journey.trip.serviceName || 'AC Express'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.routeModalFareTag}>₹{journey.fare}</Text>
                  </View>

                  {/* ORIGIN & DESTINATION JOURNEY PATH */}
                  <View style={styles.routeModalPathRow}>
                    <View style={styles.routeModalPathStationCol}>
                      <View style={styles.routeModalPathDotOrigin} />
                      <Text style={styles.routeModalStationName} numberOfLines={1}>
                        {journey.fromStop.name}
                      </Text>
                      <Text style={styles.routeModalTimeText}>
                        Dep {journey.fromTime}
                      </Text>
                    </View>

                    <View style={styles.routeModalPathMidCol}>
                      <ArrowRight size={16} color="#93C5FD" strokeWidth={2.2} />
                      <Text style={styles.routeModalDurationPill}>
                        {journey.durationMins}m
                      </Text>
                    </View>

                    <View style={[styles.routeModalPathStationCol, { alignItems: 'flex-end' }]}>
                      <View style={styles.routeModalPathDotDest} />
                      <Text style={[styles.routeModalStationName, { textAlign: 'right' }]} numberOfLines={1}>
                        {journey.toStop.name}
                      </Text>
                      <Text style={[styles.routeModalTimeText, { textAlign: 'right' }]}>
                        Arr {journey.toTime}
                      </Text>
                    </View>
                  </View>

                  {/* METRIC STATS ROW */}
                  <View style={styles.routeModalStatsRow}>
                    <View style={styles.routeModalStatBox}>
                      <Clock size={13} color="#BFDBFE" strokeWidth={2.2} />
                      <Text style={styles.routeModalStatVal}>{journey.durationMins} min</Text>
                      <Text style={styles.routeModalStatLabel}>Duration</Text>
                    </View>
                    <View style={styles.routeModalStatDivider} />
                    <View style={styles.routeModalStatBox}>
                      <MapPin size={13} color="#BFDBFE" strokeWidth={2.2} />
                      <Text style={styles.routeModalStatVal}>
                        {journey.intermediateStops.length} stops
                      </Text>
                      <Text style={styles.routeModalStatLabel}>Stations</Text>
                    </View>
                    <View style={styles.routeModalStatDivider} />
                    <View style={styles.routeModalStatBox}>
                      <Zap size={13} color="#BFDBFE" strokeWidth={2.2} />
                      <Text style={styles.routeModalStatVal}>15-20 min</Text>
                      <Text style={styles.routeModalStatLabel}>Frequency</Text>
                    </View>
                  </View>
                </View>

                {/* 2. TRANSFER CALLOUT (IF APPLICABLE) */}
                {journey.isTransfer && journey.transferHub && (
                  <View style={styles.routeModalTransferNotice}>
                    <View style={styles.routeModalTransferNoticeHeader}>
                      <Info size={15} color="#18258F" strokeWidth={2.2} />
                      <Text style={styles.routeModalTransferNoticeTitle}>
                        Transfer Hub: {journey.transferHub}
                      </Text>
                    </View>
                    <Text style={styles.routeModalTransferNoticeText}>
                      Change at {journey.transferHub} to {journey.connectingTrip?.routeNumber || 'connecting feeder'}. Expected wait time: ~{journey.transferWaitMins ?? 5} min.
                    </Text>
                  </View>
                )}

                {/* 3. STOPS TIMELINE SECTION */}
                <View style={styles.routeModalTimelineSection}>
                  <View style={styles.routeModalSectionHeaderRow}>
                    <Text style={styles.routeModalSectionTitle}>STOPS & SCHEDULE</Text>
                    <Text style={styles.routeModalSectionCount}>
                      {journey.intermediateStops.length} stations
                    </Text>
                  </View>

                  <View style={styles.routeModalTimelineList}>
                    {journey.intermediateStops.map((stopItem, index) => {
                      const isFirst = index === 0;
                      const isLast = index === journey.intermediateStops.length - 1;

                      return (
                        <View key={`${stopItem.name}_${index}`} style={styles.routeModalTimelineItem}>
                          {/* TIMELINE INDICATOR COLUMN */}
                          <View style={styles.routeModalTimelineIndicatorCol}>
                            {!isLast && <View style={styles.routeModalTimelineLine} />}

                            {isFirst ? (
                              <View style={styles.routeModalOriginDot}>
                                <View style={styles.routeModalOriginDotInner} />
                              </View>
                            ) : isLast ? (
                              <View style={styles.routeModalDestDot}>
                                <View style={styles.routeModalDestDotInner} />
                              </View>
                            ) : (
                              <View style={styles.routeModalIntermediateDot} />
                            )}
                          </View>

                          {/* STATION INFO */}
                          <View style={[styles.routeModalTimelineInfoRow, isLast && { paddingBottom: 6 }]}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Text
                                  style={[
                                    styles.routeModalStationTitle,
                                    (isFirst || isLast) && styles.routeModalStationTitleBold,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {stopItem.name}
                                </Text>

                                {isFirst ? (
                                  <View style={styles.routeModalBoardingTag}>
                                    <Text style={styles.routeModalBoardingTagText}>Boarding</Text>
                                  </View>
                                ) : isLast ? (
                                  <View style={styles.routeModalDropoffTag}>
                                    <Text style={styles.routeModalDropoffTagText}>Drop-off</Text>
                                  </View>
                                ) : null}
                              </View>

                              <Text style={styles.routeModalStationCode}>
                                {stopItem.code ? `Platform ${stopItem.code}` : 'BRTS Dedicated Shelter'}
                              </Text>
                            </View>

                            {/* SCHEDULE TIME */}
                            <Text
                              style={[
                                styles.routeModalTimeColText,
                                (isFirst || isLast) && styles.routeModalTimeColTextBold,
                              ]}
                            >
                              {stopItem.time}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* 4. OFFICIAL SERVICE FOOTNOTE */}
                <View style={styles.routeModalFootnoteBox}>
                  <ShieldCheck size={14} color="#059669" strokeWidth={2.2} />
                  <Text style={styles.routeModalFootnoteText}>
                    Official Nava Raipur Tatpar BRTS service · Automatic RFID / GPS tracking
                  </Text>
                </View>

                {/* 5. CLOSE ACTION BUTTON */}
                <TouchableOpacity
                  style={styles.routeModalDoneBtn}
                  onPress={() => setRouteDetailsModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.routeModalDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </ScrollView>
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
    backgroundColor: '#F7F7F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  contentContainer: {
    paddingBottom: 110,
  },
  /* RED-BUS STYLE 2-SECTION TOP HEADER */
  topTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#ECEEF2',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 2,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  topTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  topTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 7,
  },
  topTabIconBox: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  topTabLabel: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
  topTabLabelActive: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#18258F',
  },
  topTabLabelInactive: {
    fontFamily: FONT.medium,
    fontWeight: '500',
    color: '#64748B',
  },
  topTabIndicator: {
    width: '88%',
    height: 3,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  topTabIndicatorActive: {
    backgroundColor: '#18258F', // Signature Royal Blue underline bar
  },

  /* HERO BANNER (INITIAL UNSEARCHED STATE) */
  heroBannerContainer: {
    width: '100%',
    aspectRatio: 1671 / 941,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.08)',
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
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
    fontFamily: FONT.bold,
    fontSize: 26, // Page title: 26 px / 700
    lineHeight: 32, // Line-height around 32 px
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  pageSubHeading: {
    fontFamily: FONT.medium,
    fontSize: 13.5, // Secondary/supporting: 13–14 px / 500
    lineHeight: 19, // Line-height around 18–20 px
    fontWeight: '500',
    color: '#6B7280',
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
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  stationText: {
    fontFamily: FONT.bold,
    fontSize: 15.5, // Station name: 15–16 px / 700
    lineHeight: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  placeholderText: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
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
    color: '#334155',
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
  /* POPULAR ROUTES (MATCHING USER UPLOADED DESIGN) */
  popularSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  popularSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  popularViewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  popularViewAllText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18258F',
    marginRight: 2,
  },
  popularCardsList: {
    gap: 10,
    marginBottom: 18,
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EFF2F7',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1.5,
  },
  popularIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  popularInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  popularTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularStationText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.1,
  },
  popularMetaText: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
  },
  popularRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  popularFareBadge: {
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 14,
  },
  popularFareBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  categoryChipsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  categoryChipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 18,
    backgroundColor: '#F1F3FA',
  },
  categoryChipActive: {
    backgroundColor: '#18258F',
  },
  categoryChipText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextActive: {
    fontFamily: FONT.bold,
    color: '#FFFFFF',
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
  /* --- REDESIGNED BUS HERO CARD (MATCHING USER UPLOADED DESIGN) --- */
  modernBusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    marginBottom: 20,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 10px 28px rgba(24, 37, 143, 0.07), 0 2px 8px rgba(0, 0, 0, 0.04)',
        } as any)
      : {}),
  },
  busCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  busCardLeftCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  nextBusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  nextBusBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.9,
  },
  busCardTimeText: {
    fontFamily: FONT.extraBold,
    fontSize: 32,
    fontWeight: '800',
    color: '#0B132B',
    letterSpacing: -0.6,
    marginTop: 6,
    marginBottom: 1,
    fontVariant: ['tabular-nums'],
  },
  busCardRouteCodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  busCardRouteCodes: {
    fontFamily: FONT.extraBold,
    fontSize: 20,
    fontWeight: '800',
    color: '#0B132B',
    letterSpacing: -0.3,
  },
  busCardArrow: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  busCardStationNames: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  busCardRightIllustration: {
    width: 130,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  busCard3DImage: {
    width: 130,
    height: 82,
  },
  busCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  busCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  busCardBottomMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  busCardMetaTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  busCardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  busCardMetaTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B132B',
    letterSpacing: -0.2,
  },
  busCardMetaSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  busCardVerticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#EDF2F7',
    marginHorizontal: 2,
    flexShrink: 0,
  },
  busCardCountdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    flexShrink: 0,
  },
  busCardCountdownTextCol: {
    alignItems: 'flex-start',
  },
  busCardCountdownPreLabel: {
    fontFamily: FONT.bold,
    fontSize: 7.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  busCardCountdownValue: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0B132B',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  busCardChevronBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* USER PREFERRED HERO CARD STYLES */
  heroLiveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  heroLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  heroLiveBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  heroRouteMetaText: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginTop: 6,
  },
  heroDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  heroDepartsInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroDepartsInLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  heroDepartsInValue: {
    fontFamily: FONT.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#18258F',
  },

  /* NEXT DEPARTURES MINIMAL TEXT ROW */
  cleanNextDeparturesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#F1F5F9',
  },
  cleanNextDeparturesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cleanNextDeparturesTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cleanViewFullTimetableLink: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#18258F',
  },
  cleanNextDeparturesTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cleanNextDepBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  cleanNextDepTimeText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cleanNextDepTimeTextSelected: {
    color: '#18258F',
  },
  cleanNextDepDot: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cleanNextDeparturesCardExpanded: {
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cleanDeparturesCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanDeparturesExpandedContent: {
    marginTop: 8,
  },
  cleanDeparturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  cleanDepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  cleanDepPillSelected: {
    backgroundColor: '#18258F',
    borderColor: '#18258F',
  },
  cleanDepPillRoute: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  cleanDepPillRouteSelected: {
    color: '#93C5FD',
  },
  cleanDepPillTime: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  cleanDepPillTimeSelected: {
    color: '#FFFFFF',
  },
  cleanDepSelectedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
  },
  cleanDeparturesHintText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },

  /* ROUTE STATUS COMPONENT (REPLACES TRAVEL TIME & FARE CARDS) */
  cleanRouteStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#F1F5F9',
  },
  cleanRouteStatusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cleanRouteStatusLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cleanRouteStatusLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cleanStatusGreenDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  cleanRouteStatusLiveText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  cleanRouteStatusStations: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cleanRouteStatusBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cleanRouteStatusDetails: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  cleanRouteStatusViewBtn: {
    paddingVertical: 2,
    paddingLeft: 6,
  },
  cleanRouteStatusViewText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#18258F',
  },

  /* COMPACT DEPARTURE REMINDER */
  compactReminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(23, 38, 143, 0.08)',
  },
  compactReminderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  compactReminderTextBox: {
    flex: 1,
    marginRight: 8,
  },
  compactReminderTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  compactReminderSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  compactReminderBtn: {
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  compactReminderBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  compactReminderBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#EA580C',
  },
  compactReminderBtnTextActive: {
    color: '#FFFFFF',
  },

  /* VIEW TIMETABLE FOOTER CTA */
  cleanTimetableFooterCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cleanTimetableFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cleanTimetableFooterText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#18258F',
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
  /* --- REDESIGNED "NO BUSES LEFT TODAY" CARD (MATCHING UPLOADED IMAGE 1) --- */
  noServiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFF2F7',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  noServiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noServiceLeftCol: {
    flex: 1,
    paddingRight: 8,
  },
  noServiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEECEC',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    marginBottom: 10,
  },
  noServiceBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 5,
  },
  noServiceTitle: {
    fontFamily: FONT.bold,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  noServiceSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18.5,
    color: '#4B5563',
    marginTop: 6,
  },
  noServiceIllustrationWrap: {
    width: 140,
    height: 82,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 6,
  },
  noServiceRouteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginTop: 16,
    marginBottom: 12,
  },
  noServiceRouteCol: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePinTrack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    marginRight: 10,
  },
  routePinDashLine: {
    width: 1.5,
    height: 10,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  routePinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
  },
  routePinTextCol: {
    flex: 1,
  },
  routeMicroLabel: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  routeCodeText: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  routeStationNameText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noServiceDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  noServiceBusCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noServiceBusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noServiceBusTextCol: {
    flex: 1,
  },
  busRouteNumText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  busRouteStatusText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  noServiceNextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noServiceCalendarIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noServiceNextTextCol: {
    flex: 1,
  },
  nextServiceMicroLabel: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  nextServiceTimeText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '800',
    color: '#18258F',
    marginTop: 1,
  },
  nextServiceSubText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
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
    color: '#64748B', // Clean neutral slate label
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
    color: '#0F172A', // Punchy deep black typography
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
    color: '#0F172A',
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
    color: '#0F172A',
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
    color: '#0F172A',
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
    color: '#0F172A',
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
  legHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legHeaderBadge: {
    backgroundColor: '#18258F',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  legHeaderBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  legHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  timelineDotTransfer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  timelineDotBoarding2: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  transferTagBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  transferTagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#18258F',
  },
  timelineInterchangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    gap: 10,
  },
  timelineInterchangeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineInterchangeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timelineInterchangeSub: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  timelineInterchangeDepBadge: {
    backgroundColor: '#18258F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timelineInterchangeDepText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timelineTimeText: {
    fontSize: 13,
  },
  timelineTimeBold: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
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
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
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
    paddingVertical: 3.5,
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
    top: 12,
    right: 14,
    zIndex: 1,
    opacity: 0.82,
  },
  onboardHeroNextStopLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.72)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  onboardHeroNextStopTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  onboardHeroEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  onboardHeroEtaBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  onboardHeroEtaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.2,
  },
  onboardHeroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 10,
  },
  onboardHeroRouteMeta: {
    marginTop: 2,
  },
  onboardHeroTowardsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  onboardHeroServiceBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#C7D2FE',
    marginTop: 2,
  },
  onboardHeroProgressContainer: {
    marginTop: 10,
  },
  onboardHeroStopsRemainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BFDBFE',
    marginBottom: 5,
  },
  onboardHeroProgressBarTrack: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  onboardHeroProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  /* COMPACT ONBOARD JOURNEY MAP */
  compactJourneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 96,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  compactJourneyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  compactJourneyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactJourneySimBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  compactJourneySimBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  compactJourneyStopsLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  compactJourneyResetLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 4,
  },
  compactJourneyResetLiveText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#18258F',
  },
  compactJourneyTitle: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  compactJourneyStopsLeft: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#18258F',
  },
  compactJourneyList: {
    position: 'relative',
  },
  compactJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  compactJourneyRowPassed: {
    minHeight: 26,
    paddingVertical: 2,
  },
  compactJourneyRowCurrent: {
    backgroundColor: 'rgba(24, 37, 143, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginVertical: 2,
  },
  compactJourneyDotCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 10,
    alignSelf: 'stretch',
  },
  compactJourneyVerticalLine: {
    position: 'absolute',
    top: 14,
    bottom: -14,
    width: 2,
    backgroundColor: '#E2E8F0',
    left: 9,
    zIndex: 1,
  },
  compactJourneyVerticalLinePassed: {
    backgroundColor: '#CBD5E1',
  },
  compactJourneyPassedDotWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: '#FFFFFF',
  },
  compactJourneyCurrentDotWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(24, 37, 143, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  compactJourneyCurrentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#18258F',
    zIndex: 2,
  },
  compactJourneyUpcomingDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  compactJourneyDestDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  compactJourneyDestDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  compactJourneyInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactJourneyStationText: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 10,
  },
  compactJourneyStationPassed: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#94A3B8',
  },
  compactJourneyStationCurrent: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  compactJourneyStationDest: {
    fontFamily: FONT.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  compactJourneyNowBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.15)',
  },
  compactJourneyNowBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.5,
  },
  compactJourneyBoardingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  compactJourneyBoardingBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  compactJourneyArrivedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  compactJourneyArrivedBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  compactJourneyInMinBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactJourneyInMinBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.4,
  },
  compactJourneyTimeText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  compactJourneyTimeTextDest: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },
  compactJourneyMoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 2,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  compactJourneyMoreCount: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  compactJourneyViewFullRouteLink: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#18258F',
  },
  onboardLightRouteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  onboardLightRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  onboardLightRouteTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  onboardLightRouteSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18258F',
  },
  lightTimelineWrapper: {
    paddingLeft: 4,
  },
  lightTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  lightTimelineRowNext: {
    backgroundColor: '#EEF2FF',
  },
  lightTimelineLineCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  lightTimelineLine: {
    position: 'absolute',
    top: 16,
    bottom: -22,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  lightTimelineLinePassed: {
    backgroundColor: '#94A3B8',
  },
  lightDotPassed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lightDotNext: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lightDotNextInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  lightDotDest: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lightDotDestInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#18258F',
  },
  lightDotFuture: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    zIndex: 2,
  },
  lightTimelineContentCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  lightTimelineStation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  lightTimelineStationPassed: {
    color: '#94A3B8',
  },
  lightTimelineStationNext: {
    color: '#18258F',
    fontWeight: '800',
    fontSize: 14.5,
  },
  lightTimelineStationDest: {
    color: '#0F172A',
    fontWeight: '700',
  },
  lightTimelineStatusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lightPassedCheckmark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  lightNextTag: {
    backgroundColor: '#18258F',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  lightNextTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lightDestTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18258F',
  },
  lightFutureTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  onboardLightRouteFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onboardViewFullRouteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  onboardViewFullRouteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18258F',
  },
  howTrackingWorksBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  howTrackingWorksText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  onboardRouteSubLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 1,
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
    color: '#0F172A',
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
    color: '#0F172A',
  },
  depTimeTextFuture: {
    fontWeight: '600',
    color: '#0F172A',
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
  depCardDeparted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  depTimeTextDeparted: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  depStatusTextDeparted: {
    fontWeight: '700',
    color: '#94A3B8',
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
  transferProximityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  transferProximityPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  busChangeGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  busChangeGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  busChangeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busChangeGuideTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  busChangeCountBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  busChangeCountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#18258F',
  },
  busChangeGuideSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  busChangeStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  busChangeStepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  busChangeStepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  busChangeStepBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  busChangeStepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  busChangeRoutePillLeg1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#18258F',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  busChangeRoutePillLeg2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  busChangeRoutePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  busChangeStepTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18258F',
  },
  busChangeStepDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  busChangeBoldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  busChangeInterchangeStep: {
    paddingLeft: 10,
    marginVertical: 4,
  },
  busChangeInterchangeLine: {
    width: 2,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginLeft: 1,
  },
  busChangeInterchangeContent: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginLeft: 12,
    marginTop: -4,
    marginBottom: 6,
  },
  busChangeInterchangeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
  },
  busChangeInterchangeSub: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
  },
  busChangeProximityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 8,
  },
  busChangeProximityTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  busChangeProximitySub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  busChangeProximityBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  nearbyAlternativeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  nearbyAltHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  nearbyAltIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyAltTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  nearbyAltSavePill: {
    backgroundColor: '#047857',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nearbyAltSavePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  nearbyAltSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
  },
  nearbyAltItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  nearbyAltStationName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  nearbyAltDistText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },
  nearbyAltTripDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  nearbyAltSwitchBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyAltSwitchBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reachableNowPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reachableNowPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  serviceEndedCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceEndedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceEndedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceEndedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  serviceEndedSub: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 16,
  },
  serviceEndedOptionsWrap: {
    marginTop: 10,
    gap: 8,
  },
  serviceEndedOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  serviceEndedStopName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceEndedDistBadge: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#047857',
  },
  serviceEndedTripInfo: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  serviceEndedSwitchBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceEndedSwitchBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroAlternativeHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    marginTop: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  heroAlternativeHintText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FDE68A',
  },
  noRouteContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  noRouteHeader: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  noRouteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noRouteHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#991B1B',
    textAlign: 'center',
  },
  noRouteHeaderSub: {
    fontSize: 12.5,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  noRouteSuggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  noRouteSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  noRouteSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  noRouteSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  noRouteAltCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  noRouteAltStationName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  noRouteAltDistText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },
  noRouteAltDetail: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  noRouteAltBtn: {
    backgroundColor: '#18258F',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRouteAltBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noRouteHubList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  noRouteHubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noRouteHubChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18258F',
  },

  proximityOptimizedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  proximityOptimizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proximityOptimizedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  proximityOptimizedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  proximityOptimizedSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },

  // SMART ROUTE RECOMMENDATION CARD STYLES
  smartRouteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  smartRouteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smartRouteLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  smartRoutePreLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  smartRouteFasterBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  smartRouteFasterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  smartRouteBody: {
    marginBottom: 12,
  },
  smartRouteTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  smartRouteSubMetrics: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  smartRouteBusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  smartRouteBusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  smartRouteBusText: {
    fontSize: 12.5,
    color: '#334155',
    flex: 1,
  },
  smartRouteBusBold: {
    fontWeight: '700',
    color: '#18258F',
  },
  smartRouteViewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  smartRouteViewBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#18258F',
  },
  smartRouteAltRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  smartRouteAltLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  smartRouteAltText: {
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },

  /* --- ROUTE DETAILS POPUP MODAL STYLES --- */
  routeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  routeModalContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  routeModalDragHandle: {
    width: 38,
    height: 4.5,
    backgroundColor: '#D0D5DD',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  routeModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  routeModalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routeModalCategoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  routeModalCategoryBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.6,
  },
  routeModalLiveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    gap: 4,
  },
  routeModalLiveDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  routeModalLiveText: {
    fontFamily: FONT.semiBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#059669',
  },
  routeModalTitle: {
    fontFamily: FONT.bold,
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  routeModalSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  routeModalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeModalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  routeModalHeroCard: {
    backgroundColor: '#18258F',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  routeModalHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  routeModalHeroPillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeModalRoutePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  routeModalRoutePillText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  routeModalServicePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  routeModalServicePillText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: '#E0E7FF',
  },
  routeModalFareTag: {
    fontFamily: FONT.bold,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routeModalPathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  routeModalPathStationCol: {
    flex: 1,
  },
  routeModalPathDotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginBottom: 4,
  },
  routeModalPathDotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
    marginBottom: 4,
  },
  routeModalStationName: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routeModalTimeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: '#93C5FD',
    marginTop: 2,
  },
  routeModalPathMidCol: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 2,
  },
  routeModalDurationPill: {
    fontFamily: FONT.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#BFDBFE',
    marginTop: 2,
  },
  routeModalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingTop: 12,
  },
  routeModalStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  routeModalStatVal: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },
  routeModalStatLabel: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    fontWeight: '400',
    color: '#BFDBFE',
    marginTop: 1,
  },
  routeModalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  routeModalTransferNotice: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#D8E2FD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  routeModalTransferNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  routeModalTransferNoticeTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#18258F',
  },
  routeModalTransferNoticeText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  routeModalTimelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  routeModalSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  routeModalSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  routeModalSectionCount: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#18258F',
  },
  routeModalTimelineList: {
    paddingLeft: 4,
  },
  routeModalTimelineItem: {
    flexDirection: 'row',
    minHeight: 46,
  },
  routeModalTimelineIndicatorCol: {
    width: 26,
    alignItems: 'center',
  },
  routeModalTimelineLine: {
    position: 'absolute',
    top: 14,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  routeModalOriginDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#18258F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeModalOriginDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  routeModalDestDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeModalDestDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  routeModalIntermediateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
    marginTop: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  routeModalTimelineInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingBottom: 16,
  },
  routeModalStationTitle: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
  },
  routeModalStationTitleBold: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeModalBoardingTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeModalBoardingTagText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#18258F',
  },
  routeModalDropoffTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeModalDropoffTagText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  routeModalStationCode: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    fontWeight: '400',
    color: '#94A3B8',
    marginTop: 2,
  },
  routeModalTimeColText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  routeModalTimeColTextBold: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: '#0F172A',
  },
  routeModalFootnoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeModalFootnoteText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
  },
  routeModalDoneBtn: {
    backgroundColor: '#18258F',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  routeModalDoneBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
