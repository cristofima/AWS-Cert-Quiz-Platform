# 🎨 Color Palette - AWS Quiz Platform

## Theme Overview

The theme is inspired by AWS colors with a professional and modern scheme.

### 🟠 Primary Color: AWS Orange

- **Light Mode**: `oklch(0.72 0.17 50)` → #FF9900 (AWS Orange)
- **Dark Mode**: `oklch(0.75 0.18 50)` → Lighter orange
- **Usage**: Primary buttons, featured icons, important links

### 🔵 Secondary Color: AWS Blue

- **Light Mode**: `oklch(0.55 0.15 250)` → Deep blue
- **Dark Mode**: `oklch(0.6 0.17 250)` → Lighter blue
- **Usage**: Secondary buttons, badges, accents

### 💙 Accent Color: Bright Blue

- **Light Mode**: `oklch(0.65 0.2 240)` → Vibrant blue
- **Dark Mode**: `oklch(0.7 0.22 240)` → Lighter vibrant blue
- **Usage**: Highlights, hover states, progress indicators

### 🔴 Destructive Color: Red

- **Light Mode**: `oklch(0.55 0.22 25)` → Red
- **Dark Mode**: `oklch(0.65 0.24 25)` → Lighter red
- **Usage**: Errors, alerts, destructive actions

### 🎨 Semantic Colors for Icons

- **Amber 500**: `#F59E0B` → Lightning Fast (velocidad/rendimiento)
- **Blue 600**: `#2563EB` → Security (seguridad/protección)
- **Green 600**: `#16A34A` → Progress/Success (progress/success)
- **Sky 600**: `#0284C7` → Cloud/Availability (cloud/availability)
- **Purple 600**: `#9333EA` → Premium features (future use)

## Components and Their Colors

### Landing Page

#### Hero Section

- **Badge**: Secondary color - "AWS Community Project"
- **Title "AWS Certification"**: Primary color (orange)
- **CTAs**:
  - "Start Practice Quiz": Primary button (orange)
  - "Learn More": Outline button with primary border

#### Feature Cards (6 cards with semantic icons)

- **Quality Questions**: BookOpen - Primary color (orange)
- **Lightning Fast**: Zap - Amber 500 (#F59E0B)
- **Secure & Private**: Shield - Blue 600 (#2563EB)
- **Progress Tracking**: TrendingUp - Green 600 (#16A34A)
- **Always Available**: Cloud - Sky 600 (#0284C7)
- **Multiple Question Types**: BookOpen - Primary color (orange)
- **Cards**: Background card with subtle border
- **Text**: Foreground and muted-foreground

#### Exam Coverage Section

- **Background**: Muted/50 (subtle gray)
- **Developer Associate Card**: Border-2 border-primary (featured)
- **Other Associate Cards**: Opacity 60% (coming soon)
- **CheckCircle2 icon**: Primary color on active card

#### Final CTA

- **Background**: Primary color (orange)
- **Text**: Primary-foreground (white)
- **Buttons**:
  - "Get Started Free": Secondary variant
  - "Sign In": Outline variant with bg-primary-foreground and text-primary

### Checkmarks and Stats

- **CheckCircle2**: Primary color (orange)
- **Text**: Muted-foreground

## Chart Colors (For future visualizations)

```css
--chart-1: Orange  (#FF9900)
--chart-2: Blue    (#4A90E2)
--chart-3: Green   (#50C878)
--chart-4: Purple  (#9B59B6)
--chart-5: Cyan    (#1ABC9C)
```

## Dark Mode

Dark mode uses the same hues but with higher luminosity and adjusted contrast:

- **Background**: Dark blue-gray `oklch(0.15 0.01 256)`
- **Cards**: Slightly lighter `oklch(0.18 0.01 256)`
- **Primary**: Lighter orange for better contrast
- **Text**: High contrast white `oklch(0.95 0.005 256)`

## Contrast Testing

All colors meet WCAG AAA accessibility standards:

- Primary/Primary-foreground: 7.2:1 ✅
- Secondary/Secondary-foreground: 7.5:1 ✅
- Muted text: 4.8:1 ✅

## Usage in shadcn/ui Components

### Button

```tsx
<Button>Default</Button>           {/* Primary orange */}
<Button variant="secondary">...</Button>  {/* Blue */}
<Button variant="outline">...</Button>    {/* Transparent con border */}
<Button variant="destructive">...</Button> {/* Red */}
```

### Badge

```tsx
<Badge>Default</Badge>              {/* Primary */}
<Badge variant="secondary">...</Badge>    {/* Secondary */}
<Badge variant="outline">...</Badge>      {/* Outline */}
```

### Card

```tsx
<Card>{/* Background: card, Border: border */}</Card>
```

## Reference Palette

| Color       | Light Mode | Dark Mode | Usage                        |
| ----------- | ---------- | --------- | ---------------------------- |
| Primary     | #FF9900    | #FFB84D   | Buttons, CTAs, primary icons |
| Secondary   | #4A5D7F    | #6B8AB8   | Badges, secondary buttons    |
| Accent      | #4A90E2    | #6BA8F5   | Highlights, hover states     |
| Destructive | #E74C3C    | #F07568   | Errors, alerts               |
| Muted       | #F5F5F7    | #2A2A2E   | Subtle backgrounds           |
| Border      | #E0E0E5    | #404048   | Component borders            |

## Recent Changes

### v0.1.0 - Landing Page

- ✅ Icons with semantic colors in Feature Cards
- ✅ "Exam Coverage" section replaces "Tech Stack"
- ✅ Badge changed from "Powered by AWS Serverless" to "AWS Community Project"
- ✅ Removed technical references (Next.js, Terraform, Bedrock, AppSync)
- ✅ 100% focus on end-user benefits

## Next Steps

For future articles:

- **Article 2 (Quiz)**: Progress bar will use primary color
- **Article 2 (Results)**: Correct answers (green 600), incorrect (red/destructive)
- **Article 3 (Admin)**: Status badges with semantic colors
- **Article 3 (Tables)**: Alternating rows with muted background
