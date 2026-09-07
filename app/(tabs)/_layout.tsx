import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  BackHandler,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Home, MapPin, Calendar, IndianRupee } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(16, insets.bottom + 6);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).__handleAppBack = () => {
      if (typeof (window as any).__handleActiveScreenBack === 'function') {
        const handled = (window as any).__handleActiveScreenBack();
        if (handled) return true;
      }
      if (state.index !== 0) {
        navigation.navigate('index');
        return true;
      }
      return false;
    };

    if ((window as any).ReactNativeWebView?.postMessage) {
      try {
        if (state.index !== 0) {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'CAN_GO_BACK', canGoBack: true })
          );
        }
      } catch (e) {}
    }
  }, [state.index, navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (typeof window !== 'undefined' && typeof (window as any).__handleActiveScreenBack === 'function') {
        const handled = (window as any).__handleActiveScreenBack();
        if (handled) return true;
      }
      if (state.index !== 0) {
        navigation.navigate('index');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [state.index, navigation]);

  const bottomPadding = Math.max(8, insets.bottom);

  return (
    <View style={[styles.bottomBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const label =
          options.title !== undefined
            ? options.title
            : route.name === 'index'
            ? 'Home'
            : route.name === 'stops'
            ? 'Stops'
            : route.name === 'timetable'
            ? 'Schedule'
            : 'Fares';

        const color = isFocused ? '#2438B8' : '#667085';
        const strokeWidth = isFocused ? 2.3 : 1.8;
        const size = 20;

        const renderIcon = () => {
          switch (route.name) {
            case 'index':
              return <Home size={size} color={color} strokeWidth={strokeWidth} />;
            case 'stops':
              return <MapPin size={size} color={color} strokeWidth={strokeWidth} />;
            case 'timetable':
              return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
            case 'fares':
              return <IndianRupee size={size} color={color} strokeWidth={strokeWidth} />;
            default:
              return <Home size={size} color={color} strokeWidth={strokeWidth} />;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
          >
            <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
              {renderIcon()}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color },
                isFocused && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="stops" options={{ title: 'Stops' }} />
      <Tabs.Screen name="timetable" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="fares" options={{ title: 'Fares' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E4E7EC',
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 999,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 20px rgba(16, 24, 40, 0.06)',
        } as any)
      : {}),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 42,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 2,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(36, 56, 184, 0.08)',
  },
  tabLabel: {
    fontFamily: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_500Medium',
    }),
    fontSize: 11,
    fontWeight: '500',
    color: '#667085',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontFamily: Platform.select({
      web: "'Plus Jakarta Sans', sans-serif",
      default: 'PlusJakartaSans_700Bold',
    }),
    fontWeight: '700',
    color: '#2438B8',
  },
});






