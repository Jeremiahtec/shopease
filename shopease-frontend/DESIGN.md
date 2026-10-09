---
name: Modern Multi-Vendor Commerce
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#5c00ca'
  on-tertiary: '#ffffff'
  tertiary-container: '#7531e6'
  on-tertiary-container: '#e4d4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-canvas: '#F8FAFC'
  surface-card: '#FFFFFF'
  vendor-primary: '#7C3AED'
  vendor-accent: '#0D9488'
  customer-primary: '#4F46E5'
  customer-accent: '#10B981'
  status-pending: '#F59E0B'
  status-paid: '#10B981'
  status-processing: '#3B82F6'
  status-shipped: '#6366F1'
  status-cancelled: '#EF4444'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
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
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a high-trust, structured, and modern commerce environment catering to both marketplace buyers and commercial vendors. The brand personality blends institutional reliability with frictionless digital retail: calm, organized, and confident. 

Drawing from **Corporate / Modern** principles with subtle tactile polish, the interface maintains an airy hierarchy. The platform visually segments user modes (Customer vs. Vendor) through intentional chromatic accent keys while anchoring all journeys within a unified, crisp architectural framework. Pure white elevated cards sit against subtle slate-tinted canvas backdrops, reducing eye fatigue during intensive administrative cataloging while spotlighting merchandise imagery for shopping experiences.

## Colors
The color palette relies on an organized functional role distribution:
- **Primary (`#4F46E5` - Vibrant Indigo):** The baseline customer action driver, focal purchase triggers, and universal brand identity.
- **Secondary (`#10B981` - Emerald):** Conversion cues, success metrics, cart affirmations, and stock confirmations.
- **Tertiary (`#7C3AED` - Royal Violet):** Dedicated Vendor workspace indicator, analytics focus states, and merchant management workflows.
- **Neutral (`#64748B` - Slate):** Cool gray scale delivering sharp typography, low-contrast structural borders, and subtle muted layers without warmth or muddiness.

### Role Partitioning
- **Customer Viewports:** Indigo primary navigation and interactive focus, accented by emerald tags and primary checkout actions.
- **Vendor Viewports:** Deep royal violet navigation shell with teal (`#0D9488`) analytical accents, giving immediate contextual awareness of shop-owner permissions.
- **Order States:** Explicit functional badge tokens define operational lifecycle transitions cleanly against white card backgrounds.

## Typography
The system employs **Plus Jakarta Sans** for headlines and display elements, introducing modern geometry, polished curves, and high legibility to store names, price banners, and section headers. 

**Inter** handles all body content, data density, inputs, tables, and transactional lists. Its neutral glyph construction ensures high visual throughput for dense catalog lists, tabular data, inventory calculations, and validation states. Large desktop headlines automatically transition down to responsive mobile variants below the 768px threshold to preserve balance.

## Layout & Spacing
The layout follows an adaptive 12-column responsive fluid grid:
- **Desktop (>=1024px):** 12 columns with 24px (`1.5rem`) gutters and a maximum content constraint of 1280px centered with 32px (`2rem`) outer margins.
- **Tablet (768px - 1023px):** 8 columns with 16px (`1rem`) gutters and 24px margins.
- **Mobile (<768px):** 4 columns with 16px (`1rem`) gutters and 16px (`1rem`) outer canvas margins.

The spacing rhythm adheres strictly to an 8px base grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 40px). Product cards and analytics panels maintain internal padding of `space-lg`, collapsing to `space-md` on mobile devices.

## Elevation & Depth
Depth is created using a combination of cool-tinted ambient shadows and subtle hairline borders:
- **Canvas Base:** `#F8FAFC` represents the zero-elevation background.
- **Surface Level 1 (Cards, Product Tiles):** `#FFFFFF` paired with a low-contrast perimeter border (`1px solid #E2E8F0`) and an ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Surface Level 2 (Dropdowns, Cart Flyouts, Hovered Cards):** Floating panels use `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` with `#FFFFFF` background.
- **Surface Level 3 (Modals, Overlays):** `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

All elevations maintain a cool slate tint (`rgba(15, 23, 42, ...)`) instead of neutral black, keeping shadows clean, soft, and modern.

## Shapes
The UI adheres to a balanced curvature (`roundedness: 2`):
- Standard interactive elements, form fields, tab buttons, and small cards use `0.5rem` (8px).
- Large product presentation cards, merchant stat overview panels, and modal containers use `rounded-lg` (`1rem` / 16px) or `12px` (`0.75rem`) for standard cards.
- Pills and operational status tags utilize full circular rounding (`9999px`) to create clear shape differentiation from structured rectangular data grids.

## Components

### Buttons
- **Primary (Customer):** `#4F46E5` fill, `#FFFFFF` text, 8px radius, hover shift to `#4338CA`.
- **Primary (Vendor):** `#7C3AED` fill, `#FFFFFF` text, 8px radius, hover shift to `#6D28D9`.
- **Secondary:** `#FFFFFF` background, `1px solid #CBD5E1` border, `#0F172A` text, hover `#F1F5F9`.
- **Destructive:** `#EF4444` background with white text, or ghost outline for table row actions.

### Form Fields & Validation States
- **Default:** Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`, radius 8px, 12px vertical padding.
- **Focused:** Indigo or Royal Violet outline ring (`2px offset`, 20% opacity) based on portal context.
- **Invalid / Error:** Border `#EF4444`, red validation helper text below field, red alert icon aligned right inside the input.
- **Success:** Border `#10B981`, optional emerald checkmark indicator.

### Product & Vendor Cards
- Rendered on `#FFFFFF` surfaces with `1px solid #E2E8F0` and `8px` or `12px` rounded corners.
- Padding set to `1.5rem` on desktop, `1rem` on mobile. Product image container spans edge-to-edge at top with `12px` top radius.

### Chips & Status Badges
- Semi-transparent tinted background fills (15% opacity of base color) paired with high-contrast saturated text:
  - **PENDING:** Background `#FEF3C7`, text `#D97706`.
  - **PAID / ACTIVE:** Background `#D1FAE5`, text `#059669`.
  - **CANCELLED / INACTIVE:** Background `#FEE2E2`, text `#DC2626`.
- 9999px border radius with `label-sm` typography.

### Tabs & Navigation
- Segmented pill or underline options. Underline tabs utilize a 2px active indicator with `#4F46E5` (Customer) or `#7C3AED` (Vendor). Inactive links remain `#64748B` with hover transition to `#0F172A`.

### Tables (Vendor/Admin Order Management)
- Clean alternating or plain `#FFFFFF` rows divided by `1px solid #F1F5F9`.
- Header text set in `label-sm` uppercase `#64748B` on `#F8FAFC` backgrounds.