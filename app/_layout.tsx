import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import BusLoadingScreen from '../src/components/BusLoadingScreen';

export default function RootLayout() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const onAndroidBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

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
                  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap');
                  * {
                    box-sizing: border-box !important;
                  }
                  html, body {
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: #EAE6DF !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                  }
                  #root {
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    flex: 1 !important;
                    justify-content: center !important;
                    background-color: #EAE6DF !important;
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
                    const style = document.createElement('style');
                    style.id = 'tatpar-custom-styles';
                    style.innerHTML = \`
                      [style*="z-index: 9999"], [style*="zIndex: 9999"], [style*="z-index:9999"] {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                      }
                      /* Compact frosted glass footer pill dock */
                      div[style*="border-bottom-left-radius: 32px"],
                      div[style*="borderBottomLeftRadius: 32px"],
                      div[style*="border-radius: 32px"],
                      div[style*="borderRadius: 32px"],
                      div[style*="border-radius: 29px"],
                      div[style*="borderRadius: 29px"] {
                        width: 256px !important;
                        max-width: 256px !important;
                        left: 50% !important;
                        right: auto !important;
                        margin-left: -128px !important;
                        background-color: rgba(255, 255, 255, 0.76) !important;
                        -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
                        backdrop-filter: blur(24px) saturate(190%) !important;
                        border: 1.2px solid rgba(255, 255, 255, 0.85) !important;
                        box-shadow: 0 8px 30px rgba(24, 37, 143, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
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
                        if (s.position === 'absolute' && (s.borderRadius === '32px' || s.borderRadius === '29px')) {
                          el.style.setProperty('width', '256px', 'important');
                          el.style.setProperty('max-width', '256px', 'important');
                          el.style.setProperty('left', '50%', 'important');
                          el.style.setProperty('right', 'auto', 'important');
                          el.style.setProperty('margin-left', '-128px', 'important');
                          el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.76)', 'important');
                          el.style.setProperty('-webkit-backdrop-filter', 'blur(24px) saturate(190%)', 'important');
                          el.style.setProperty('backdrop-filter', 'blur(24px) saturate(190%)', 'important');
                          el.style.setProperty('border', '1.2px solid rgba(255, 255, 255, 0.85)', 'important');
                          el.style.setProperty('box-shadow', '0 8px 30px rgba(24, 37, 143, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.7)', 'important');
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

