# EventHub UI System Documentation

A comprehensive design system for the EventHub Nuxt 4 application, built with Vue 3 Composition API, TypeScript, Nuxt UI, and Tailwind CSS.

## Design Tokens

### Colors

The primary color palette is based on purple (#8743f4):

```css
--color-primary-50: #f5f0ff
--color-primary-100: #ede5ff
--color-primary-200: #ddceff
--color-primary-300: #c4a8ff
--color-primary-400: #a873ff
--color-primary-500: #8743f4  /* Primary */
--color-primary-600: #7a2ee8
--color-primary-700: #6b22cc
--color-primary-800: #5a1ea6
--color-primary-900: #4b1c85
--color-primary-950: #2d0f52
```

### Background Colors

```css
--color-background-light: #f7f5f8
--color-background-dark: #171022
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold), 900 (Black)

### Spacing

Uses Tailwind's default spacing scale with custom page container:
- `.page-container`: `mx-auto max-w-7xl px-6 md:px-10 lg:px-20`

### Border Radius

- Default: `0.5rem`
- Large: `1rem` (`.rounded-lg`)
- Extra Large: `1.5rem` (`.rounded-xl`)
- 2XL: `2rem` (`.rounded-2xl`)

---

## Layouts

### `layouts/public.vue`
For public-facing pages (landing, events, discovery).

**Features:**
- Responsive navbar with brand, navigation links, and auth buttons
- Full-featured footer with link sections and social icons
- Mobile menu with slide animation

**Usage:**
```vue
<script setup>
definePageMeta({
  layout: 'public'
})
</script>
```

### `layouts/auth.vue`
For authentication pages (login, register, forgot password).

**Features:**
- Split-screen design with hero panel
- Stats display on hero side
- Responsive (single column on mobile)

**Props:**
- `heroTitle`: Main hero text
- `heroSubtitle`: Supporting text
- `heroImage`: Optional background image
- `showHeroStats`: Toggle stats display
- `stats`: Array of stat objects

**Usage:**
```vue
<script setup>
definePageMeta({
  layout: 'auth'
})
</script>
```

### `layouts/organizer.vue`
Dashboard layout for event organizers.

**Features:**
- Collapsible sidebar with navigation
- Top header with search and actions
- Mobile-responsive drawer
- User profile card in sidebar

### `layouts/attendee.vue`
Dashboard layout for event attendees.

**Features:**
- Sidebar with main and account navigation sections
- Search bar in header
- Notification bell with indicator
- Find Events call-to-action

### `layouts/admin.vue`
Dashboard layout for administrators.

---

## Components

### Dashboard Components

#### `StatsCard`
Displays statistical information with trend indicators.

**Props:**
- `title`: string - Metric label
- `value`: string | number - Metric value
- `icon`: string - Lucide icon name (optional)
- `materialIcon`: string - Material Symbol name (optional)
- `trend`: { value: string | number, direction: 'up' | 'down' | 'neutral' }
- `subtitle`: string - Additional context
- `variant`: 'blue' | 'purple' | 'amber' | 'emerald' | 'slate' | 'primary'
- `loading`: boolean

**Usage:**
```vue
<StatsCard
  title="Total Revenue"
  value="TZS 18,450,000"
  material-icon="monetization_on"
  :trend="{ value: '+14.2%', direction: 'up' }"
  subtitle="vs. last 30 days"
  variant="blue"
/>
```

#### `StatusBadge`
Displays status with colored indicator dot.

**Props:**
- `status`: Status type string
- `variant`: 'dot' | 'solid' | 'outline'
- `size`: 'xs' | 'sm' | 'md'
- `showDot`: boolean

**Supported statuses:**
- Events: `active`, `on-sale`, `selling-fast`, `sold-out`, `draft`, `cancelled`, `pending`
- Participants: `registered`, `confirmed`, `checked_in`, `checked_out`, `no_show`
- Tickets: `valid`, `used`, `expired`, `transferred`
- Sessions: `scheduled`, `in_progress`, `completed`

**Usage:**
```vue
<StatusBadge status="on-sale" />
<StatusBadge status="selling-fast" size="sm" />
```

### Public Components

#### `HeroSection`
Landing page hero with search functionality.

**Props:**
- `title`: string - Main heading
- `highlight`: string - Highlighted text (colored)
- `subtitle`: string - Supporting text
- `backgroundImage`: string - Hero background
- `showSearch`: boolean - Toggle search bar
- `showLocationSelect`: boolean - Toggle location dropdown
- `locations`: string[] - Location options

**Events:**
- `@search`: Emits (query: string, location?: string)

**Usage:**
```vue
<HeroSection
  title="Discover Amazing Events "
  highlight="Near You"
  subtitle="Find events in your city"
  background-image="/hero.jpg"
  @search="handleSearch"
/>
```

#### `EventCard`
Event listing card with image and details.

**Props:**
- `id`: string | number
- `title`: string
- `image`: string
- `date`: string
- `location`: string
- `price`: string | number
- `category`: string
- `attendees`: string | number
- `isFavorite`: boolean

**Events:**
- `@click`: Emits event ID
- `@favorite`: Emits event ID

**Usage:**
```vue
<EventCard
  id="1"
  title="Tech Summit 2024"
  image="/event.jpg"
  date="Nov 24"
  location="Convention Center"
  :price="99"
  category="Technology"
  @click="viewEvent"
/>
```

#### `CategoryButton`
Category filter pill button.

**Props:**
- `label`: string
- `icon`: string - Material Symbol name
- `active`: boolean

**Usage:**
```vue
<CategoryButton
  label="Music"
  icon="music_note"
  :active="activeCategory === 'music'"
  @click="setCategory('music')"
/>
```

#### `CityCard`
City selection card with image overlay.

**Props:**
- `name`: string
- `image`: string
- `eventCount`: number

**Usage:**
```vue
<CityCard
  name="Dar es Salaam"
  image="/city.jpg"
  :event-count="156"
  @click="selectCity"
/>
```

#### `FeatureStep`
How-it-works step component.

**Props:**
- `step`: number
- `title`: string
- `description`: string
- `icon`: string - Material Symbol name

### Auth Components

#### `SocialLoginButton`
OAuth provider login button.

**Props:**
- `provider`: 'google' | 'facebook' | 'twitter' | 'apple'
- `loading`: boolean

---

## CSS Utility Classes

### Buttons
```css
.btn-primary    /* Primary action button */
.btn-secondary  /* Secondary action button */
.btn-outline    /* Outlined button */
.btn-ghost      /* Ghost/text button */
.btn-icon       /* Icon-only button */
```

### Forms
```css
.input          /* Standard input field */
.input-with-icon /* Input with left icon padding */
```

### Cards
```css
.card           /* Base card style */
.card-hover     /* Card with hover effects */
```

### Badges
```css
.badge          /* Base badge */
.badge-primary  /* Primary colored badge */
.badge-success  /* Success/green badge */
.badge-warning  /* Warning/amber badge */
.badge-error    /* Error/red badge */
```

### Navigation
```css
.nav-link       /* Navigation link */
.nav-link-active /* Active navigation link */
.sidebar-link   /* Sidebar navigation link */
.sidebar-link-active /* Active sidebar link */
```

### Layout
```css
.page-container /* Max-width centered container */
.section-title  /* Section heading */
.section-subtitle /* Section subheading */
.glass          /* Glass morphism effect */
```

### Animations
```css
.animate-fade-in  /* Fade in animation */
.animate-slide-up /* Slide up animation */
.animate-scale-in /* Scale in animation */
```

### Utilities
```css
.no-scrollbar   /* Hide scrollbar */
.text-balance   /* Text wrap balance */
```

---

## Responsive Design

### Breakpoints
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

### Common Patterns

**Grid layouts:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

**Flex direction:**
```html
<div class="flex flex-col lg:flex-row">
```

**Responsive padding:**
```html
<div class="px-4 md:px-6 lg:px-8">
```

**Show/hide:**
```html
<div class="hidden md:flex">  <!-- Show on md+ -->
<div class="md:hidden">       <!-- Hide on md+ -->
```

---

## Dark Mode

Dark mode is supported via Tailwind's `dark:` prefix. The system respects user's system preference.

**Example:**
```html
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

---

## Icons

The system uses two icon libraries:

### Material Symbols (Primary)
```html
<span class="material-symbols-outlined">dashboard</span>
```

### Lucide Icons (via Nuxt UI)
```html
<UIcon name="i-lucide-calendar" />
```

---

## Component Directory Structure

```
components/
├── auth/
│   └── SocialLoginButton.vue
├── common/
│   ├── ConfirmModal.vue
│   ├── EmptyState.vue
│   ├── LoadingState.vue
│   ├── PageHeader.vue
│   └── StatusBadge.vue
├── dashboard/
│   ├── ActivityFeed.vue
│   ├── QuickActions.vue
│   └── StatsCard.vue
├── events/
│   ├── EventCard.vue
│   ├── EventForm.vue
│   └── EventTable.vue
├── public/
│   ├── CategoryButton.vue
│   ├── CityCard.vue
│   ├── EventCard.vue
│   ├── FeatureStep.vue
│   └── HeroSection.vue
├── sessions/
│   ├── SessionCard.vue
│   └── SessionForm.vue
└── ui/
    ├── Button.vue
    ├── Card.vue
    ├── DataTable.vue
    └── Input.vue
```

---

## Best Practices

1. **Use semantic HTML** - Proper heading hierarchy, landmarks
2. **Mobile-first** - Design for mobile, enhance for desktop
3. **Consistent spacing** - Use Tailwind's spacing scale
4. **Color contrast** - Ensure WCAG AA compliance
5. **Loading states** - Show skeleton/spinner during async operations
6. **Error handling** - Display user-friendly error messages
7. **Keyboard navigation** - Ensure all interactive elements are accessible
8. **TypeScript props** - Define interfaces for all component props
