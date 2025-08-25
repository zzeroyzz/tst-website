/**
 * Direct GraphQL resolver calls for server-side usage
 * Avoids circular dependency issues when API routes need GraphQL functionality
 */

import { createClient } from '@supabase/supabase-js';
import { contactResolvers } from './resolvers/contacts';
import { notificationResolvers } from './resolvers/notifications';

// Create server-side Supabase client for resolvers
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Context for resolvers
const context = {
  supabase,
  user: null, // For API routes, no authenticated user context needed
  session: null
};

/**
 * Create a contact directly via GraphQL resolver
 */
export async function createContactDirect(input: {
  name: string;
  email: string;
  phoneNumber?: string;
  segments?: string[];
  crmNotes?: string;
  customFields?: any;
}) {
  try {
    const result = await contactResolvers.Mutation.createContact(
      null, // parent
      { input }, // args
      context // context
    );
    return result;
  } catch (error) {
    console.error('Direct contact creation error:', error);
    throw error;
  }
}

/**
 * Create a notification directly via GraphQL resolver
 */
export async function createNotificationDirect(input: {
  type: string;
  title: string;
  message: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
}) {
  try {
    const result = await notificationResolvers.Mutation.createNotification(
      null, // parent
      { input }, // args
      context // context
    );
    return result;
  } catch (error) {
    console.error('Direct notification creation error:', error);
    throw error;
  }
}

/**
 * Get contacts directly via GraphQL resolver
 */
export async function getContactsDirect(filters?: any) {
  try {
    const result = await contactResolvers.Query.contacts(
      null, // parent
      { filters }, // args
      context // context
    );
    return result;
  } catch (error) {
    console.error('Direct contacts query error:', error);
    throw error;
  }
}

/**
 * Get notifications directly via GraphQL resolver
 */
export async function getNotificationsDirect(options?: { limit?: number; unreadOnly?: boolean }) {
  try {
    const result = await notificationResolvers.Query.notifications(
      null, // parent
      options || {}, // args
      context // context
    );
    return result;
  } catch (error) {
    console.error('Direct notifications query error:', error);
    throw error;
  }
}