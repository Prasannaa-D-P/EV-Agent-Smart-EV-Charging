---
name: Kinetic Intelligence
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d9e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3e4a40'
  inverse-surface: '#273143'
  inverse-on-surface: '#ecf0ff'
  outline: '#6d7a6f'
  outline-variant: '#bdcabd'
  surface-tint: '#006d3c'
  primary: '#006a3b'
  on-primary: '#ffffff'
  primary-container: '#00864b'
  on-primary-container: '#f6fff4'
  inverse-primary: '#64dd93'
  secondary: '#386380'
  on-secondary: '#ffffff'
  secondary-container: '#b2dcfe'
  on-secondary-container: '#37627f'
  tertiary: '#5f3add'
  on-tertiary: '#ffffff'
  tertiary-container: '#7857f8'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#81faad'
  primary-fixed-dim: '#64dd93'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#a1cced'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#1d4b67'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#cabeff'
  on-tertiary-fixed: '#1c0062'
  on-tertiary-fixed-variant: '#4918c8'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d9e3fb'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  metric-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  metric-display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.025em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, high-precision mobility interface engineered for autonomous orchestration and driver confidence. It combines clean minimalism with technical depth, blending the clarity of enterprise telemetry dashboards with the fluid responsiveness of modern consumer mobility apps. 

### Visual Character
- **Intelligent & Calm:** Clean white canvases (`#FFFFFF`) with cool slate-tinted neutral backdrops (`#F8FAFC`) eliminate cognitive overload in transit. Visual noise is minimized to prioritize critical charge metrics, power curves, and AI-routed itineraries.
- **Agentic Distinction:** Autonomous decisions, predictive reservations, and agentic workflows are visually distinct via a focused electric violet accent (`#7C5CFC`), differentiating automated agent intelligence from physical hardware state.
- **Regional Precision:** Formatted natively for Indian urban corridors (specifically Chennai, Tamil Nadu), adhering strictly to metric units (`km`, `kWh`, `kW`), regional currency (`₹ INR`), Indian standard dual plug types (`CCS2`, `Type 2`), and a 12-hour timestamp convention (`hh:mm a`).
- **Telemetry Integrity:** Strict visual segregation between production telemetry and simulation modes prevents operator ambiguity.

## Colors

The palette establishes a clear semantic hierarchy across infrastructure state, autonomous agency, and operational telemetry.

### Core Roles
- **Primary (`#16A05D`):** Electric Emerald. Used for primary operational actions, active charging state, high SoC states, and positive confirmation flows.
- **Secondary (`#1B4965`):** Deep Slate Teal. Structures the underlying UI architecture, primary typography, route maps, and non-interactive data visualizations.
- **Tertiary (`#7C5CFC`):** Agentic Violet. Exclusively indicates AI agents, predictive suggestions, automated slot locks, and autonomous scheduling interventions.
- **Neutral (`#667085`):** Mid-tone slate for supporting metadata, inactive units, unselected icons, and structural divider boundaries.

### Background & Surface Hierarchy
- **Base Canvas:** `#F8FAFC` (Cool slate-white, eliminating pure white eye strain).
- **Surface Elevation 0 (Cards, Sheets):** `#FFFFFF`.
- **Surface Elevation 1 (Interactive Inset / Data Wells):** `#F1F5F9`.
- **Structural Border:** `#E4E7EC` (Subtle 1px perimeter definition).

### Station & Hardware Status Tokens
- **Available:** `#20A85A` (Operational, open for immediate plug-in).
- **Limited:** `#F2A900` (High demand queue, reduced power throughput, or single gun open).
- **Occupied / Charging:** `#D92D20` (Dispensing power, bay occupied).
- **Offline:** `#667085` (No telemetry, network drop, or breaker tripped).
- **Reserved:** `#7C5CFC` (Pre-booked by driver or allocated by autonomous agent).

### Data Integrity & Telemetry Badging
- **Live Vehicle Telemetry:** Border `#16A05D`, Background `#ECFDF3`, Text `#027A48`, with a pulsing dot indicator.
- **Simulated / Demo Telemetry:** Border `#F2A900`, Background `#FEF0C7`, Text `#B54708`, styled with a warning badge to prevent operational error during testing.

## Typography

Typography relies on a systematic implementation of **Inter**, chosen for its tall x-height, clear numeric legibility, and tabular figure support for rapidly changing electrical telemetry.

### Typographic Hierarchy & Principles
- **Tabular Numerals (`tnum`):** All real-time telemetry metrics (e.g., current power `58.4 kW`, delivered energy `14.2 kWh`, pricing `₹18.50/kWh`, and SoC percentage `72%`) must enable tabular figures to prevent horizontal jitter during updates.
- **Metric Displays:** Designed specifically for charge dashboard headers and state-of-charge readout displays (`metric-display`). Units (`kW`, `kWh`, `%`, `km`) are set two steps lower in size and weight (`label-md` or `headline-sm`) baseline-aligned to the number.
- **Currency Conventions:** The Indian Rupee symbol (`₹`) is always set with non-breaking space before the numerical value (e.g., `₹ 450.00`).

## Layout & Spacing

The layout is built on a rigid 4px incremental scale (`0.25rem`), providing strict vertical alignment for complex telemetry tables, connector cards, and navigation surfaces.

### Screen Adaptations & Breakpoints
- **Mobile (360px – 599px):** 4-column fluid layout with `16px` outer margins and `12px` gutters. Single-column stacked telemetry cards, dockable bottom sheets, and persistent bottom utility controls.
- **Tablet (600px – 1023px):** 8-column layout with `24px` outer margins and `16px` gutters. Splitscreen map and charging session overview.
- **Desktop (1024px+):** 12-column layout with max canvas boundary of `1280px` centered, `32px` margins, `24px` gutters. 3-column modular view (Live Navigation/Map, Station Details, AI Agent Co-pilot feed).

### Spatial Rhythm
- **Internal Component Gap (`space-xs` to `space-sm`):** 4px to 8px gap between badge icons, unit labels, and metric headers.
- **Group Rhythm (`space-md`):** 16px padding within standard station cards, input field sets, and telemetry modules.
- **Section Rhythm (`space-lg` to `space-xl`):** 24px to 32px separation between discrete architectural modules (e.g., station location vs. connector specs vs. AI pricing analysis).

## Elevation & Depth

Visual hierarchy uses **low-contrast outlines** paired with **ambient, color-neutral shadows**, maintaining a crisp, laboratory-grade aesthetic that avoids muddy interfaces in bright daylight.

### Elevation Levels
- **Level 0 (Flat Surface / Canvas):** `#F8FAFC`. Used for main route backgrounds and non-elevated dashboards.
- **Level 1 (Structural Cards & Modules - `SHADOW_SM`):** `#FFFFFF` surface with `1px solid #E4E7EC` and `box-shadow: 0px 1px 3px rgba(16, 24, 40, 0.06), 0px 1px 2px rgba(16, 24, 40, 0.04)`. Used for station listings, connector blocks, and vehicle diagnostics.
- **Level 2 (Interactive Floating / Active Drawers - `SHADOW_MD`):** `#FFFFFF` surface with `1px solid #E4E7EC` and `box-shadow: 0px 4px 8px -2px rgba(16, 24, 40, 0.08), 0px 2px 4px -2px rgba(16, 24, 40, 0.04)`. Applied to map-floating search inputs, active slot selectors, and sticky session headers.
- **Level 3 (Modals & Bottom Sheets):** `#FFFFFF` surface with `box-shadow: 0px 12px 24px -4px rgba(16, 24, 40, 0.12), 0px 8px 16px -4px rgba(16, 24, 40, 0.08)`. Top surface edge bounded by a subtle `1px solid #E4E7EC`.

### Agentic Highlight Layers
When an interface card or recommendation is generated by the autonomous AI engine, the perimeter border is tinted with `#7C5CFC` at 25% opacity, accompanied by an ambient purple aura: `box-shadow: 0px 4px 12px rgba(124, 92, 252, 0.08)`.

## Shapes

The design system maintains strict geometry to balance ergonomic physical touch interaction with structured digital telemetry.

### Corner Radius Standards
- **Buttons & Interactive Micro-targets:** Explicitly set to `10px` (`0.625rem`). This distinctive curvature differentiates tactile controls from container boundaries.
- **Cards, Panels & Connectors:** Fixed at `16px` (`1.0rem`), providing a contained boundary for nested information architectures without excessive bubble-rounding.
- **Bottom Sheets & Modal Dialogs:** Upper bounds curved at `24px` (`1.5rem`), transitioning into straight horizontal base anchors.
- **Pills, Status Badges & Telemetry Toggles:** Fully rounded `9999px` to denote discrete, non-expandable state values.

## Components

### Buttons
- **Primary:** `10px` border radius, `#16A05D` background, `#FFFFFF` text, `500` weight, 44px min-height (mobile touch target). Pressed state: `#12824A`. Focus ring: 3px `#16A05D` at 20% opacity.
- **Secondary / Action Outlined:** `10px` radius, `#FFFFFF` background, `#1B4965` border and text, hover surface `#F1F5F9`.
- **AI Agentic Action:** `10px` radius, `#7C5CFC` background, `#FFFFFF` text, with subtle shimmer or spark icon prefix. Used exclusively for operations like "Auto-Reserve Route" or "Optimize Charging Plan".

### Cards & Connector Blocks
- Standard charging station cards feature a 16px radius, Level 1 shadow, and 1px `#E4E7EC` border.
- **Connector Status Card:** Displays connector standard (`CCS2` up to 120 kW or `Type 2` AC up to 22 kW), real-time pricing (`₹/kWh`), and an availability badge. Occupied cards shift connector titles to `#667085` and mute actionable borders.

### Telemetry Badges & Status Chips
- Height: 24px, pill-shaped (`9999px`), horizontal padding: 8px.
- **LIVE VEHICLE DATA:** `#ECFDF3` fill, `#16A05D` border, `#027A48` bold label with an animated 6px `#20A85A` pulsing indicator dot.
- **DEMO / SIMULATED VEHICLE DATA:** `#FEF0C7` fill, `#F2A900` border, `#B54708` bold label with a static amber alert icon.
- **Plug Availability Chips:** Solid status color indicator followed by connector name (e.g., `● Available (2/4 Guns)`).

### Input Fields
- `10px` radius, `44px` height, `#FFFFFF` background, `1px solid #E4E7EC` border.
- Focus: `1px solid #16A05D` with `0 0 0 3px rgba(22, 160, 93, 0.15)`.
- Numeric input fields for tariff or charge limit percentages (`% SoC`) enforce right-aligned values with persistent trailing units.

### Bottom Sheets & Modals
- `24px` radius on top-left and top-right corners.
- Fixed 4px × 36px drag handle colored in `#E4E7EC` positioned 8px from sheet top.
- Includes fixed bottom execution footer with dual-action buttons (`Dismiss` and `Confirm Charge`).

### Agentic Intelligence Drawer
- A collapsible card surface styled with a 1px border of `#7C5CFC` at 30% opacity and an ultra-subtle gradient header from `#F9F7FF` to `#FFFFFF`. Houses autonomous route-charge proposals, battery preconditioning alerts, and real-time dynamic pricing shifts along corridors like OMR (Old Mahabalipuram Road) and GST Road.