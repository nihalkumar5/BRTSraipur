import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet, BackHandler, ToastAndroid, Vibration } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '../src/services/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import BusLoadingScreen from '../src/components/BusLoadingScreen';

export default function RootLayout() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const lastBackPressRef = useRef<number>(0);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [canGoBackWeb, setCanGoBackWeb] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermissions();
    }
  }, []);

  const lastExitPressRef = useRef<number>(0);

  const onAndroidBackPress = useCallback(() => {
    if (!webViewRef.current) return true;

    // Send immediate script to handle back press inside the WebView
    webViewRef.current.injectJavaScript(`
      (function() {
        try {
          // 1. If active screen has custom back handler (e.g. stop details modal)
          if (typeof window.__handleActiveScreenBack === 'function' && window.__handleActiveScreenBack()) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
            }
            return;
          }
          if (typeof window.__handleAppBack === 'function' && window.__handleAppBack()) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
            }
            return;
          }

          // 2. Check for any visible close/back button in overlays or sheets
          var closeButtons = document.querySelectorAll(
            '[aria-label="Close"], [aria-label="close"], [aria-label="Back"], [aria-label="back"], button[data-testid="back-button"], button[data-testid="close-modal"]'
          );
          for (var i = closeButtons.length - 1; i >= 0; i--) {
            var btn = closeButtons[i];
            if (btn && btn.offsetParent !== null) {
              btn.click();
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
              }
              return;
            }
          }

          // 3. Check if currently on a sub-screen or non-Home tab (Stops, Schedule, Fares)
          var path = window.location.pathname || '';
          var isNotHomePath = (path !== '/' && path !== '' && path !== '/index.html' && path !== '/(tabs)' && path !== '/(tabs)/index');
          
          var activePill = document.querySelector('[class*="activeTabText"], [aria-selected="true"]');
          var activeLabel = activePill ? (activePill.textContent || '').trim() : '';
          var isNotHomeTab = (activeLabel && activeLabel !== 'Home');

          if (isNotHomePath || isNotHomeTab) {
            // Find and click Home tab button
            var homeTab = document.querySelector('[aria-label="Home"], [aria-label="home"]');
            if (homeTab) {
              homeTab.click();
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
              }
              return;
            }

            var allEls = document.querySelectorAll('div, button, a');
            for (var j = 0; j < allEls.length; j++) {
              var el = allEls[j];
              if ((el.textContent || '').trim() === 'Home' && el.offsetParent !== null) {
                el.click();
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
                }
                return;
              }
            }

            if (window.history.length > 1) {
              window.history.back();
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
              }
              return;
            }

            window.location.href = '/';
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'BACK_CONSUMED' }));
            }
            return;
          }

          // 4. Already at Home!
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ON_HOME_ROOT' }));
          }
        } catch (e) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ON_HOME_ROOT' }));
          }
        }
      })();
      true;
    `);

    return true; // CRITICAL: NEVER permit Android OS to kill the app directly
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const sub = BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => sub.remove();
    }
  }, [onAndroidBackPress]);

  return (
    <SafeAreaProvider>
      <View style={styles.rootWrapper}>
        <StatusBar
          style={isLoading ? 'light' : 'dark'}
          backgroundColor={isLoading ? '#1E2D99' : '#F8F6F0'}
          translucent={false}
        />
        {Platform.OS === 'web' ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap');
                  
                  * {
                    box-sizing: border-box !important;
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                  }
                  html, body {
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: #EAE6DF !important;
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                    -webkit-font-smoothing: antialiased !important;
                    -moz-osx-font-smoothing: grayscale !important;
                    text-rendering: optimizeLegibility !important;
                  }
                  #root {
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    flex: 1 !important;
                    justify-content: center !important;
                    background-color: #EAE6DF !important;
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                  }
                  div, span, p, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, [class*="css-text-"], [class*="r-fontFamily-"] {
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                  }
                  .tabular-nums, [data-tabular="true"] {
                    font-variant-numeric: tabular-nums !important;
                    font-feature-settings: "tnum" 1 !important;
                  }
                  input, textarea, select {
                    outline: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                  }
                  input:focus, textarea:focus, select:focus {
                    outline: none !important;
                    box-shadow: none !important;
                  }
                `,
              }}
            />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  flex: 1,
                  width: '100%',
                  maxWidth: 480,
                  height: '100%',
                  alignSelf: 'center',
                  backgroundColor: '#F8F6F0',
                  boxShadow: '0 0 60px rgba(0, 0, 0, 0.12)',
                } as any,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
              <Stack.Screen name="terms" options={{ headerShown: false }} />
            </Stack>
          </>
        ) : (
          <View style={styles.nativeContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: 'https://tatpar-brts-raipur.vercel.app' }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsBackForwardNavigationGestures={true}
              pullToRefreshEnabled={true}
              scalesPageToFit={false}
              setBuiltInZoomControls={false}
              setDisplayZoomControls={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              bounces={false}
              textZoom={100}
              nestedScrollEnabled={true}
              injectedJavaScriptBeforeContentLoaded={`
                (function() {
                  try {
                    // 1. Rigid viewport and touch zoom lockdown
                    let meta = document.querySelector('meta[name="viewport"]');
                    if (!meta) {
                      meta = document.createElement('meta');
                      meta.name = 'viewport';
                      (document.head || document.documentElement).appendChild(meta);
                    }
                    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover';

                    // 2. Prevent multi-touch pinch zoom & double-tap zoom
                    document.addEventListener('touchstart', function(e) {
                      if (e.touches && e.touches.length > 1) {
                        e.preventDefault();
                      }
                    }, { passive: false });

                    var lastTouchTime = 0;
                    document.addEventListener('touchend', function(e) {
                      var now = Date.now();
                      if (now - lastTouchTime <= 300) {
                        e.preventDefault();
                      }
                      lastTouchTime = now;
                    }, false);

                    document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
                    document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
                    document.addEventListener('gestureend', function(e) { e.preventDefault(); });

                    const fontLink = document.createElement('link');
                    fontLink.rel = 'stylesheet';
                    fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap';
                    (document.head || document.documentElement).appendChild(fontLink);

                    const style = document.createElement('style');
                    style.id = 'tatpar-custom-styles';
                    style.innerHTML = \`
                      html, body, #root {
                        touch-action: pan-x pan-y !important;
                        -webkit-text-size-adjust: 100% !important;
                        text-size-adjust: 100% !important;
                        overscroll-behavior: none !important;
                      }
                      * {
                        font-family: 'Plus Jakarta Sans', sans-serif !important;
                        touch-action: manipulation !important;
                        -webkit-tap-highlight-color: transparent !important;
                      }
                      div, span, p, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, [class*="css-text-"], [class*="r-fontFamily-"] {
                        font-family: 'Plus Jakarta Sans', sans-serif !important;
                      }
                      [style*="z-index: 9999"], [style*="zIndex: 9999"], [style*="z-index:9999"] {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                      }
                      /* Compact frosted glass footer pill dock */
                      div[style*="border-bottom-left-radius: 36px"],
                      div[style*="borderBottomLeftRadius: 36px"],
                      div[style*="border-radius: 36px"],
                      div[style*="borderRadius: 36px"] {
                        background-color: rgba(255, 255, 255, 0.65) !important;
                        -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
                        backdrop-filter: blur(28px) saturate(200%) !important;
                        border: 1.2px solid rgba(255, 255, 255, 0.9) !important;
                        box-shadow: 0 16px 40px rgba(24, 37, 143, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9) !important;
                      }
                    \`;
                    const target = document.head || document.documentElement || document.body;
                    if (target) {
                      target.appendChild(style);
                    }

                    // 3. Expose Android Hardware Back Handler to Native
                    window.__handleAndroidBack = function() {
                      try {
                        // A. Try closing visible modal or back-button in overlays
                        const closeBtns = document.querySelectorAll('[aria-label="Close"], [aria-label="close"], [aria-label="Back"], [aria-label="back"], button[data-testid="back-button"], button[data-testid="close-modal"]');
                        for (let i = closeBtns.length - 1; i >= 0; i--) {
                          const btn = closeBtns[i];
                          if (btn && btn.offsetParent !== null) {
                            btn.click();
                            return true;
                          }
                        }

                        // B. If on a sub-screen or non-Home tab, return to Home tab
                        const homeTabBtn = document.querySelector('[aria-label="Home"], [aria-label="home"]');
                        if (homeTabBtn) {
                          homeTabBtn.click();
                          return true;
                        }

                        // C. Fallback history back
                        if (window.history.length > 1) {
                          window.history.back();
                          return true;
                        }

                        // D. Force root
                        window.location.href = '/';
                        return true;
                      } catch (e) {
                        return false;
                      }
                    };
                  } catch (e) {}
                })();
                true;
              `}
              injectedJavaScript={`
                (function() {
                  function applyCustomFixes() {
                    try {
                      // 1. Hide web loading overlay cleanly without React DOM collisions
                      const texts = ['Ready for your journey', 'Public Transit Initiative', 'Connecting routes & stops', 'Loading schedules...'];
                      const all = document.querySelectorAll('*');
                      for (let i = 0; i < all.length; i++) {
                        const el = all[i];
                        if (el.children && el.children.length === 0) {
                          const t = (el.textContent || '').trim();
                          if (texts.some(function(target) { return t.indexOf(target) !== -1; })) {
                            let parent = el.parentElement;
                            while (parent && parent !== document.body && parent !== document.getElementById('root')) {
                              const st = window.getComputedStyle(parent);
                              if ((st.position === 'absolute' || st.position === 'fixed') && (st.zIndex === '9999' || parseInt(st.zIndex, 10) >= 9000)) {
                                parent.style.setProperty('display', 'none', 'important');
                                parent.style.setProperty('visibility', 'hidden', 'important');
                                parent.style.setProperty('opacity', '0', 'important');
                                parent.style.setProperty('pointer-events', 'none', 'important');
                                break;
                              }
                              parent = parent.parentElement;
                            }
                          }
                        }

                        // 2. Compact frosted glass styling for bottom nav bar
                        const s = window.getComputedStyle(el);
                        if (s.position === 'absolute' && (s.borderRadius === '36px' || s.borderRadius === '32px' || s.borderRadius === '29px')) {
                          el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.65)', 'important');
                          el.style.setProperty('-webkit-backdrop-filter', 'blur(28px) saturate(200%)', 'important');
                          el.style.setProperty('backdrop-filter', 'blur(28px) saturate(200%)', 'important');
                          el.style.setProperty('border', '1.2px solid rgba(255, 255, 255, 0.9)', 'important');
                          el.style.setProperty('box-shadow', '0 16px 40px rgba(24, 37, 143, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)', 'important');
                        }
                      }
                    } catch (e) {}
                  }

                  applyCustomFixes();
                  if (window.MutationObserver) {
                    const obs = new MutationObserver(applyCustomFixes);
                    obs.observe(document.documentElement, { childList: true, subtree: true });
                  }
                  setInterval(applyCustomFixes, 250);
                })();
                true;
              `}
              onNavigationStateChange={(navState) => {
                setCanGoBack(navState.canGoBack);
              }}
              onMessage={async (event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (!data) return;
                  if (data.type === 'ON_HOME_ROOT') {
                    const now = Date.now();
                    if (now - lastExitPressRef.current < 2000) {
                      BackHandler.exitApp();
                    } else {
                      lastExitPressRef.current = now;
                      if (Platform.OS === 'android') {
                        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                      }
                    }
                  } else if (data.type === 'BACK_CONSUMED') {
                    lastExitPressRef.current = 0; // Reset exit timer, user navigated back within app
                  } else if (data.type === 'CAN_GO_BACK') {
                    setCanGoBackWeb(Boolean(data.canGoBack));
                  } else if (data.type === 'REQUEST_NOTIFICATION_PERMISSION') {
                    await requestNotificationPermissions();
                  } else if (data.type === 'TRIGGER_VIBRATION') {
                    try {
                      const pattern = data.payload?.pattern || [0, 400, 150, 400];
                      Vibration.vibrate(pattern);
                    } catch (e) {}
                  } else if (data.type === 'SCHEDULE_BUS_NOTIFICATION') {
                    const { routeBadge, fromStop, toStop, departureTime, arrivalTime, triggerSeconds, minutesBefore, isWakeUpAlarm } = data.payload || {};
                    await requestNotificationPermissions();
                    try {
                      const channelId = isWakeUpAlarm ? 'stop_wake_alarm' : 'default';
                      const title = isWakeUpAlarm
                        ? `🔔 WAKE UP: Next stop is ${toStop}!`
                        : `🚍 ${routeBadge} departs in ${minutesBefore} mins!`;
                      const body = isWakeUpAlarm
                        ? `Arriving in ~4 mins (${arrivalTime}). Please prepare to de-board!`
                        : `Board at ${fromStop} by ${departureTime}. Estimated arrival at ${toStop}: ${arrivalTime}.`;

                      await Notifications.scheduleNotificationAsync({
                        content: {
                          title,
                          body,
                          sound: 'default',
                          color: isWakeUpAlarm ? '#EA580C' : '#18258F',
                          priority: Notifications.AndroidNotificationPriority.MAX,
                        },
                        trigger: {
                          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                          seconds: Math.max(1, Number(triggerSeconds) || 1),
                          channelId,
                        },
                      });
                      if (Platform.OS === 'android') {
                        const toastMsg = isWakeUpAlarm
                          ? `🔔 Wake-up alarm armed for ${toStop}`
                          : `🔔 Reminder set for ${departureTime}`;
                        ToastAndroid.show(toastMsg, ToastAndroid.SHORT);
                      }
                    } catch (schedErr) {
                      console.warn('Error in scheduleNotificationAsync:', schedErr);
                    }
                  } else if (data.type === 'CANCEL_NOTIFICATION') {
                    if (data.payload?.departureNotifId) {
                      await Notifications.cancelScheduledNotificationAsync(data.payload.departureNotifId);
                    }
                    if (data.payload?.wakeUpNotifId) {
                      await Notifications.cancelScheduledNotificationAsync(data.payload.wakeUpNotifId);
                    }
                    if (data.payload?.notificationId) {
                      await Notifications.cancelScheduledNotificationAsync(data.payload.notificationId);
                    }
                  }
                } catch (e) {}
              }}
            />
          </View>
        )}

        {/* Seamless full screen loading overlay matching splash screen - ONLY ON NATIVE */}
        {Platform.OS !== 'web' && isLoading && (
          <BusLoadingScreen
            duration={2100}
            onFinish={() => setIsLoading(false)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#1E2D99', // Matches loading screen royal blue perfectly, zero flicker
  },
  nativeContainer: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
});

