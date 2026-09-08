# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class expo.modules.** { *; }
-keep class com.reactnativecommunity.webview.** { *; }
-dontwarn expo.modules.**

# Keep line numbers and source file names for crash de-obfuscation in Google Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
