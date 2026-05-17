# UI/UX Design Brief
## OrgByte Verification Management Dashboard
**For:** Google Stitch Mockup Generation
**Version:** 1.0
**Companion documents:** PRD v1.0, TRD v1.0

---

## 1. Project Context

This is a web-based admin dashboard for managing user verification. An administrator can view all users, filter them by verification status, search them by name, and update their status in real time without a page reload.

The product must feel like a serious, professional internal tool — clean, high-information density, no decorative clutter. Think less startup landing page, more internal ops tool used by a compliance team.

**Platform:** Desktop-first web app. Must be responsive down to tablet (768px). Mobile is not the primary use case.

---

## 2. Brand and Color System

These are OrgByte's exact brand colors. Every UI element must map to this hierarchy — no freestyle color additions.

| Token | Hex | Role |
|---|---|---|
| Blue — Primary | `#1D4ED8` | Header, active states, primary buttons, focus rings |
| Blue Light | `#DBEAFE` | Inactive filter tabs, tag backgrounds, hover surfaces |
| Blue Dark | `#1E3A8A` | Header shadow, pressed button states |
| Green — Secondary | `#16A34A` | Verified status badge, success confirmations |
| Green Light | `#DCFCE7` | Verified badge background |
| Amber | `#D97706` | Pending status badge text |
| Amber Light | `#FEF3C7` | Pending badge background |
| Gray | `#6B7280` | Unverified badge text, muted body copy |
| Gray Light | `#F3F4F6` | Unverified badge background, page background |
| White | `#FFFFFF` | Card surfaces, input backgrounds |
| Dark Text | `#111827` | Primary headings and labels |
| Body Text | `#374151` | Body copy, card content |

**Hierarchy rule:** Blue is dominant. Green is a reward signal — only appears when something is confirmed or verified. Amber signals caution. Gray signals inactivity. Never use Green as a structural color — it belongs only to success/verified states.

---

## 3. Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Page title | Inter or similar sans | 600 | 22px |
| Section headings | Inter | 600 | 16px |
| Card user name | Inter | 600 | 15px |
| Body / labels | Inter | 400 | 14px |
| Badge text | Inter | 500 | 12px |
| Supporting copy | Inter | 400 | 13px |
| Input placeholder | Inter | 400 | 14px, gray |

---

## 4. Page Layout — Dashboard (Main Screen)

This is the only screen. The app is a single-page dashboard with no navigation between pages.

### 4.1 Overall Structure

```
┌─────────────────────────────────────────────────────┐
│                    HEADER BAR                       │
├─────────────────────────────────────────────────────┤
│   FILTER TABS          │        SEARCH INPUT        │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │  CARD   │  │  CARD   │  │  CARD   │           │
│   └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │  CARD   │  │  CARD   │  │  CARD   │           │
│   └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │  CARD   │  │  CARD   │  │         │           │
│   └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Header Bar

- Full viewport width
- Background: `#1D4ED8` (Blue Primary)
- Height: 60px
- Left side: "OrgByte" logo text or wordmark in white, 20px, font-weight 700
- Right of logo: a subtle separator, then the title "Verification Dashboard" in white, 16px, font-weight 400, opacity 0.9
- Right side: a small user avatar circle placeholder (32px, white border, no actual user info needed for mockup) with a name label beside it in white
- No navigation links — this is a single-screen tool

### 4.3 Controls Row

- Background: white
- Padding: 20px horizontal, 16px vertical
- Border-bottom: 1px solid `#E5E7EB`
- Two-column layout: filter tabs on the left, search input on the right
- They sit on the same horizontal line (flex row, space-between)

### 4.4 Stats Strip (Optional Enhancement)

Directly below the header, above the controls row — a thin strip of three summary numbers:

```
  Total: 10    Verified: 4    Pending: 3    Unverified: 3
```

- Background: `#F3F4F6` (Gray Light)
- Height: 40px
- Text: 13px, `#6B7280`
- Numbers in bold, colored to match their status (blue for total, green for verified, amber for pending, gray for unverified)
- This is a bonus element — include it if Stitch renders it cleanly

### 4.5 User Card Grid

- Background: `#F3F4F6` (page background)
- Padding: 24px
- Grid: 3 columns on desktop, 2 on tablet, gap: 20px

---

## 5. Component Designs

### 5.1 Filter Bar

Four tab buttons in a row: **All**, **Verified**, **Pending**, **Unverified**

**Active tab:**
- Background: `#1D4ED8`
- Text: white
- Font-weight: 500
- Font-size: 14px
- Padding: 8px 20px
- Border-radius: 8px

**Inactive tab:**
- Background: `#DBEAFE`
- Text: `#1D4ED8`
- Font-weight: 400
- Same padding and border-radius
- Hover state: slightly darker blue light background

Tabs sit in a single row with 8px gap between them. No outer border on the group.

---

### 5.2 Search Input

- Width: 260px (fixed on desktop, full-width on mobile)
- Height: 40px
- Background: white
- Border: 1px solid `#D1D5DB`
- Border-radius: 8px
- Padding: 0 12px 0 36px (left padding leaves room for the search icon)
- A small magnifying glass icon (`#9CA3AF`, 16px) sits inside the left edge
- Placeholder text: "Search by name..."
- Focus state: border becomes `#1D4ED8`, box-shadow: 0 0 0 3px `#DBEAFE`

---

### 5.3 User Card

Each card represents one user. All 10 cards are the same component, only the content differs.

**Card container:**
- Background: white
- Border: 1px solid `#E5E7EB`
- Border-radius: 12px
- Padding: 20px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.06)
- No hover animation needed — this is an admin tool, not a clickable item

**Card internal layout (top to bottom):**

```
┌──────────────────────────────────┐
│  [Avatar]  Full Name             │
│            Role/type label       │
│                                  │
│  [Category tag]  [Category tag]  │
│                                  │
│  ─────────────────────────────── │
│                                  │
│  Status:  [STATUS BADGE]         │
│                                  │
│  Update:  [─── Dropdown ──────]  │
└──────────────────────────────────┘
```

**Avatar:**
- 40px circle
- Background: a light blue tint (`#DBEAFE`)
- Text: user initials, `#1D4ED8`, 14px, font-weight 600
- Position: left of name, vertically centered with the name block

**User name:**
- 15px, font-weight 600, `#111827`

**Supporting label under name:**
- 13px, `#6B7280`
- Content: "Verification Member" or similar — a static label, same on all cards

**Category tags:**
- Small pill-shaped tags
- Background: `#DBEAFE`
- Text: `#1D4ED8`, 12px, font-weight 500
- Padding: 3px 10px
- Border-radius: 20px (full pill)
- Multiple tags sit in a row, wrapping if needed, with 6px gap

**Divider:**
- A 1px horizontal rule, `#F3F4F6`, separating the top info from the status area

**Status row:**
- Label: "Status" in 13px `#6B7280` on the left
- Status badge on the right (see Section 5.4)
- They sit on the same line, space-between

**Update row:**
- Label: "Update to" in 13px `#6B7280` on the left (optional, can be above the dropdown)
- A `<select>` dropdown below, full-width within the card
- Dropdown height: 36px
- Border: 1px solid `#D1D5DB`
- Border-radius: 8px
- Background: white
- Font-size: 14px
- Options: "Verified", "Pending", "Unverified"
- The dropdown shows the current status as the selected value
- Focus: border `#1D4ED8`, ring `#DBEAFE`

---

### 5.4 Status Badge

A small pill showing the current verification status. Three variants:

**Verified:**
- Background: `#DCFCE7`
- Text: `#16A34A`
- Text content: "Verified"
- A small checkmark icon (`✓`) before the text (optional)

**Pending:**
- Background: `#FEF3C7`
- Text: `#D97706`
- Text content: "Pending"
- A small clock icon before the text (optional)

**Unverified:**
- Background: `#F3F4F6`
- Text: `#6B7280`
- Text content: "Unverified"

**All badges:**
- Font-size: 12px
- Font-weight: 500
- Padding: 4px 10px
- Border-radius: 20px (full pill)

---

### 5.5 Loading State

Shown when the page first loads, while the API fetch is in flight. Replaces the card grid.

**Design:**
- Show 6 placeholder cards in the grid (skeleton cards)
- Each skeleton card matches the exact dimensions of a real user card
- The avatar circle, name line, category area, and status area are replaced with soft gray animated shimmer bars
- Shimmer animation: a horizontal light sweep from left to right, looping, using `#F3F4F6` as the base with a `#E5E7EB` highlight
- No text, no actual content in skeleton cards

---

### 5.6 Empty State

Shown when the active filter and search query together return zero users. Replaces the card grid.

**Design:**
- Centered in the grid area
- A simple illustration or icon (a magnifying glass finding nothing, or a clean empty inbox-style icon) — use a line-art style, `#D1D5DB`
- Heading below the icon: "No users found" — 16px, `#374151`, font-weight 600
- Subheading: "Try adjusting your filters or search term" — 14px, `#6B7280`
- Total height of the empty state block: approximately 200px
- No buttons or CTAs — just the message

---

### 5.7 Error State

Shown if the initial `GET /users` fetch fails. Replaces everything below the header.

**Design:**
- Centered on the page
- Icon: a broken connection or warning triangle, `#D1D5DB`, 48px
- Heading: "Unable to load users" — 16px, `#374151`, font-weight 600
- Subheading: "Check your connection and try again" — 14px, `#6B7280`
- A "Retry" button: `#1D4ED8` background, white text, 14px, 36px tall, padding 0 20px, border-radius 8px

---

## 6. Screen States to Generate

Generate mockups for the following distinct states. Each is a full-page screenshot at 1280px wide desktop.

### Screen 1 — Loading State
The header and controls row are visible. The filter tabs show "All" as active. The search input is empty. The card grid area shows 9 skeleton/shimmer placeholder cards.

### Screen 2 — Dashboard (Default, All Users)
The full dashboard with all 10 user cards loaded. Filter tab "All" is active (blue). Search input is empty. Cards are in a 3-column grid. Each card shows realistic content: a name, initials avatar, 1-2 category tags, a status badge, and a dropdown selector.

**Suggested card contents for the mockup:**
1. Amara Osei — Verified — [Passport] [Bank Statement]
2. Emeka Nwosu — Pending — [ID] [Utility Bill]
3. Fatima Al-Hassan — Unverified — [ID]
4. Chidi Okeke — Verified — [Business Reg] [Tax Certificate]
5. Ngozi Adeyemi — Pending — [Passport]
6. Kwame Mensah — Unverified — [Utility Bill] [Bank Statement]
7. Zainab Bello — Verified — [ID] [Passport] [Bank Statement]
8. Tunde Fashola — Pending — [Tax Certificate]
9. Adaeze Eze — Verified — [Business Reg] [Utility Bill]
10. Seun Kuti — Unverified — [ID] [Tax Certificate]

### Screen 3 — Filtered View (Verified Only)
The filter tab "Verified" is active (highlighted blue). All other tabs are inactive. The grid shows only the 4 verified users (Amara, Chidi, Zainab, Adaeze). The remaining space in the grid is empty — not filled with placeholders.

### Screen 4 — Search Active
The filter tab "All" is still active. The search input contains the text "em" (lowercase). The grid shows only cards whose names contain "em": Emeka Nwosu and Kwame Mensah. Two cards in the grid. The search field should look active — focused border, text visible.

### Screen 5 — Empty State
The filter tab "Pending" is active. The search input contains "xyz" — a name that matches nothing. The grid area is replaced with the empty state illustration and message. Header and controls row remain unchanged.

### Screen 6 — Status Update (In Progress)
One card — Fatima Al-Hassan, currently "Unverified" — has the dropdown open, showing the three options (Verified, Pending, Unverified) with "Verified" being hovered/highlighted. The other cards are unchanged. This illustrates the status change flow mid-interaction.

---

## 7. Spacing and Sizing Reference

| Element | Value |
|---|---|
| Page horizontal padding | 24px |
| Header height | 60px |
| Controls row height | 64px |
| Stats strip height | 40px (optional) |
| Card grid gap | 20px |
| Card padding | 20px |
| Card border-radius | 12px |
| Avatar size | 40px |
| Filter tab border-radius | 8px |
| Filter tab padding | 8px 20px |
| Status badge border-radius | 20px (pill) |
| Status badge padding | 4px 10px |
| Dropdown height | 36px |
| Search input width | 260px |
| Search input height | 40px |

---

## 8. Do Not Include

To keep the mockup clean and aligned with the TRD, instruct Stitch to avoid:

- No sidebar navigation
- No page routing or breadcrumbs
- No modal overlays or pop-up dialogs
- No pagination — all cards are on one scroll
- No dark mode variant (light mode only)
- No decorative illustrations in the header
- No rounded headers or curved section dividers
- No gradient backgrounds anywhere
- No shadow-heavy cards (keep shadows subtle: 1px, low-opacity)
- No color outside the defined brand palette

---

## 9. Stitch Prompt

Use this as the direct prompt input to Google Stitch:

---

> Design a web-based admin verification management dashboard for a company called OrgByte. The brand colors are Blue Primary (#1D4ED8), Blue Light (#DBEAFE), Green (#16A34A), Green Light (#DCFCE7), Amber (#D97706), Amber Light (#FEF3C7), and Gray (#6B7280) on a white (#FFFFFF) and light gray (#F3F4F6) background.
>
> The layout has three parts: a full-width blue header bar (60px tall) with the "OrgByte" wordmark on the left in white and a small user avatar on the right; a controls row (white background, border-bottom) with four filter tab buttons on the left ("All" active in blue, "Verified", "Pending", "Unverified" inactive in light blue) and a search input on the right (260px, with a search icon, placeholder "Search by name..."); and a card grid below (3 columns, gap 20px, gray page background).
>
> Each user card is white with a 1px border (#E5E7EB), 12px border-radius, 20px padding, and a subtle box-shadow. The card shows: a 40px avatar circle (light blue background, blue initials text) with the user's full name (15px, bold, dark) beside it; a row of pill-shaped category tags below the name (blue text on light blue background, 12px, fully rounded); a horizontal divider; a "Status" label on the left with a status badge pill on the right (Verified = green pill, Pending = amber pill, Unverified = gray pill); and a full-width dropdown below to update the status.
>
> Show the dashboard in the "All Users" state with 10 cards in a 3-column grid. Users: Amara Osei (Verified, Passport + Bank Statement), Emeka Nwosu (Pending, ID + Utility Bill), Fatima Al-Hassan (Unverified, ID), Chidi Okeke (Verified, Business Reg + Tax Certificate), Ngozi Adeyemi (Pending, Passport), Kwame Mensah (Unverified, Utility Bill + Bank Statement), Zainab Bello (Verified, ID + Passport + Bank Statement), Tunde Fashola (Pending, Tax Certificate), Adaeze Eze (Verified, Business Reg + Utility Bill), Seun Kuti (Unverified, ID + Tax Certificate).
>
> The overall aesthetic should be clean, professional, and data-dense. No gradients, no dark mode, no sidebar. This is an internal admin tool for a compliance team.

---

*This brief is the design source of truth. All mockups generated from it must be validated against the PRD color system and TRD component specifications before development begins.*
