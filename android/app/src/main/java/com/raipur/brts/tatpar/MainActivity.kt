package com.raipur.brts.tatpar

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme)
    super.onCreate(null)
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        window.navigationBarColor = android.graphics.Color.parseColor("#F8F6F0")
        window.statusBarColor = android.graphics.Color.parseColor("#F8F6F0")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          window.insetsController?.setSystemBarsAppearance(
            android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS or
            android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
            android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS or
            android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
          )
        } else {
          @Suppress("DEPRECATION")
          window.decorView.systemUiVisibility = (
            android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR or
            android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
          )
        }
      }
    } catch (e: Exception) {
      // Ignore if window properties cannot be adjusted
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  private var lastBackPressTime: Long = 0

  /**
    * Prevent direct app exit on back press. Requires pressing back twice within 2 seconds to exit.
    */
  override fun invokeDefaultOnBackPressed() {
      val currentTime = System.currentTimeMillis()
      if (currentTime - lastBackPressTime < 2000) {
          if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
              if (!moveTaskToBack(false)) {
                  super.invokeDefaultOnBackPressed()
              }
              return
          }
          super.invokeDefaultOnBackPressed()
      } else {
          lastBackPressTime = currentTime
          android.widget.Toast.makeText(this, "Press back again to exit", android.widget.Toast.LENGTH_SHORT).show()
      }
  }
}
