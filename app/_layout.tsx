import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
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

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [canGoBackWeb, setCanGoBackWeb] = useState(false);

  const onAndroidBackPress = useCallback(() => {
    if (webViewRef.current) {
      if (canGoBackWeb) {
        webViewRef.current.injectJavaScript(`
          (function() {
            try {
              if (typeof window.__handleAppBack === 'function') {
                window.__handleAppBack();
              } else if (window.history.length > 1) {
                window.history.back();
              }
            } catch (e) {}
          })();
          true;
        `);
        return true;
      }
      if (canGoBack) {
        webViewRef.current.goBack();
        return true;
      }
    }
    return false;
  }, [canGoBack, canGoBackWeb]);

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
          backgroundColor={isLoading ? '#18258F' : '#F7F7F4'}
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
                  backgroundColor: '#F8F9FC',
                  boxShadow: '0 0 60px rgba(0, 0, 0, 0.12)',
                } as any,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
              injectedJavaScriptBeforeContentLoaded={`
                (function() {
                  try {
                    const fontLink = document.createElement('link');
                    fontLink.rel = 'stylesheet';
                    fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap';
                    (document.head || document.documentElement).appendChild(fontLink);

                    const style = document.createElement('style');
                    style.id = 'tatpar-custom-styles';
                    style.innerHTML = \`
                      * {
                        font-family: 'Plus Jakarta Sans', sans-serif !important;
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
                        background-color: rgba(255, 255, 255, 0.82) !important;
                        -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
                        backdrop-filter: blur(28px) saturate(200%) !important;
                        border: 1.2px solid rgba(255, 255, 255, 0.95) !important;
                        box-shadow: 0 16px 40px rgba(24, 37, 143, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9) !important;
                      }
                    \`;
                    const target = document.head || document.documentElement || document.body;
                    if (target) {
                      target.appendChild(style);
                    }
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
                          el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.82)', 'important');
                          el.style.setProperty('-webkit-backdrop-filter', 'blur(28px) saturate(200%)', 'important');
                          el.style.setProperty('backdrop-filter', 'blur(28px) saturate(200%)', 'important');
                          el.style.setProperty('border', '1.2px solid rgba(255, 255, 255, 0.95)', 'important');
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
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data && data.type === 'CAN_GO_BACK') {
                    setCanGoBackWeb(Boolean(data.canGoBack));
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
    backgroundColor: '#F7F7F4',
  },
  nativeContainer: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
});

