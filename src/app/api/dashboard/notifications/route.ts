// src/app/api/dashboard/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add timeAgo calculation
    const processedNotifications = notifications?.map(notification => {
      const createdAt = new Date(notification.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

      let timeAgo;
      if (diffInMinutes < 1) timeAgo = 'Just now';
      else if (diffInMinutes < 60) timeAgo = `${diffInMinutes}m ago`;
      else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) timeAgo = `${diffInHours}h ago`;
        else {
          const diffInDays = Math.floor(diffInHours / 24);
          if (diffInDays < 7) timeAgo = `${diffInDays}d ago`;
          else timeAgo = createdAt.toLocaleDateString();
        }
      }

      return {
        ...notification,
        timeAgo
      };
    }) || [];

    return NextResponse.json({
      notifications: processedNotifications,
      unreadCount: notifications?.filter(n => !n.read).length || 0
    });

  } catch (error) {
    console.error('Error in notifications GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      message,
      contact_id,
      contact_name,
      contact_email,
      reminder_number,
      read = false
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        contact_id,
        contact_name,
        contact_email,
        reminder_number,
        read,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data });

  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', notificationIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notifications marked as read`
    });

  } catch (error) {
    console.error('Error in notifications PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete notifications (optional, for cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error deleting old notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Deleted notifications older than ${olderThanDays} days`
    });

  } catch (error) {
    console.error('Error in notifications DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
