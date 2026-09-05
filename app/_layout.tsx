import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {Platform.OS === 'web' && (
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
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle:
            Platform.OS === 'web'
              ? ({
                  flex: 1,
                  width: '100%',
                  maxWidth: 480,
                  height: '100%',
                  alignSelf: 'center',
                  backgroundColor: '#F8F9FC',
                  boxShadow: '0 0 60px rgba(0, 0, 0, 0.12)',
                } as any)
              : {},
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
