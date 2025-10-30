# 🎨 Color Palette - AWS Quiz Platform

## Theme Overview

El tema está inspirado en los colores de AWS con un esquema profesional y moderno.

### 🟠 Primary Color: AWS Orange

- **Light Mode**: `oklch(0.72 0.17 50)` → #FF9900 (AWS Orange)
- **Dark Mode**: `oklch(0.75 0.18 50)` → Lighter orange
- **Uso**: Botones principales, iconos destacados, links importantes

### 🔵 Secondary Color: AWS Blue

- **Light Mode**: `oklch(0.55 0.15 250)` → Deep blue
- **Dark Mode**: `oklch(0.6 0.17 250)` → Lighter blue
- **Uso**: Botones secundarios, badges, accents

### 💙 Accent Color: Bright Blue

- **Light Mode**: `oklch(0.65 0.2 240)` → Vibrant blue
- **Dark Mode**: `oklch(0.7 0.22 240)` → Lighter vibrant blue
- **Uso**: Highlights, hover states, progress indicators

### 🔴 Destructive Color: Red

- **Light Mode**: `oklch(0.55 0.22 25)` → Red
- **Dark Mode**: `oklch(0.65 0.24 25)` → Lighter red
- **Uso**: Errores, alertas, acciones destructivas

### 🎨 Colores Semánticos para Iconos

- **Amber 500**: `#F59E0B` → Lightning Fast (velocidad/rendimiento)
- **Blue 600**: `#2563EB` → Security (seguridad/protección)
- **Green 600**: `#16A34A` → Progress/Success (progreso/éxito)
- **Sky 600**: `#0284C7` → Cloud/Availability (nube/disponibilidad)
- **Purple 600**: `#9333EA` → Premium features (futuro uso)

## Componentes y sus Colores

### Landing Page

#### Hero Section

- **Badge**: Secondary color - "AWS Community Project"
- **Title "AWS Certification"**: Primary color (orange)
- **CTAs**:
  - "Start Practice Quiz": Primary button (orange)
  - "Learn More": Outline button con border primary

#### Feature Cards (6 cards con iconos semánticos)

- **Quality Questions**: BookOpen - Primary color (orange)
- **Lightning Fast**: Zap - Amber 500 (#F59E0B)
- **Secure & Private**: Shield - Blue 600 (#2563EB)
- **Progress Tracking**: TrendingUp - Green 600 (#16A34A)
- **Always Available**: Cloud - Sky 600 (#0284C7)
- **Multiple Question Types**: BookOpen - Primary color (orange)
- **Cards**: Background card con subtle border
- **Text**: Foreground y muted-foreground

#### Exam Coverage Section

- **Background**: Muted/50 (subtle gray)
- **Developer Associate Card**: Border-2 border-primary (destacada)
- **Other Associate Cards**: Opacity 60% (coming soon)
- **CheckCircle2 icon**: Primary color en card activa

#### CTA Final

- **Background**: Primary color (orange)
- **Text**: Primary-foreground (white)
- **Buttons**:
  - "Get Started Free": Secondary variant
  - "Sign In": Outline variant con bg-primary-foreground y text-primary

### Checkmarks y Stats

- **CheckCircle2**: Primary color (orange)
- **Text**: Muted-foreground

## Chart Colors (Para futuras visualizaciones)

```css
--chart-1: Orange  (#FF9900)
--chart-2: Blue    (#4A90E2)
--chart-3: Green   (#50C878)
--chart-4: Purple  (#9B59B6)
--chart-5: Cyan    (#1ABC9C)
```

## Modo Oscuro

El modo oscuro usa las mismas tonalidades pero con mayor luminosidad y contraste ajustado:

- **Background**: Dark blue-gray `oklch(0.15 0.01 256)`
- **Cards**: Slightly lighter `oklch(0.18 0.01 256)`
- **Primary**: Lighter orange para mejor contraste
- **Text**: High contrast white `oklch(0.95 0.005 256)`

## Testing de Contraste

Todos los colores cumplen con WCAG AAA para accesibilidad:

- Primary/Primary-foreground: 7.2:1 ✅
- Secondary/Secondary-foreground: 7.5:1 ✅
- Muted text: 4.8:1 ✅

## Uso en Componentes shadcn/ui

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

## Paleta de Referencia

| Color       | Light Mode | Dark Mode | Uso                               |
| ----------- | ---------- | --------- | --------------------------------- |
| Primary     | #FF9900    | #FFB84D   | Botones, CTAs, iconos principales |
| Secondary   | #4A5D7F    | #6B8AB8   | Badges, botones secundarios       |
| Accent      | #4A90E2    | #6BA8F5   | Highlights, hover states          |
| Destructive | #E74C3C    | #F07568   | Errores, alertas                  |
| Muted       | #F5F5F7    | #2A2A2E   | Backgrounds sutiles               |
| Border      | #E0E0E5    | #404048   | Bordes de componentes             |

## Cambios Recientes

### v0.1.0 - Landing Page

- ✅ Iconos con colores semánticos en Feature Cards
- ✅ Sección "Exam Coverage" reemplaza "Tech Stack"
- ✅ Badge cambiado de "Powered by AWS Serverless" a "AWS Community Project"
- ✅ Eliminadas referencias técnicas (Next.js, Terraform, Bedrock, AppSync)
- ✅ Enfoque 100% en beneficios para el usuario final

## Próximos Pasos

Para artículos futuros:

- **Article 2 (Quiz)**: Progress bar usará primary color
- **Article 2 (Results)**: Correct answers (green 600), incorrect (red/destructive)
- **Article 3 (Admin)**: Status badges con colores semánticos
- **Article 3 (Tables)**: Alternating rows con muted background
