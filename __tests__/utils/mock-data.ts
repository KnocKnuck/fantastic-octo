/**
 * Mock data generators for testing
 * These functions generate realistic test data for various entities
 */

export interface MockUser {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface MockTask {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface MockCalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendees?: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Generate a mock user
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  const id = overrides?.id || `user-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()

  return {
    id,
    email: overrides?.email || `user-${id}@example.com`,
    name: overrides?.name || `Test User ${id}`,
    avatar: overrides?.avatar,
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  }
}

/**
 * Generate multiple mock users
 */
export function createMockUsers(count: number): MockUser[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({ name: `Test User ${i + 1}` })
  )
}

/**
 * Generate a mock task
 */
export function createMockTask(overrides?: Partial<MockTask>): MockTask {
  const id = overrides?.id || `task-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    id,
    title: overrides?.title || `Test Task ${id}`,
    description: overrides?.description || `Description for task ${id}`,
    status: overrides?.status || 'pending',
    priority: overrides?.priority || 'medium',
    dueDate: overrides?.dueDate || tomorrow,
    userId: overrides?.userId || 'user-1',
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  }
}

/**
 * Generate multiple mock tasks
 */
export function createMockTasks(count: number, userId?: string): MockTask[] {
  const statuses: MockTask['status'][] = ['pending', 'in-progress', 'completed', 'cancelled']
  const priorities: MockTask['priority'][] = ['low', 'medium', 'high', 'urgent']

  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      title: `Task ${i + 1}`,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      userId: userId || 'user-1',
    })
  )
}

/**
 * Generate a mock calendar event
 */
export function createMockCalendarEvent(
  overrides?: Partial<MockCalendarEvent>
): MockCalendarEvent {
  const id = overrides?.id || `event-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()
  const startTime = new Date(now)
  startTime.setHours(startTime.getHours() + 1)
  const endTime = new Date(startTime)
  endTime.setHours(endTime.getHours() + 1)

  return {
    id,
    title: overrides?.title || `Test Event ${id}`,
    description: overrides?.description || `Description for event ${id}`,
    startTime: overrides?.startTime || startTime,
    endTime: overrides?.endTime || endTime,
    location: overrides?.location || 'Virtual',
    attendees: overrides?.attendees || [],
    userId: overrides?.userId || 'user-1',
    createdAt: overrides?.createdAt || now,
    updatedAt: overrides?.updatedAt || now,
  }
}

/**
 * Generate multiple mock calendar events
 */
export function createMockCalendarEvents(
  count: number,
  userId?: string
): MockCalendarEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const startTime = new Date()
    startTime.setDate(startTime.getDate() + i)
    startTime.setHours(9 + (i % 8))

    return createMockCalendarEvent({
      title: `Event ${i + 1}`,
      startTime,
      userId: userId || 'user-1',
    })
  })
}

/**
 * Mock API response structure
 */
export interface MockApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

/**
 * Generate a successful API response
 */
export function createMockSuccessResponse<T>(
  data: T,
  meta?: MockApiResponse['meta']
): MockApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  }
}

/**
 * Generate an error API response
 */
export function createMockErrorResponse(
  code: string,
  message: string
): MockApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  }
}

/**
 * Generate mock pagination data
 */
export function createMockPagination(page = 1, limit = 10, total = 100) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }
}

/**
 * Delay helper for simulating async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Random number generator
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}
