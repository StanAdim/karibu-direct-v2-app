# EventHub - Event Management Platform

A production-ready, scalable Event Management Platform built with Nuxt 4, Vue 3, and TypeScript. This platform supports three user roles: **Admin**, **Organizer**, and **Attendee**, each with dedicated dashboards and features.

## Tech Stack

- **Framework**: Nuxt 4 with Vue 3 Composition API
- **Language**: TypeScript (strict mode)
- **UI Library**: Nuxt UI v4
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Utilities**: VueUse
- **API Client**: Nuxt built-in `$fetch`
- **Validation**: Zod
- **Date Utilities**: date-fns

## Features

### Admin Dashboard
- User management (CRUD operations)
- Platform-wide event management
- Analytics and reporting
- System settings configuration

### Organizer Dashboard
- Event creation and management
- Session scheduling
- Checkpoint/QR code management
- Participant management
- Attendance tracking and analytics

### Attendee Dashboard
- Event discovery and browsing
- Ticket purchasing and management
- Personal schedule view
- Profile management

## Project Structure

```
app/
├── nuxt.config.ts          # Nuxt configuration
├── app.config.ts           # App theming and UI config
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── app.vue                 # Root component
│
├── assets/
│   └── css/
│       └── main.css        # Global styles and Tailwind
│
├── layouts/
│   ├── default.vue         # Default layout
│   ├── auth.vue            # Auth pages layout
│   ├── admin.vue           # Admin dashboard layout
│   ├── organizer.vue       # Organizer dashboard layout
│   └── attendee.vue        # Attendee dashboard layout
│
├── pages/
│   ├── index.vue           # Landing page
│   ├── login.vue           # Login page
│   ├── register.vue        # Registration page
│   ├── admin/              # Admin pages
│   ├── organizer/          # Organizer pages
│   └── attendee/           # Attendee pages
│
├── components/
│   ├── common/             # Shared components
│   ├── dashboard/          # Dashboard widgets
│   ├── events/             # Event components
│   ├── sessions/           # Session components
│   └── ui/                 # UI wrapper components
│
├── composables/
│   ├── useApi.ts           # API client composable
│   ├── useAuth.ts          # Authentication composable
│   ├── usePagination.ts    # Pagination logic
│   ├── useNotifications.ts # Toast notifications
│   └── useConfirmDialog.ts # Confirmation dialogs
│
├── stores/
│   ├── auth.ts             # Authentication state
│   ├── events.ts           # Events state
│   ├── users.ts            # Users state
│   └── sessions.ts         # Sessions state
│
├── middleware/
│   ├── auth.global.ts      # Global auth middleware
│   ├── auth.ts             # Route-level auth
│   ├── admin.ts            # Admin role check
│   ├── organizer.ts        # Organizer role check
│   ├── attendee.ts         # Attendee role check
│   └── guest.ts            # Guest-only routes
│
├── types/
│   ├── index.ts            # Type exports
│   ├── user.ts             # User types
│   ├── auth.ts             # Auth types
│   ├── api.ts              # API types
│   ├── event.ts            # Event types
│   ├── session.ts          # Session types
│   ├── checkpoint.ts       # Checkpoint types
│   ├── participant.ts      # Participant types
│   └── ticket.ts           # Ticket types
│
├── utils/
│   └── jwt.ts              # JWT utilities
│
└── public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1

# App Configuration
NUXT_PUBLIC_APP_NAME=EventHub

# JWT Secret (for server-side operations)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The platform is designed to consume a FastAPI backend. Configure the API base URL in your environment:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

### Expected API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

#### Users
- `GET /users` - List users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Events
- `GET /events` - List events (paginated, filterable)
- `GET /events/:id` - Get event by ID
- `POST /events` - Create event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:id/stats` - Get event statistics

#### Sessions
- `GET /sessions` - List sessions
- `GET /events/:eventId/sessions` - Get sessions for an event
- `POST /sessions` - Create session
- `PATCH /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session

## Theming

The application uses a custom brand color palette derived from `#4285F4`. Customize the theme in `app.config.ts`:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      // ... other colors
    }
  },
  theme: {
    brand: {
      50: '#e8f1fe',
      // ... full palette
      950: '#062556'
    }
  }
})
```

## Authentication Flow

1. Users authenticate via `/login` or `/register`
2. JWT token is stored in a secure HTTP-only cookie
3. Global middleware checks authentication on protected routes
4. Role-based middleware restricts access to role-specific areas
5. Token refresh is handled automatically

## User Roles

| Role | Access |
|------|--------|
| Admin | Full platform access, user management, analytics |
| Organizer | Event management, sessions, checkpoints, participants |
| Attendee | Event browsing, ticket management, schedule |

## Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebars on small screens
- Touch-friendly interactions
- Optimized layouts for tablets and desktops

## Performance Optimizations

- Route-level code splitting
- Lazy-loaded components
- Static asset caching
- SSR disabled for dashboard routes (CSR for better interactivity)
- View transitions for smooth navigation

## License

MIT License - see LICENSE file for details.
