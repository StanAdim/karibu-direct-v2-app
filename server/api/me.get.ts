import type { User } from '~/types'

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z'
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-12T09:15:00Z'
  }
]

function parseJwtPayload(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event): Promise<User> => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Authorization header is required'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const payload = parseJwtPayload(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }

  const user = MOCK_USERS.find(u => u.id === payload.sub)

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return user
})
