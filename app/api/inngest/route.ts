/**
 * Inngest API Route
 *
 * This endpoint serves Inngest functions and receives events from the Inngest platform.
 * All background jobs are defined here and processed asynchronously.
 *
 * Features:
 * - Automatic retries with exponential backoff
 * - Job monitoring via Inngest dashboard
 * - Type-safe event handling
 * - Dead letter queue for failed jobs
 *
 * @see https://www.inngest.com/docs/functions
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/infrastructure/jobs';
import {
  calendarSyncFunction,
  scheduleGenerateFunction,
  emailSendFunction,
  notificationSendFunction,
  taskReminderFunction,
} from '@/inngest/functions';

/**
 * Serve Inngest functions
 * This creates a POST endpoint at /api/inngest that Inngest uses to trigger functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    calendarSyncFunction,
    scheduleGenerateFunction,
    emailSendFunction,
    notificationSendFunction,
    taskReminderFunction,
  ],
});
