/**
 * Background Jobs Infrastructure - Inngest Client
 *
 * This module configures Inngest for background job processing.
 * Used for: Calendar sync, email notifications, AI scheduling, data processing.
 *
 * Features:
 * - Automatic retries with exponential backoff
 * - Job monitoring via Inngest dashboard
 * - Type-safe event definitions
 * - Dead letter queue for failed jobs
 *
 * @see https://www.inngest.com/docs
 */

import { Inngest, EventSchemas } from 'inngest';

// Define event schemas for type safety
type Events = {
  'calendar/sync.requested': {
    data: {
      userId: string;
      calendarId: string;
      workspaceId: string;
    };
  };
  'schedule/generate.requested': {
    data: {
      userId: string;
      workspaceId: string;
      startDate: string;
      endDate: string;
      taskIds: string[];
    };
  };
  'email/send.requested': {
    data: {
      to: string;
      subject: string;
      template: string;
      data: Record<string, any>;
    };
  };
  'notification/send.requested': {
    data: {
      userId: string;
      type: string;
      title: string;
      message: string;
      link?: string;
    };
  };
  'task/reminder.scheduled': {
    data: {
      userId: string;
      taskId: string;
      reminderTime: string;
    };
  };
};

// Create Inngest client
export const inngest = new Inngest({
  id: 'ai-calendar-agent',
  name: 'AI Calendar Agent',
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
});

/**
 * Send an event to Inngest
 * @param event Event name
 * @param data Event data
 */
export async function sendEvent<K extends keyof Events>(
  event: K,
  data: Events[K]['data']
): Promise<void> {
  try {
    await inngest.send({
      name: event,
      data,
    });
  } catch (error) {
    console.error(`Failed to send event ${event}:`, error);
    throw error;
  }
}

/**
 * Schedule a calendar sync job
 */
export async function scheduleCalendarSync(
  userId: string,
  calendarId: string,
  workspaceId: string
): Promise<void> {
  await sendEvent('calendar/sync.requested', {
    userId,
    calendarId,
    workspaceId,
  });
}

/**
 * Schedule AI schedule generation
 */
export async function scheduleGenerateSchedule(
  userId: string,
  workspaceId: string,
  startDate: string,
  endDate: string,
  taskIds: string[]
): Promise<void> {
  await sendEvent('schedule/generate.requested', {
    userId,
    workspaceId,
    startDate,
    endDate,
    taskIds,
  });
}

/**
 * Schedule email sending
 */
export async function scheduleEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<void> {
  await sendEvent('email/send.requested', {
    to,
    subject,
    template,
    data,
  });
}

/**
 * Send notification to user
 */
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  await sendEvent('notification/send.requested', {
    userId,
    type,
    title,
    message,
    link,
  });
}

/**
 * Test Inngest connection
 */
export async function testInngestConnection(): Promise<boolean> {
  try {
    await inngest.send({
      name: 'test/connection',
      data: { timestamp: new Date().toISOString() },
    });
    console.log('✅ Inngest connection successful');
    return true;
  } catch (error) {
    console.error('❌ Inngest connection failed:', error);
    return false;
  }
}

export default inngest;
