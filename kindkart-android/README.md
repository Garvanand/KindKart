# KindKart — Android Application

**Neighborhood OS, in your pocket.**

A production-grade Android application built with Kotlin and Jetpack Compose, converted from the KindKart full-stack web application.

---

## 👤 Developer

| Field | Details |
|-------|---------|
| **Developer** | Garv Anand |
| **Course** | B.Tech CSE (4th Year) |
| **University** | VIT |
| **App Version** | 1.0.0 |

---

## 📱 Features

### Core Functionality
- **Authentication** — OTP-based login, profile setup, persistent sessions, guest/demo mode
- **Dashboard** — Live snapshot, community feed, quick actions, request listings
- **Help Requests** — Create, browse, filter, respond to neighborhood help requests
- **Communities** — Create/join groups, manage members, view community activity
- **Real-time Chat** — Message threads per request, unread badges, message bubbles
- **Wallet** — Balance overview, earned/spent/pending, transaction history
- **Reputation** — Trust scores, badges, achievements, community leaderboard
- **Profile** — User stats, badge carousel, leaderboard, logout

### Mobile Enhancements
- Pull-to-refresh on all screens
- Skeleton loading states
- Empty state illustrations
- Bottom navigation with animated transitions
- Edge-to-edge display
- Offline-first (demo data fallback)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Kotlin |
| **UI** | Jetpack Compose + Material 3 |
| **Architecture** | MVVM (ViewModel + StateFlow) |
| **DI** | Hilt |
| **Networking** | Retrofit + OkHttp |
| **Storage** | DataStore Preferences |
| **Navigation** | Jetpack Navigation Compose |
| **Image Loading** | Coil |
| **Serialization** | Gson |

---

## 📁 Project Structure

```
kindkart-android/
├── app/
│   ├── build.gradle.kts          # Dependencies & app config
│   ├── proguard-rules.pro        # R8 minification rules
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/kindkart/app/
│       │   ├── KindKartApplication.kt    # Hilt Application
│       │   ├── MainActivity.kt           # Single Activity
│       │   ├── data/
│       │   │   ├── api/                  # Retrofit API + Auth interceptor
│       │   │   ├── datastore/            # DataStore preferences
│       │   │   ├── model/                # Data classes
│       │   │   └── repository/           # Repository pattern
│       │   ├── di/                       # Hilt DI modules
│       │   ├── ui/
│       │   │   ├── theme/                # Colors, Typography, Shapes, Theme
│       │   │   ├── components/           # Reusable composables
│       │   │   ├── navigation/           # Nav graph & routes
│       │   │   └── screens/              # All app screens
│       │   └── util/                     # DemoData, NetworkMonitor
│       └── res/                          # XML resources
├── build.gradle.kts                      # Project-level Gradle
├── settings.gradle.kts
├── gradle.properties
└── gradle/libs.versions.toml             # Version catalog
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Android Studio** Hedgehog (2023.1.1) or newer
- **JDK 17**
- **Android SDK 34** (API Level 34)
- **Kotlin 2.0.21**

### Step 1: Open Project
1. Open Android Studio
2. Select `File → Open`
3. Navigate to `kindkart/kindkart-android/` and open it
4. Wait for Gradle sync to complete

### Step 2: Download Inter Font (Optional)
The app uses the Inter font family. Download from [Google Fonts](https://fonts.google.com/specimen/Inter):
```
inter_regular.ttf      → app/src/main/res/font/
inter_medium.ttf       → app/src/main/res/font/
inter_semibold.ttf     → app/src/main/res/font/
inter_bold.ttf         → app/src/main/res/font/
inter_extrabold.ttf    → app/src/main/res/font/
```
> If fonts are not placed, the app will use the system default font (Roboto).

### Step 3: Configure Backend (Optional)
The app connects to the KindKart backend for live data. To configure:

1. In `app/build.gradle.kts`, update the `API_BASE_URL`:
   ```kotlin
   // For emulator (default):
   buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3001\"")
   
   // For physical device on same network:
   buildConfigField("String", "API_BASE_URL", "\"http://192.168.x.x:3001\"")
   ```

2. Start the backend:
   ```bash
   cd kindkart/kindkart-backend
   npm install && npm run dev
   ```

> **Without the backend**, the app works fully in **demo mode** with realistic mock data.

### Step 4: Run
- Select a device/emulator in Android Studio
- Click ▶️ Run or press `Shift+F10`

---

## 📦 APK Generation

### Debug APK (recommended for testing)
```bash
cd kindkart-android
./gradlew assembleDebug
```
APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK
1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore kindkart-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kindkart
   ```

2. Add to `app/build.gradle.kts`:
   ```kotlin
   signingConfigs {
       create("release") {
           storeFile = file("kindkart-release.jks")
           storePassword = "your_password"
           keyAlias = "kindkart"
           keyPassword = "your_password"
       }
   }
   ```

3. Build:
   ```bash
   ./gradlew assembleRelease
   ```

APK at: `app/build/outputs/apk/release/app-release.apk`

---

## 🎨 Design System

The Android app preserves the **exact design system** from the KindKart website:

| Token | Website (CSS) | Android (Compose) |
|-------|--------------|-------------------|
| Primary | `hsl(141, 64%, 33%)` | `Color(0xFF1D8B4F)` |
| Background | `hsl(96, 17%, 96%)` | `Color(0xFFF4F6F3)` |
| Cards | White + 1px border | `Card` + `SurfaceCardBorder` |
| Buttons | `rounded-full` | `RoundedCornerShape(24.dp)` |
| Typography | Inter | Inter (downloadable) |
| Card radius | `rounded-2xl` | `16.dp` |

---

## 🧪 Known Behaviors

- **Demo Mode**: Guest login pre-populates all screens with realistic data
- **Network Errors**: All API calls gracefully fall back to demo data
- **Offline**: App works with last-loaded demo data when offline
- **Real-time Chat**: Currently uses polling; Socket.IO integration planned

---

## 📄 License

Built for educational purposes — VIT Internal Evaluation (Mobile Application Development).
