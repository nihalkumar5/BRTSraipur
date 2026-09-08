# 📱 Google Play Store Submission Kit: Tatpar: Raipur BRTS Guide

This document contains all the copy, metadata, Data Safety responses, and store listing details required to publish **Tatpar: Raipur BRTS Guide** on the Google Play Console.

---

## 1. Store Listing Metadata

| Field | Value / Content | Constraints |
|---|---|---|
| **App Name** | `Tatpar: Raipur BRTS Guide` | Max 30 chars (Actual: 25 chars) |
| **Alternative App Name** | `Raipur BRTS Guide: Tatpar` | Max 30 chars (Actual: 25 chars) |
| **Short Description** | `Unofficial timetable, routes & fare guide for Raipur & Nava Raipur BRTS buses.` | Max 80 chars (Actual: 79 chars) |
| **Application Type** | `App` | |
| **Primary Category** | `Maps & Navigation` (or `Travel & Local`) | |
| **Tags** | `Public Transit`, `Bus`, `Navigation`, `Travel`, `Timetable` | Up to 5 tags |

---

## 2. Full Description (Google Play Console)

```text
⚠️ DISCLAIMER:
This app is an independent transit companion and guide developed for daily commuters. It is NOT an official application of, endorsed by, or affiliated with the Government of Chhattisgarh, Raipur Urban Public Transport Society (RUPTS), Raipur Municipal Corporation, or any government entity. All timetable, route corridors, and fare details are compiled from publicly available commuter information for passenger convenience.

---

Tatpar: Raipur BRTS Guide (तत्पर बीआरटीएस रायपुर गाइड) is an independent passenger transit guide for Nava Raipur Atal Nagar and Raipur City, Chhattisgarh.

Designed for daily commuters, students, office employees, and visitors, this guide provides easy access to Bus Rapid Transit System (BRTS) schedules, route corridors, bus stop directory, and standard fare tables—all in a clean, high-performance interface that works seamlessly both online and offline.

🚍 KEY FEATURES:

1. ⏱️ Comprehensive Timetable & Bus Schedules:
• Departure and arrival schedules across all operational Nava Raipur BRTS corridors.
• First bus, last bus, and frequency indicators.
• Direct corridor coverage between Raipur Railway Station, Mantralaya (Mahanadi Bhawan), Police Headquarters (PHQ), Hidayatullah National Law University (HNLU), IIIT, and Swami Vivekananda Airport feeder link.

2. 📍 All 23+ BRTS Bus Shelters & Stops:
• Directory of BRTS stops in Raipur and Nava Raipur.
• Identify boarding shelters, major interchange nodes (Telibandha, Serikhedi, Naya Raipur Entry gate), and nearby landmarks.

3. 💰 Fare Calculator:
• View official distance-based fare slabs (₹10, ₹15, ₹20, ₹25, ₹30, ₹35, ₹40).
• Plan your travel budget before boarding.

4. 🔔 Smart Commuter Reminders:
• Set departure and stop reminders so you never miss your bus.
• Local notifications for scheduled bus timings.

5. 🛡️ 100% Privacy by Design:
• No login or account required.
• No collection of personal, financial, or location tracking data.
• Works instantly upon download without any registration barrier.

6. ⚡ Lightweight, Fast & Battery Friendly:
• Clean, modern interface optimized for all Android devices.
• Works offline with built-in timetable databases.

🏛️ CORRIDORS COVERED:
• Corridor 1: Raipur Railway Station ⇄ Mantralaya / Mahanadi Bhawan
• Corridor 2: Raipur Railway Station ⇄ Police Headquarters (PHQ)
• Corridor 3: Raipur Railway Station ⇄ HNLU / Uparwara / Sector 27
• Airport Feeder: City Link ⇄ Swami Vivekananda Airport (Mana)

📞 CIVIC & PASSENGER HELPLINES:
Quick access to public emergency helplines:
• Emergency Response Support System: 112
• Raipur Municipal Corporation (RMC): 1800-233-1234
• Women Helpline: 1091

Tatpar: Raipur BRTS Guide is an independent digital transit initiative committed to making public transport across Chhattisgarh transparent, accessible, and effortless.
```

---

## 3. Mandatory Play Console Compliance & Policy URLs

| Required Field | Production Live URL |
|---|---|
| **Privacy Policy URL** | `https://tatpar-brts-raipur.vercel.app/privacy-policy` |
| **Terms of Service URL** | `https://tatpar-brts-raipur.vercel.app/terms` |
| **About & Support URL** | `https://tatpar-brts-raipur.vercel.app/about` |
| **Developer Contact Email** | `nihalkumar5@gmail.com` |
| **Website** | `https://tatpar-brts-raipur.vercel.app` |

---

## 4. Google Play Data Safety Questionnaire Guide

When filling out the **Data safety form** in Google Play Console, answer as follows:

| Question | Answer | Reason / Explanation |
|---|---|---|
| **Does your app collect or share any user data?** | **No** | The app does not collect, transmit, or share any personal user data. |
| **Does your app require user account creation?** | **No** | Full functionality is available without registration. |
| **Is data encrypted in transit?** | **Yes** (if asked about standard HTTPS) | All web traffic uses HTTPS/TLS. |
| **Can users request data deletion?** | **Not applicable** | No user data or accounts exist to delete. |
| **Target Age Group** | **13 and older** (or 18+) | Avoids "Designed for Families" strict COPPA requirements while remaining accessible to all public transit commuters. |
| **Does your app contain ads?** | **No** | Ad-free passenger utility. |
| **Does your app have financial/payment features?** | **No** | Displaying standard ticket fare tables does not constitute financial transactions. |

---

## 5. App Permissions Justification

| Permission in AndroidManifest | Purpose | Sensitive? |
|---|---|---|
| `android.permission.INTERNET` | Load route updates, web assets, and check timetable freshness. | No (Normal permission) |
| `android.permission.VIBRATE` | Haptic feedback for stop selection and departure reminders. | No (Normal permission) |
| `android.permission.POST_NOTIFICATIONS` | Local transit reminder alerts scheduled by the commuter. | Yes (Runtime prompt on Android 13+) |

---

## 6. Graphic Asset Specifications for Play Store

| Asset | Dimensions | Requirements | Notes |
|---|---|---|---|
| **App Icon** | 512 x 512 px | 32-bit PNG, max 1024KB, no transparency | Available in `assets/images/icon.png` |
| **Feature Graphic** | 1024 x 500 px | JPEG or 24-bit PNG (no alpha), max 15MB | Prominent branding featuring "Tatpar BRTS Raipur" with bus motif |
| **Phone Screenshots** | Min 2, Max 8 screenshots | 16:9 or 9:16 aspect ratio, min 1080px on shortest side | Capture Home tab, Timetable, Stops, and Fares |
| **7-inch Tablet Screenshots** | Optional (Recommended: 1) | Min 1080px | |
| **10-inch Tablet Screenshots** | Optional (Recommended: 1) | Min 1080px | |

---

## 7. Release Artifacts

- **Android App Bundle (.aab)**:
  `android/app/build/outputs/bundle/release/app-release.aab`
- **Package Name**: `com.raipur.brts.tatpar`
- **Version Name**: `1.0.0`
- **Version Code**: `1`
- **Target SDK**: Android 14+ (API 34/35)
- **Min SDK**: API 24 (Android 7.0 Nougat) — covers 99.5%+ of all active Android devices in India.
