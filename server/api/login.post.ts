import type { LoginCredentials, LoginResponse, User } from '~/types'

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    roles: ['Attendee'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['Admin'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-12T09:15:00Z'
  }
]

function generateMockJWT(user: User): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  }

  const base64Header = btoa(JSON.stringify(header))
  const base64Payload = btoa(JSON.stringify(payload))
  const signature = btoa(`${base64Header}.${base64Payload}.mock-signature`)

  return `${base64Header}.${base64Payload}.${signature}`
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody<LoginCredentials>(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  const user = MOCK_USERS.find(
    u => u.email === body.email && u.password === body.password
  )

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  const { password: _, ...userWithoutPassword } = user

  const token = generateMockJWT(userWithoutPassword)
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7

  return {
    user: userWithoutPassword,
    token,
    expiresAt
  }
})
