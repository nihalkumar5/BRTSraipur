import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Bus, MapPin, Clock, IndianRupee } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(16, insets.bottom + 6);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const TILE_SIZE = 44;
  const NUM_TABS = state.routes.length;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setTabBarWidth(width);
  };

  useEffect(() => {
    if (tabBarWidth > 0) {
      const horizontalPadding = 8;
      const tabWidth = (tabBarWidth - horizontalPadding * 2) / NUM_TABS;
      const targetX = horizontalPadding + state.index * tabWidth + (tabWidth - TILE_SIZE) / 2;

      Animated.spring(translateX, {
        toValue: targetX,
        useNativeDriver: Platform.OS !== 'web',
        damping: 18,
        stiffness: 220,
        mass: 0.8,
      }).start();
    }
  }, [state.index, tabBarWidth]);

  return (
    <View
      style={[
        styles.tabBar,
        { bottom: bottomOffset },
        Platform.OS === 'web'
          ? ({
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            } as any)
          : {},
      ]}
      onLayout={onLayout}
    >
      {/* 44x44 ACTIVE NAVY CIRCLE/CAPSULE (STEADY BASELINE) */}
      {tabBarWidth > 0 && (
        <Animated.View
          style={[
            styles.activeBlueTile,
            {
              width: TILE_SIZE,
              height: TILE_SIZE,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {/* 4 EQUAL TAB SECTIONS */}
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

        const renderIcon = () => {
          const iconColor = isFocused ? '#FFFFFF' : '#64748B';
          const strokeWidth = 1.85;
          const size = 21;

          switch (route.name) {
            case 'index':
              return <Bus size={size} color={iconColor} strokeWidth={strokeWidth} />;
            case 'stops':
              return <MapPin size={size} color={iconColor} strokeWidth={strokeWidth} />;
            case 'timetable':
              return <Clock size={size} color={iconColor} strokeWidth={strokeWidth} />;
            case 'fares':
              return <IndianRupee size={size} color={iconColor} strokeWidth={strokeWidth} />;
            default:
              return <Bus size={size} color={iconColor} strokeWidth={strokeWidth} />;
          }
        };

        const accessibilityLabel =
          options.title !== undefined
            ? options.title
            : route.name === 'index'
            ? 'Live Bus'
            : route.name === 'stops'
            ? 'All Stops'
            : route.name === 'timetable'
            ? 'Timetable'
            : 'Fares';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={accessibilityLabel}
          >
            <View style={styles.iconContainer}>{renderIcon()}</View>
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
      <Tabs.Screen name="index" options={{ title: 'Live Bus' }} />
      <Tabs.Screen name="stops" options={{ title: 'All Stops' }} />
      <Tabs.Screen name="timetable" options={{ title: 'Timetable' }} />
      <Tabs.Screen name="fares" options={{ title: 'Fares' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 18,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32, // User spec: Radius 32px
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    elevation: 12,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    zIndex: 100,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        } as any)
      : {}),
  },
  activeBlueTile: {
    position: 'absolute',
    top: 10, // Vertically centered inside 64px height ((64 - 44) / 2 = 10px)
    left: 0,
    backgroundColor: '#18258F', // Navy filled capsule/circle
    borderRadius: 22,
    zIndex: 1,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});






