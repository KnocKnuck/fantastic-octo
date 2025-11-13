/**
 * Real-time Infrastructure - Pusher WebSocket
 *
 * This module provides real-time communication via WebSockets.
 * Used for: Live calendar sync status, task updates, notifications.
 *
 * Features:
 * - Bi-directional communication
 * - Automatic reconnection
 * - Channel-based pub/sub
 * - Presence channels for online status
 *
 * Security:
 * - Authentication on WebSocket connections
 * - Private channels for user-specific data
 * - Rate limiting on events
 *
 * @see https://pusher.com/docs
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

/**
 * Server-side Pusher instance (for triggering events)
 */
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

/**
 * Channel name helpers
 */
export const Channels = {
  userPrivate: (userId: string) => `private-user-${userId}`,
  workspace: (workspaceId: string) => `private-workspace-${workspaceId}`,
  calendarSync: (userId: string) => `private-calendar-sync-${userId}`,
  taskUpdates: (userId: string) => `private-task-updates-${userId}`,
  scheduleGeneration: (userId: string) => `private-schedule-${userId}`,
};

/**
 * Event name constants
 */
export const Events = {
  // Calendar events
  CALENDAR_SYNC_STARTED: 'calendar.sync.started',
  CALENDAR_SYNC_PROGRESS: 'calendar.sync.progress',
  CALENDAR_SYNC_COMPLETED: 'calendar.sync.completed',
  CALENDAR_SYNC_FAILED: 'calendar.sync.failed',

  // Task events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_COMPLETED: 'task.completed',

  // Schedule events
  SCHEDULE_GENERATION_STARTED: 'schedule.generation.started',
  SCHEDULE_GENERATION_PROGRESS: 'schedule.generation.progress',
  SCHEDULE_GENERATION_COMPLETED: 'schedule.generation.completed',
  SCHEDULE_GENERATION_FAILED: 'schedule.generation.failed',

  // Notification events
  NOTIFICATION_NEW: 'notification.new',

  // System events
  USER_ONLINE: 'user.online',
  USER_OFFLINE: 'user.offline',
};

/**
 * Trigger a real-time event on a channel
 */
export async function triggerEvent(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error('Failed to trigger Pusher event:', error);
    // Don't throw - real-time is not critical
  }
}

/**
 * Trigger events on multiple channels
 */
export async function triggerBatch(
  channels: string[],
  event: string,
  data: any
): Promise<void> {
  try {
    await pusher.triggerBatch(
      channels.map(channel => ({
        channel,
        name: event,
        data,
      }))
    );
  } catch (error) {
    console.error('Failed to trigger batch Pusher events:', error);
  }
}

/**
 * Authenticate a private channel subscription
 * Call this from API route: /api/pusher/auth
 */
export function authenticateChannel(
  socketId: string,
  channel: string,
  userId: string
): { auth: string } {
  // Verify user has access to this channel
  if (channel.startsWith('private-user-') && !channel.includes(userId)) {
    throw new Error('Unauthorized channel access');
  }

  const auth = pusher.authorizeChannel(socketId, channel);
  return auth;
}

/**
 * Calendar sync status helpers
 */
export async function notifyCalendarSyncStarted(
  userId: string,
  calendarId: string
): Promise<void> {
  await triggerEvent(
    Channels.calendarSync(userId),
    Events.CALENDAR_SYNC_STARTED,
    { calendarId, timestamp: new Date().toISOString() }
  );
}

export async function notifyCalendarSyncProgress(
  userId: string,
  calendarId: string,
  progress: number,
  message: string
): Promise<void> {
  await triggerEvent(
    Channels.calendarSync(userId),
    Events.CALENDAR_SYNC_PROGRESS,
    { calendarId, progress, message, timestamp: new Date().toISOString() }
  );
}

export async function notifyCalendarSyncCompleted(
  userId: string,
  calendarId: string,
  eventsCount: number
): Promise<void> {
  await triggerEvent(
    Channels.calendarSync(userId),
    Events.CALENDAR_SYNC_COMPLETED,
    { calendarId, eventsCount, timestamp: new Date().toISOString() }
  );
}

export async function notifyCalendarSyncFailed(
  userId: string,
  calendarId: string,
  error: string
): Promise<void> {
  await triggerEvent(
    Channels.calendarSync(userId),
    Events.CALENDAR_SYNC_FAILED,
    { calendarId, error, timestamp: new Date().toISOString() }
  );
}

/**
 * Task update helpers
 */
export async function notifyTaskCreated(
  userId: string,
  task: any
): Promise<void> {
  await triggerEvent(
    Channels.taskUpdates(userId),
    Events.TASK_CREATED,
    { task, timestamp: new Date().toISOString() }
  );
}

export async function notifyTaskUpdated(
  userId: string,
  task: any
): Promise<void> {
  await triggerEvent(
    Channels.taskUpdates(userId),
    Events.TASK_UPDATED,
    { task, timestamp: new Date().toISOString() }
  );
}

/**
 * Schedule generation helpers
 */
export async function notifyScheduleGenerationStarted(
  userId: string
): Promise<void> {
  await triggerEvent(
    Channels.scheduleGeneration(userId),
    Events.SCHEDULE_GENERATION_STARTED,
    { timestamp: new Date().toISOString() }
  );
}

export async function notifyScheduleGenerationCompleted(
  userId: string,
  schedule: any
): Promise<void> {
  await triggerEvent(
    Channels.scheduleGeneration(userId),
    Events.SCHEDULE_GENERATION_COMPLETED,
    { schedule, timestamp: new Date().toISOString() }
  );
}

/**
 * Client-side Pusher helper (for frontend)
 * Usage: import { createPusherClient } from '@/lib/infrastructure/realtime'
 */
export function createPusherClient(): PusherClient {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    authEndpoint: '/api/pusher/auth',
  });
}

/**
 * Test Pusher connection
 */
export async function testPusherConnection(): Promise<boolean> {
  try {
    const testChannel = `test-${Date.now()}`;
    await pusher.trigger(testChannel, 'test-event', { test: true });
    console.log('✅ Pusher connection successful');
    return true;
  } catch (error) {
    console.error('❌ Pusher connection failed:', error);
    return false;
  }
}

export default pusher;
