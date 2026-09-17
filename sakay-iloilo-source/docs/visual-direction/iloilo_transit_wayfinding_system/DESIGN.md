---
name: Iloilo Transit Wayfinding System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-utility, hyper-legible transit navigation interface tailored specifically for urban commuters, students, workers, and tourists navigating Iloilo City’s traditional jeepney networks and modernized Public Utility Vehicles (PUVs/Buses).

### Aesthetic Direction
The style balances **modern transit utility** with **tactile civic wayfinding**:
- **High-Glanceability & Directness:** Inspired by precision civic tools like Citymapper and modern map overlays, stripped of superfluous decoration. Commuters checking routes under intense tropical sunlight or inside dimly lit jeepneys require instant hierarchy, sharp edges, and unmistakable contrast.
- **Vibrant Civic Energy:** Rooted in Iloilo's iconic transport identity—balancing a focused transit cobalt blue with warm jeepney mango gold and sharp route emerald accents.
- **Structure:** Crisp surface containers, clean outline divisions, solid color-blocked route identifiers, and restrained elevation to maintain performance across lower-tier mobile hardware.

## Colors

The palette is engineered for rapid visual parsing under harsh direct sunlight and nighttime street conditions. Route color-coding strictly follows the public transport network's physical livery and line numbers in Iloilo (e.g., Jaro CPU, Ungka ITGSI, Mandurriao, Villa Mohon).

### Core Roles
- **Primary (`#2563EB` - Transit Cobalt):** Drives primary actions, system states, user location indicators, step-by-step navigation cues, and active transit paths.
- **Secondary (`#F59E0B` - Mango Amber):** Serves as the iconic jeepney route highlight, transfer indicators, congestion warnings, and primary landmark callouts.
- **Tertiary (`#10B981` - Modern PUV Emerald):** Used for modernized air-conditioned PUVs, electric jeepney lines, on-time status indicators, and eco/low-fare route options.
- **Neutral (`#0F172A` - Slate Black):** Grounds all typography and key structural boundaries. Replaces pure black to eliminate harsh OLED glare while retaining maximum contrast ratios against light gray background tiers (`#F8FAFC` base, `#F1F5F9` sub-tier, `#FFFFFF` floating card surfaces).

### Semantic & Functional Rules
- Route numbers and code pills must maintain a minimum contrast ratio of 4.5:1 against their backgrounds.
- Hazard and route closure notices use `#EF4444` (Crimson).
- Background map overlays utilize desaturated road networks to allow colored transit vectors (`#2563EB`, `#F59E0B`, `#10B981`) to cut through visually without noise.

## Typography

The type system prioritizes micro-legibility during motion and physical vibration.

- **Plus Jakarta Sans** anchors headers, route codes, stops, and cardinal directions. Its geometric, open-counter design provides immediate clarity for short, high-impact wayfinding data (e.g., "ROUTE 4: UNGKA TO CITY PROPER").
- **Inter** handles all body content, step-by-step transit maneuvers, fare estimates, schedules, and technical stop listings. Its tall x-height and neutral geometry prevent letterform blur when reading outdoors on moving vehicles.
- **Route Badges & Codes (`code-badge`):** Rendered in uppercase with heavy weight (`800`) and slight tracking to mimic municipal road signs and vehicle destination signage.

## Layout & Spacing

The layout is built for rapid thumb reachability on mobile devices and expandable side-panel utility on desktop screens.

### Grid & Breakpoints
- **Mobile (Base to 639px):** Full-bleed dynamic canvas layout. The live interactive map occupies the background tier (`z-index: 0`), while route search, quick-actions, and transit itineraries sit inside a collapsible bottom sheet or top floating bar. Safe margins are fixed at `margin-mobile` (16px).
- **Tablet (640px to 1023px):** 8-column fluid grid. Wayfinding panels float anchored to the left screen boundary with a fixed 380px drawer.
- **Desktop (1024px and up):** 12-column layout with 24px gutters. A dedicated persistent 420px multi-modal route planning sidebar docks to the left, leaving the rest of the canvas dedicated to map visualization, terminal layouts, and live PUV telemetry.

### Spacing Rhythm
- Compact internal spacing (`space-xs` and `space-sm`) packs itinerary milestones, transfer pins, and fare tables into high-density scannable lists.
- Structural layout padding (`space-md` to `space-xl`) isolates interactive touch targets, ensuring minimum touch areas of 44×44px for one-handed operation.

## Elevation & Depth

This system avoids heavy, blurred realistic shadows, opting instead for **tactile structural layering and crisp ambient depth**. This ensures elements remain distinct in direct sunlight without muddy gradients.

### Layer Architecture
1. **Base Layer (Elevation 0):** Map canvas, satellite imagery, and underlying road network vectors.
2. **Sheet & Container Layer (Elevation 1):** Schedule cards, route listings, and timetable wrappers. Styled with pure white (`#FFFFFF`) or high-slate surfaces (`#F8FAFC`), bordered by an explicit 1px low-contrast outline (`#E2E8F0`).
3. **Floating Controls Layer (Elevation 2):** Current location tracking buttons, layer toggles, and search input bars. Elevated by a crisp, tight shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
4. **Modal & Bottom Sheet Drawer (Elevation 3):** Active navigation guidance, live PUV tracker cards, and arrival notifications: `0 12px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 8px -2px rgba(15, 23, 42, 0.06)`.

### Night / Dark Mode Contrast
Under night transit conditions, surfaces shift to deep slate (`#0B0F19`), card tiers use `#1E293B`, and active elevation is reinforced with subtle 1px border highlights (`rgba(255, 255, 255, 0.1)`) rather than diffuse shadows.

## Shapes

The interface utilizes a **Rounded (Level 2)** shape standard:
- Base buttons, input boxes, and list items adopt an 8px (`0.5rem`) corner radius.
- Cards, persistent navigation drawers, and bottom sheet containers adopt a 16px (`1rem` / `rounded-lg`) corner radius for comfortable physical ergonomics on handheld devices.
- Route number pills, live ETA counters, and transfer badges use a fully circular/capsule contour (`9999px`) to immediately separate categorical transit tokens from interactive rectangular buttons.

## Components

### Buttons
- **Primary Action (e.g., "Start Ride", "Find Route"):** Solid Transit Cobalt (`#2563EB`) fill, text in `#FFFFFF`, font `label-lg`, 48px height for tap reliability. Subtle hover: `#1D4ED8`. Active state: slight scale down (`scale(0.98)`).
- **Secondary / Transfer Buttons:** Bordered 1.5px with `#E2E8F0`, surface white, text `#0F172A`.
- **Icon Floating Buttons:** 48×48px round or 8px rounded squares for map re-centering, compass, and layer changes.

### Route Chips & Badges
- **Jeepney Route Pill:** Solid Mango Amber (`#F59E0B`) background with high-contrast Slate (`#0F172A`) typography. Shows route number and terminal name (e.g., `[ ROUTE 10 ] Bito-on to Lapaz`).
- **Modern PUV Badge:** Solid Emerald Green (`#10B981`) background with `#FFFFFF` bold typography. Signals air-conditioned, cash-card enabled modern bus units.
- **Transfer Connector Chip:** Small capsule badge with neutral slate background and directional arrow icon to designate interchange stops (e.g., `Transfer at CPU Gate 1`).

### Lists & Itinerary Steps
- **Step-by-Step Wayfinding Node:** Left vertical timeline spine (2px solid `#CBD5E1` or line-colored). Stops are represented by 12px circular pips (hollow for intermediate stops, solid color for boarding/alighting).
- **List Items:** Divided by subtle 1px borders (`#F1F5F9`), providing clear row targets containing: route badge, destination text, real-time arrival ("3 mins"), and current fare amount ("₱15.00").

### Input Fields
- **Search & Origin/Destination Inputs:** 52px input containers with embedded clear buttons, transit icon prefixes (green circle for origin, red pin for destination), `#F8FAFC` background fill, transitioning to crisp `#2563EB` 2px border on focus. No ambient floating labels; uses fixed, clear placeholder copy.

### Cards
- **Bottom Sheet Overview Card:** Features a grab handle (36×4px, rounded pill, `#CBD5E1`), prominent expected travel duration (e.g., "24 mins"), arrival window, jeepney pass code, and one-tap emergency / fare guide actions.
- **Vehicle Status Micro-Card:** Compact card showing driver/PUV unit ID, occupancy indicator (e.g., "Seats Available" vs "Standing Only"), and air-conditioning status.

### Checkboxes & Radio Filters
- Radio selectors for route preference ("Fastest", "Least Walking", "Modern PUV Only", "Traditional Only") use custom 20px controls with a 2px active ring in Transit Cobalt.