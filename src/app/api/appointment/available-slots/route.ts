import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Define business hours (9 AM - 5 PM ET)
    const businessStart = 9; // 9 AM
    const businessEnd = 17;  // 5 PM
    const sessionDuration = 50; // 50 minutes
    
    const now = new Date();
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get start and end of date range to check
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tomorrow);
    endDate.setHours(23, 59, 59, 999);
    
    // Fetch booked slots
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('scheduled_appointment_at')
      .gte('scheduled_appointment_at', startDate.toISOString())
      .lte('scheduled_appointment_at', endDate.toISOString())
      .not('scheduled_appointment_at', 'is', null)
      .eq('appointment_status', 'SCHEDULED');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch booked slots' }, { status: 500 });
    }

    const bookedSlots = (contacts || []).map(row => {
      const start = new Date(row.scheduled_appointment_at as string);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + sessionDuration);
      
      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
    });

    // Find earliest available slot for today
    const todaySlot = findEarliestSlot(today, bookedSlots, businessStart, businessEnd, sessionDuration);
    
    // Find earliest available slot for tomorrow
    const tomorrowSlot = findEarliestSlot(tomorrow, bookedSlots, businessStart, businessEnd, sessionDuration);
    
    return NextResponse.json({
      today: todaySlot,
      tomorrow: tomorrowSlot
    });
    
  } catch (error) {
    console.error('Error getting available slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function findEarliestSlot(
  date: Date,
  bookedSlots: { startTime: string; endTime: string }[],
  businessStart: number,
  businessEnd: number,
  sessionDuration: number
): { startTime: string; endTime: string; displayTime: string } | null {
  const targetDate = new Date(date);
  targetDate.setHours(businessStart, 0, 0, 0);
  
  // If it's today and we're past business hours, no slots available
  const now = new Date();
  if (date.toDateString() === now.toDateString() && now.getHours() >= businessEnd) {
    return null;
  }
  
  // If it's today, start checking from current time or business start (whichever is later)
  if (date.toDateString() === now.toDateString()) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour >= businessStart) {
      targetDate.setHours(currentHour, Math.ceil(currentMinute / 30) * 30, 0, 0); // Round up to next 30min
      
      // Add buffer time - don't offer slots less than 30 minutes away
      targetDate.setMinutes(targetDate.getMinutes() + 30);
    }
  }
  
  // Generate potential time slots (every 30 minutes)
  const potentialSlots: { startTime: string; endTime: string; displayTime: string }[] = [];
  const checkTime = new Date(targetDate);
  
  while (checkTime.getHours() < businessEnd) {
    const slotStart = new Date(checkTime);
    const slotEnd = new Date(checkTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + sessionDuration);
    
    // Don't add slots that go past business hours
    if (slotEnd.getHours() <= businessEnd) {
      potentialSlots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        displayTime: slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        })
      });
    }
    
    // Move to next 30-minute slot
    checkTime.setMinutes(checkTime.getMinutes() + 30);
  }
  
  // Find the first slot that doesn't conflict with booked appointments
  for (const slot of potentialSlots) {
    const hasConflict = bookedSlots.some(bookedSlot => {
      const bookedStart = new Date(bookedSlot.startTime);
      const bookedEnd = new Date(bookedSlot.endTime);
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      
      // Check for overlap
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
    
    if (!hasConflict) {
      return slot;
    }
  }
  
  return null; // No available slots
}