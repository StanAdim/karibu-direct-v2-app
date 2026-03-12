# KaribuDirect - Nuxt 4 Production Architecture

A production-ready Nuxt 4 application architecture with JWT authentication, Pinia state management, and a scalable folder structure.

## Features

- **Nuxt 4** with TypeScript
- **JWT Authentication** with cookie-based token storage
- **Pinia** for state management
- **TailwindCSS** via Nuxt UI for styling
- **Route Protection** with global and named middleware
- **Composables** for reusable logic
- **Layout System** for consistent UI
- **API Abstraction Layer** for centralized HTTP handling

## Project Structure

```
app/
├── components/
│   └── ui/                    # Reusable UI components
│       ├── Button.vue
│       ├── Card.vue
│       └── Input.vue
├── composables/               # Reusable composition functions
│   ├── useApi.ts             # API wrapper with auth headers
│   ├── useAuth.ts            # Authentication logic
│   └── useUser.ts            # User-related utilities
├── layouts/                   # Page layouts
│   ├── auth.vue              # Centered layout for auth pages
│   └── default.vue           # Main app layout with navbar
├── middleware/                # Route middleware
│   ├── auth.global.ts        # Global auth check
│   └── guest.ts              # Redirect authenticated users
├── pages/                     # Application pages
│   ├── dashboard.vue         # Protected dashboard
│   ├── index.vue             # Entry redirect
│   └── login.vue             # Login form
├── plugins/                   # Nuxt plugins
│   └── auth.client.ts        # Client-side auth initialization
├── stores/                    # Pinia stores
│   └── auth.ts               # Authentication state
├── types/                     # TypeScript definitions
│   ├── api.ts
│   ├── auth.ts
│   ├── index.ts
│   └── user.ts
├── utils/                     # Utility functions
│   └── jwt.ts                # JWT parsing and cookie management
└── app.vue                    # Root component
server/
└── api/                       # Server API routes
    ├── login.post.ts         # Login endpoint
    └── me.get.ts             # Get current user
```

## Setup

### Install Dependencies

```bash
yarn install
```

### Environment Variables

Create a `.env` file:

```env
# JWT secret for token signing (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API base URL
NUXT_PUBLIC_API_BASE=/api
```

### Development

Start the development server:

```bash
yarn dev
```

The app will be available at `http://localhost:3000`

### Demo Credentials

```
Email: demo@example.com
Password: password123

Admin:
Email: admin@example.com
Password: admin123
```

## Architecture Guide

### Authentication Flow

1. User submits credentials on `/login`
2. `useAuth().login()` calls the auth store
3. Store sends POST to `/api/login`
4. Server validates and returns JWT + user data
5. Token stored in HTTP-only cookie
6. User redirected to `/dashboard`

### Composables

#### `useAuth()`

```typescript
const { user, isAuthenticated, loading, login, logout } = useAuth()

// Login
await login({ email: 'user@example.com', password: 'password' })

// Check authentication
if (isAuthenticated.value) {
  console.log(user.value?.name)
}

// Logout
logout()
```

#### `useApi()`

```typescript
const api = useApi()

// GET request
const users = await api.get<User[]>('/users')

// POST request
const newUser = await api.post<User>('/users', { name: 'John' })

// With params
const filtered = await api.get<User[]>('/users', {
  params: { role: 'admin' }
})
```

#### `useUser()`

```typescript
const { userName, userEmail, userRole, isAdmin, hasRole } = useUser()

// Role checks
if (isAdmin.value) {
  // Show admin panel
}

if (hasRole('moderator')) {
  // Show moderation tools
}
```

### Middleware

#### Global Auth (`auth.global.ts`)

Runs on every route change. Redirects unauthenticated users to `/login` unless on a public route.

#### Guest (`guest.ts`)

Apply to routes that should only be accessible by unauthenticated users:

```typescript
definePageMeta({
  middleware: 'guest'
})
```

### Adding New Features

#### New Page

1. Create file in `app/pages/`
2. Set layout and middleware in `definePageMeta`
3. Use composables for data/auth

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'] // Optional: use named middleware
})

const { user } = useAuth()
</script>
```

#### New API Endpoint

Create in `server/api/`:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // Validate auth
  const authHeader = getHeader(event, 'authorization')
  // ... validation logic
  
  return { users: [] }
})
```

#### New Composable

Create in `app/composables/`:

```typescript
// composables/useFeature.ts
export function useFeature() {
  const state = ref(null)
  
  async function doSomething() {
    const api = useApi()
    state.value = await api.get('/endpoint')
  }
  
  return { state, doSomething }
}
```

## Extending the Architecture

### Refresh Tokens

Add refresh token logic in `stores/auth.ts`:

```typescript
actions: {
  async refreshToken() {
    const response = await $fetch<RefreshTokenResponse>('/api/refresh')
    this.setToken(response.token)
  }
}
```

### RBAC Permissions

Extend `types/user.ts`:

```typescript
interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

interface User {
  // ...existing fields
  permissions: Permission[]
}
```

### Feature Modules

Organize by feature:

```
app/
├── features/
│   ├── users/
│   │   ├── components/
│   │   ├── composables/
│   │   └── pages/
│   └── products/
│       ├── components/
│       ├── composables/
│       └── pages/
```

## Production

### Build

```bash
yarn build
```

### Preview

```bash
yarn preview
```

### Deployment

See [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment)

## Tech Stack

- [Nuxt 4](https://nuxt.com/) - Vue.js framework
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Pinia](https://pinia.vuejs.org/) - State management
- [Nuxt UI](https://ui.nuxt.com/) - UI component library with Tailwind CSS
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
