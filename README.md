# Sudoku Master

Production-oriented React Native Sudoku game built with TypeScript, Zustand, AsyncStorage, React Navigation, Socket.IO client integration, and AdMob test integrations.

## What’s Included

- Valid Sudoku generation for `easy`, `medium`, and `hard`
- Backtracking solver with uniqueness checks
- Real-time validation with incorrect-cell highlighting
- Timer plus pause/resume
- Chance-based gameplay (3 mistakes), rewarded-ad chance refill, undo/redo
- Daily challenge mode with deterministic seed
- Persisted progress, stats, and best times
- Dark/light/system theme support
- Banner, interstitial, and rewarded AdMob test IDs
- Multiplayer auth + matchmaking + online match flow
- Backend MVP with Express, MongoDB, and Socket.IO
- Unit tests for the Sudoku engine

## Folder Structure

```text
src/
  app/
  components/
  context/
  hooks/
  navigation/
  screens/
  services/
  store/
  types/
  utils/

backend/
  config/
  middleware/
  models/
  routes/
  services/
  sockets/
  server.js
```

## Setup

1. Use Node `20.19.4+`.
2. Install Java/Android Studio and Xcode/CocoaPods for device builds.
3. Install frontend dependencies:

```bash
npm install
```

4. Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

5. Install iOS pods:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Run Commands

Start Metro:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run iOS:

```bash
npm run ios
```

Run tests:

```bash
npm test -- --watchman=false
```

Run TypeScript check:

```bash
npm run typecheck
```

## Run Backend

1. Create env:

```bash
cd backend
cp .env.example .env
```

2. Update `MONGODB_URI` inside `backend/.env` if needed.

3. Start backend:

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`.

## Multiplayer Flow

- Authentication screen uses `name + generated deviceId` (MVP)
- Home screen includes:
  - `Play Online`
  - `Leaderboard`
  - coin + profile display
- Matchmaking emits Socket.IO `join_queue`
- On `match_found`, app navigates to online game
- On submit, backend validates and emits `game_result`
- Result screen shows winner/loser and quick replay

Main frontend files:

- [AuthContext.tsx](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/context/AuthContext.tsx)
- [api.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/services/api.ts)
- [socket.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/services/socket.ts)
- [RootNavigator.tsx](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/navigation/RootNavigator.tsx)
- [MatchmakingScreen.tsx](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/screens/MatchmakingScreen.tsx)
- [OnlineGameScreen.tsx](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/screens/OnlineGameScreen.tsx)

Main backend files:

- [server.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/server.js)
- [gameSocket.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/sockets/gameSocket.js)
- [matchmakingService.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/services/matchmakingService.js)
- [sudokuService.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/services/sudokuService.js)
- [userRoutes.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/routes/userRoutes.js)
- [leaderboardRoutes.js](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/backend/routes/leaderboardRoutes.js)

## Core Logic

### Sudoku generation

1. Build an empty 9x9 matrix.
2. Fill diagonal 3x3 boxes with shuffled values from a seeded RNG.
3. Solve the partially-filled matrix with a backtracking solver to create a full valid solution.
4. Remove values according to difficulty.
5. After each removal, count solutions and keep the removal only if the puzzle still has exactly one solution.

Main files:

- [generator.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/utils/sudoku/generator.ts)
- [solver.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/utils/sudoku/solver.ts)

### Sudoku solver

The solver uses recursive backtracking with a small optimization:

1. Find the next empty cell.
2. Prefer cells with fewer legal candidates.
3. Try digits `1-9`.
4. Validate each placement against the row, column, and 3x3 box.
5. Recurse until the board is solved or backtrack when stuck.

This same engine powers:

- puzzle creation
- hint resolution
- puzzle validation
- deterministic daily challenges

## AdMob

Development uses Google test IDs in [ads.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/services/ads.ts).

Before release:

1. Replace test IDs with your production unit IDs.
2. Add your app IDs to Android and iOS native configuration.
3. Verify consent and regional privacy flows if required.

## Persistence

Zustand persists these slices with AsyncStorage:

- current single-player game state
- stats and best times
- settings
- daily challenge history

Main store:

- [useGameStore.ts](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/src/store/useGameStore.ts)

## Release Prep

### Android / Play Store

1. Replace placeholder icon/splash assets from [assets/branding/README.md](/Users/shivamkumar/Desktop/suduku%20game/SudokuGame/assets/branding/README.md).
2. Set release `applicationId`, version code, and version name in Android Gradle config.
3. Add signing config in `android/gradle.properties` and `android/app/build.gradle`.
4. Swap AdMob test IDs for production IDs.
5. Build release APK/AAB:

```bash
cd android
./gradlew bundleRelease
```

### iOS

1. Install pods.
2. Open `ios/SudokuGame.xcworkspace` in Xcode.
3. Set bundle identifier, signing team, and app icons/splash assets.
4. Archive and distribute via Xcode Organizer.

## Notes

- The game is optimized around memoized cells and a centralized Zustand store.
- Multiplayer mode intentionally does not sync every move (performance-optimized). Only lifecycle events are synced.
- The RN template’s default sample test was removed because it relied on native modules not relevant to this app; engine coverage remains in `src/__tests__/sudokuEngine.test.ts`.
- Sound effects are left as a clean extension point in settings; vibration feedback is implemented with the built-in React Native API.
