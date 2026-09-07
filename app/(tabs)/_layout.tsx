import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
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

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View
        style={[
          styles.tabBarContainer,
          Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              } as any)
            : {},
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            LayoutAnimation.configureNext({
              duration: 250,
              update: { type: LayoutAnimation.Types.easeInEaseOut },
            });

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

          const renderIcon = () => {
            const iconColor = isFocused ? '#FFFFFF' : '#E4E4E7';
            const strokeWidth = isFocused ? 2.3 : 1.9;
            const size = 18;

            switch (route.name) {
              case 'index':
                return <Home size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case 'stops':
                return <MapPin size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case 'timetable':
                return <Calendar size={size} color={iconColor} strokeWidth={strokeWidth} />;
              case 'fares':
                return <IndianRupee size={size} color={iconColor} strokeWidth={strokeWidth} />;
              default:
                return <Home size={size} color={iconColor} strokeWidth={strokeWidth} />;
            }
          };

          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.activeTabPill}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
                accessibilityLabel={label}
              >
                <View style={styles.activeIconContainer}>{renderIcon()}</View>
                <Text style={styles.activeTabText} numberOfLines={1}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.inactiveTabCircle}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
              accessibilityLabel={label}
            >
              {renderIcon()}
            </TouchableOpacity>
          );
        })}
      </View>
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
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F12', // Deep pitch dark capsule
    borderRadius: 36,
    padding: 6,
    gap: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Subtle metallic glass rim
    elevation: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18258F', // Signature Royal Blue
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 8,
    elevation: 6,
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(24, 37, 143, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        } as any)
      : {}),
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  inactiveTabCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222226', // Charcoal dark circular button
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});






