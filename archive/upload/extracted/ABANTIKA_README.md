# Abantika - Premium Wellness Companion App

A beautiful, offline-first personal wellness application designed with premium Material Design 3 principles.

## 🌟 Features

### Dashboard
- Personalized hero header with greeting
- Quick action buttons (Log Water, Mood, Cycle Entry, Add Reminder)
- Status cards showing:
  - Hydration progress with visual indicator
  - Current mood tracker
  - Cycle tracking status
  - Next reminder
- Daily wellness advice with calming illustrations

### Cycle Tracker
- Beautiful calendar interface for period tracking
- Flow intensity logging (Light, Medium, Heavy)
- Comprehensive symptom tracking (11+ symptoms)
- Optional health metrics (Weight, BBT)
- Medication and private notes
- Analytics with:
  - Visual charts showing symptom frequency
  - Cycle history statistics
  - Average cycle length tracking

### Journal
Two tabs for different types of entries:

**My Diary**
- Title, mood, reflection, and sticker selection
- Search functionality
- Mood-based filtering
- Beautiful card-based layout

**Wishlist**
Four categories:
- Save for Later
- Urgent Need
- Dream Cart
- For Him
Each with image placeholders, descriptions, notes, and optional links

### Hydration Tracker
- Animated circular progress indicator
- Quick add buttons (250ml, 500ml)
- Weekly history chart
- Hydration tips and recommendations
- Daily goal tracking

### Reminders
- Category-based organization (Medication, Water, Skincare, General Care)
- Time picker
- Weekday selector
- Enable/disable toggle
- Clean, modern card interface

### Theme Personalization
Six premium themes:
1. **Classic Mono Noir 🖤** - Rich black with high contrast (default)
2. **Serene Sage 🌿** - Calming green tones
3. **Dreamy Lavender 💜** - Soft purple palette
4. **Gentle Rose 🌸** - Warm pink aesthetic
5. **Calm Ocean 🌊** - Soothing blue shades
6. **Warm Sand 🏖️** - Earthy beige tones

### Backup & Restore
- Export all data as JSON
- Import previously exported data
- Complete data privacy (local storage only)

## 🎨 Design Features

- **Soft Minimalism**: Clean layouts with generous whitespace
- **Rounded Cards**: 20-28px border radius for modern look
- **Subtle Shadows**: Elegant elevation system
- **Premium Typography**: Inter font family with proper hierarchy
- **Smooth Animations**: Motion-based micro-interactions
- **8pt Spacing System**: Consistent spacing throughout
- **Material Design 3**: Modern Android design language
- **Responsive**: Optimized for mobile devices

## 🏗️ Technical Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Motion/React** (Framer Motion) for animations
- **Recharts** for data visualization
- **Radix UI** components for accessibility
- **Tailwind CSS v4** for styling
- **date-fns** for date manipulation
- **Local Storage** for data persistence

## 📁 Project Structure

```
/src/app
├── components/
│   ├── Layout.tsx          # Main layout with bottom navigation
│   └── ui/                 # Reusable UI components
├── contexts/
│   ├── ThemeContext.tsx    # Theme management
│   └── DataContext.tsx     # App data management
├── pages/
│   ├── Dashboard.tsx       # Home screen
│   ├── CycleTracker.tsx    # Period tracking
│   ├── Journal.tsx         # Diary and wishlist
│   ├── Hydration.tsx       # Water tracking
│   └── Settings.tsx        # Theme, reminders, backup
├── routes.tsx              # Router configuration
└── App.tsx                 # App entry point
```

## 🎯 Key Features

- **100% Offline**: All data stored locally
- **Privacy First**: No external servers or tracking
- **Smooth UX**: Micro-animations and transitions
- **Accessible**: Built with Radix UI primitives
- **Themeable**: 6 beautiful color schemes
- **Data Portability**: Export/import your data

## 🚀 Usage

The app automatically saves all data to browser localStorage. All features work completely offline.

### Navigation
Use the floating bottom navigation bar to switch between:
- 🏠 Home - Dashboard
- 🌸 Cycle - Period tracking
- 📔 Journal - Diary and wishlist
- 💧 Water - Hydration tracking
- ⚙️ Settings - Themes, reminders, backup

### Data Management
- All data is automatically saved
- Export your data regularly from Settings > Backup
- Import data to restore from backup

## 🎨 Customization

Change themes in Settings > Theme tab. Each theme includes:
- Coordinated color palette
- Consistent visual hierarchy
- Smooth theme transitions

## 📱 Mobile-First Design

The app is designed for Android mobile devices with:
- Touch-optimized tap targets
- Floating action buttons
- Bottom navigation for thumb reach
- Swipe-friendly interfaces
- Responsive layouts

---

**Note**: Abantika is designed as a private, personal wellness companion. All data remains on your device and is never transmitted externally.
