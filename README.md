# FotoOwl Image Gallery & User Management Application

A premium bare React Native application built with clean architecture, atomic component design, global state contexts, custom dark/light theme systems, and rich UX features.

---

## 📱 Features

1. **User Authentication & Session Persistence**:
   * Complete validation on Registration (Full Name, Email, Gender, Mobile, Address, City, Password, Confirm Password).
   * Exact 10-digit check for Mobile and min 6-character check for Password.
   * Auto-login on app start using persisted storage session.
2. **Picsum Image Gallery**:
   * Dynamic image fetching from `https://picsum.photos/v2/list?limit=50`.
   * High performance rendering via optimized `FlatList` with initial layouts, batch sizes, and image dimensions.
   * Case-insensitive, client-side debounced search to avoid UI stutter and blocking.
   * Category filter chips: **All**, **Author A-M**, **Author N-Z**.
   * Pull-to-refresh with dual-request prevention locks.
   * Infinite scroll pagination (`onEndReached`) loading subsequent pages dynamically.
3. **Details View & Native Media Controls**:
   * Full-screen interactive image viewer modal.
   * Native image download directly to the device's photo gallery into a custom album (`FotoOwl`) using `expo-file-system` and `expo-media-library` with explicit permission handling.
   * Native share sheets using standard React Native `Share` utilities.
4. **Profile Management**:
   * Inline editable profile details with React Hook Form validation.
   * Centralized profile state updates reflecting instantly across the app without reloads.
5. **Aesthetics & Theme Engine**:
   * Global Light/Dark mode state switching toggles.
   * Preserved color schemes, custom UI components, and modern typography.

---

## 🛠️ Folder Structure

```text
foto-owl-assignment/
├── android/               # Android Native project directory
├── ios/                   # iOS Native project directory
├── src/                   # Main source code directory
│   ├── App.tsx            # App root, wrapping all Context Providers
│   ├── components/        # Reusable Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ImageCard.tsx
│   │   ├── Loader.tsx
│   │   └── Toast.tsx
│   ├── context/           # React Context Providers for global state
│   │   ├── AuthContext.tsx    # Auth, registration, profile update, logout
│   │   ├── GalleryContext.tsx # Centralized favorites management
│   │   └── ThemeContext.tsx   # Light/dark mode color schemes & toggles
│   ├── hooks/             # Custom React Hooks
│   │   ├── useDebounce.ts     # Input debounce utility hook
│   │   └── useGallery.ts      # Picsum API fetch, refresh, and pagination hook
│   ├── navigation/        # React Navigation configurations
│   │   ├── AppNavigator.tsx   # Auth-gated router stack and bottom tabs
│   │   └── Types.ts           # Navigation typescript parameter lists
│   ├── screens/           # Main screen screens
│   │   ├── auth/              # Auth screens (Login, Register)
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── gallery/           # Gallery screens (Home, Detail)
│   │   │   ├── HomeScreen.tsx
│   │   │   └── DetailScreen.tsx
│   │   └── user/              # User screens (Favorites, Profile)
│   │       ├── FavoritesScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── types/             # Common TypeScript interfaces
│   │   └── picsum.ts
│   └── utils/             # Helper utilities
│       ├── imageDownloader.ts # Cache & save images to native photo library
│       ├── storage.ts         # Parsed AsyncStorage getter & setter wrapper
│       └── validations.ts     # RegEx schemas for inputs
├── README.md              # Project documentation
├── package.json           # Node modules dependencies and helper scripts
├── tsconfig.json          # TypeScript compilation configuration
└── eas.json               # EAS build configuration profiles
```

---

## 📦 Key Libraries Used

*   **React Native (v0.86.0)**: Core framework.
*   **React Navigation (v7)**: Navigation Container, Stack Navigator, and Bottom Tabs.
*   **Expo Modules Core**: Brings Expo capabilities to bare React Native.
*   **Expo File System**: Downloads high-resolution images to local cache.
*   **Expo Media Library**: Saves downloaded files directly to the system photo library.
*   **React Hook Form**: Highly performant validation form management.
*   **Async Storage**: Local persistent storage for auth sessions, favorites, and active theme.

---

## 📋 Assumptions Made

1. **Picsum Image Search**: Picsum API doesn't offer a query parameter for filtering by author. Therefore, author-based searching is performed locally on the fetched image dataset. To prevent rendering overhead on every keystroke, a 300ms client-side debouncing is implemented.
2. **Offline Data Persistence**: User credentials list (`@users_list`), current user session (`@current_user`), favorited images map (`@favorites`), and selected theme mode (`@app_theme`) are stored using `AsyncStorage`.
3. **Android Target Build**: Due to strict emulator runtime limits on older target devices, JDK 21 and Gradle 8+ are configured to build successfully against Android target SDK 36.

---

## 🚀 Setup & Run Instructions

### Prerequisites
*   Node.js (>= 22.11.0)
*   Android SDK / Android Studio configured with JDK 21
*   Android Emulator booted and connected

### Steps to Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Metro Server**:
    ```bash
    npm start
    ```

3.  **Launch the App on Android Emulator**:
    In a new terminal window, run the following helper script:
    ```bash
    npm run android
    ```
    *Note: The `npm run android` script has been pre-configured in `package.json` to automatically resolve and export local JDK and Android SDK home paths for easy execution.*
