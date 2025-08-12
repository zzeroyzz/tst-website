/* eslint-disable react-hooks/exhaustive-deps */
// src/components/LeadCalendar/LeadCalendar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  addDays,
  isAfter,
  addHours,
  getDay,
  isSameDay,
} from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import Button from '@/components/Button/Button';
import { ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadCalendarProps {
  onSchedule?: (dateTime: Date) => Promise<void>;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  existingAppointment?: Date | null; // If contact already has an appointment
}

interface TimeSlot {
  time: string;
  available: boolean;
  dateTime: Date;
}

interface ScheduleAppointmentData {
  contactId: string;
  appointmentDateTime: Date;
  status: 'scheduled';
  notes?: string;
}

interface BookedSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

const EASTERN_TIMEZONE = 'America/New_York';
//TODO
// const APPOINTMENT_DURATION = 15;

// Your availability configuration
const AVAILABILITY = {
  // 0 = Sunday, 1 = Monday, etc.
  1: [ // Monday
    { start: '09:00', end: '10:45' }, // 9:00 AM - 10:45 AM
    { start: '18:00', end: '19:00' }  // 6:00 PM - 7:00 PM
  ],
  2: [ // Tuesday
    { start: '09:00', end: '10:45' }, // 9:00 AM - 10:45 AM
    { start: '18:00', end: '19:00' }  // 6:00 PM - 7:00 PM
  ],
  3: [ // Wednesday
    { start: '09:00', end: '10:45' }, // 9:00 AM - 10:45 AM
    { start: '18:00', end: '19:00' }  // 6:00 PM - 7:00 PM
  ],
  4: [ // Thursday
    { start: '11:00', end: '19:00' }  // 11:00 AM - 7:00 PM
  ],
  5: [], // Friday - Unavailable
  6: [], // Saturday - Unavailable
  0: []  // Sunday - Unavailable
};

// API function to fetch booked appointments
const fetchBookedAppointments = async (startDate: Date, endDate: Date): Promise<BookedSlot[]> => {
  try {
    const response = await fetch('/api/appointment/booked-slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch booked slots');
      return [];
    }

    const data = await response.json();
    return data.bookedSlots || [];
  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    return [];
  }
};

// API function to schedule appointment
const scheduleAppointment = async (data: ScheduleAppointmentData): Promise<void> => {
  const response = await fetch('/api/schedule-consultation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: data.contactId, // Use contactId as token for now
      contactId: data.contactId,
      dateTime: data.appointmentDateTime.toISOString(),
      name: data.contactId, // Will be populated from database
      email: data.contactId, // Will be populated from database
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to schedule appointment');
  }

  return response.json();
};

const LeadCalendar: React.FC<LeadCalendarProps> = ({
  onSchedule,
  contactId,
  existingAppointment = null
}) => {
  // Convert existing appointment to Eastern time for display
  const existingAppointmentEastern = existingAppointment
    ? toZonedTime(new Date(existingAppointment), EASTERN_TIMEZONE)
    : null;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    existingAppointmentEastern ? new Date(existingAppointmentEastern) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    existingAppointmentEastern ? formatTz(existingAppointmentEastern, 'h:mm a', { timeZone: EASTERN_TIMEZONE }) : null
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [scheduled, setScheduled] = useState(!!existingAppointment);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Fetch booked slots for the current month
  useEffect(() => {
    const fetchBookedSlotsForMonth = async () => {
      setLoadingSlots(true);
      const booked = await fetchBookedAppointments(calendarStart, calendarEnd);
      setBookedSlots(booked);
      setLoadingSlots(false);
    };

    fetchBookedSlotsForMonth();
  }, [currentDate]); // Refetch when month changes

 // Only block the exact booked start time, not overlapping windows
const isSlotBooked = (slotStartUTC: Date): boolean => {
  const t = slotStartUTC.getTime();
  return bookedSlots.some(b => new Date(b.startTime).getTime() === t);
};

  // Generate time slots for a selected date in Eastern Time
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = getDay(date);
    const dayAvailability = AVAILABILITY[dayOfWeek];

    if (!dayAvailability || dayAvailability.length === 0) {
      return slots;
    }

    // Get current time in Eastern timezone
    const nowUTC = new Date();
    const nowEastern = toZonedTime(nowUTC, EASTERN_TIMEZONE);
    const fourHoursFromNowEastern = addHours(nowEastern, 4);

    dayAvailability.forEach(({ start, end }) => {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      // Create the date in Eastern time
      const startOfDayEastern = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      let currentSlotEastern = new Date(startOfDayEastern);
      currentSlotEastern.setHours(startHour, startMin, 0, 0);

      const endTimeEastern = new Date(startOfDayEastern);
      endTimeEastern.setHours(endHour, endMin, 0, 0);

      while (currentSlotEastern < endTimeEastern) {
        // Create a proper Eastern time representation
        const slotDateTimeEastern = new Date(currentSlotEastern);

        // Convert to UTC for storage/API calls
        const slotDateTimeUTC = fromZonedTime(slotDateTimeEastern, EASTERN_TIMEZONE);

        // Check if the slot is available:
        // 1. Must be at least 4 hours in the future
        // 2. Must not conflict with any booked appointments
        const isFutureAvailable = isAfter(slotDateTimeEastern, fourHoursFromNowEastern);
        const isNotBooked = !isSlotBooked(slotDateTimeUTC);

        // For rescheduling, exclude the current appointment from conflict check
        let available = isFutureAvailable && isNotBooked;

        // If this is the user's existing appointment slot during rescheduling, mark it as available
        if (isRescheduling && existingAppointment) {
          const existingUTC = new Date(existingAppointment);
          if (Math.abs(slotDateTimeUTC.getTime() - existingUTC.getTime()) < 60000) { // Within 1 minute
            available = isFutureAvailable; // Only check future availability, not booking conflict
          }
        }

        slots.push({
          time: formatTz(slotDateTimeEastern, 'h:mm a', { timeZone: EASTERN_TIMEZONE }),
          available,
          dateTime: slotDateTimeUTC // This will be sent to the API as UTC
        });

        // Add 15 minutes for next slot
        currentSlotEastern = new Date(currentSlotEastern.getTime() + 15 * 60 * 1000);
      }
    });

    return slots;
  };

  // Check if a date has any available slots
  const dateHasAvailableSlots = (date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const dayAvailability = AVAILABILITY[dayOfWeek];

    if (!dayAvailability || dayAvailability.length === 0) {
      return false;
    }

    // Generate slots for this date and check if any are available
    const slots = generateTimeSlots(date);
    return slots.some(slot => slot.available);
  };

  // Check if a date is selectable (3 business days in future, excluding today)
  const isDateSelectable = (date: Date): boolean => {
    // Get today in Eastern time
    const todayEastern = toZonedTime(new Date(), EASTERN_TIMEZONE);
    todayEastern.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Must be in the future (not today)
    if (checkDate <= todayEastern) return false;

    // Check if it's a weekday with availability
    const dayOfWeek = getDay(checkDate);
    const hasAvailability = AVAILABILITY[dayOfWeek] && AVAILABILITY[dayOfWeek].length > 0;
    if (!hasAvailability) return false;

    // Count business days between today (exclusive) and the target date (inclusive)
    let businessDaysAhead = 0;
    let currentDate = new Date(todayEastern);
    currentDate = addDays(currentDate, 1); // Start from tomorrow

    while (currentDate <= checkDate) {
      const currentDayOfWeek = getDay(currentDate);
      // Count only Monday-Friday as business days
      if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
        businessDaysAhead++;
      }

      // If we've passed 3 business days, this date is too far
      if (businessDaysAhead > 3) return false;

      // If this is our target date and we're within 3 business days, it's valid
      if (isSameDay(currentDate, checkDate)) {
        // Final check: does this date actually have available slots?
        return businessDaysAhead <= 3 && (!loadingSlots ? dateHasAvailableSlots(checkDate) : true);
      }

      currentDate = addDays(currentDate, 1);
    }

    return false;
  };

  // Update time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      if (!isRescheduling) {
        setSelectedTime(null);
      }
    }
  }, [selectedDate, isRescheduling, bookedSlots]); // Re-generate when booked slots change

  // Set current month to show existing appointment
  useEffect(() => {
    if (existingAppointmentEastern) {
      setCurrentDate(new Date(existingAppointmentEastern));
    }
  }, [existingAppointmentEastern]);

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date) || isRescheduling) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot) {
      toast.error('Invalid time slot selected');
      return;
    }

    // Double-check availability before scheduling
    if (!selectedSlot.available && !isRescheduling) {
      toast.error('This time slot is no longer available. Please select another time.');
      // Refresh the slots
      const newSlots = generateTimeSlots(selectedDate);
      setTimeSlots(newSlots);
      setSelectedTime(null);
      return;
    }

    setConfirming(true);

    try {
      // Call parent's onSchedule callback directly if provided
      if (onSchedule) {
        // selectedSlot.dateTime is already in UTC from generateTimeSlots
        await onSchedule(selectedSlot.dateTime);
      } else if (contactId) {
        // Fallback to direct API call if no callback provided
        await scheduleAppointment({
          contactId,
          appointmentDateTime: selectedSlot.dateTime,
          status: 'scheduled',
          notes: isRescheduling ? 'Appointment rescheduled' : 'Initial appointment scheduled'
        });
      } else {
        throw new Error('No contact ID or callback provided');
      }

      setScheduled(true);
      setIsRescheduling(false);
      toast.success('Consultation rescheduled successfully!');

      // Refresh booked slots after successful scheduling
      const booked = await fetchBookedAppointments(calendarStart, calendarEnd);
      setBookedSlots(booked);
    } catch (error) {
      toast.error('Failed to schedule consultation. Please try again.');
      console.error('Scheduling error:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleReschedule = () => {
    setIsRescheduling(true);
    setScheduled(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleCancelAppointment = async () => {
    if (!contactId) return;

    try {
      const response = await fetch('/api/contacts/cancel-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setScheduled(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setIsRescheduling(false);
      toast.success('Appointment cancelled successfully');

      // Refresh booked slots after cancellation
      const booked = await fetchBookedAppointments(calendarStart, calendarEnd);
      setBookedSlots(booked);
    } catch (error) {
      toast.error('Failed to cancel appointment');
      console.error('Cancel error:', error);
    }
  };

  if (scheduled && !isRescheduling) {
    return (
      <div className="bg-white p-8 rounded-lg border-2 border-black shadow-brutalistLg text-center">
        <div className="flex justify-center mb-4">
          <Check className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {existingAppointment ? 'Appointment Confirmed' : 'Scheduled!'}
        </h3>
        <p className="text-gray-600 mb-4">
          Your consultation is confirmed for:
        </p>
        <p className="text-lg font-bold">
          {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-lg font-bold text-tst-purple">
          {selectedTime} (Eastern)
        </p>
        <p className="text-sm text-gray-500 mt-4 mb-6">
          You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReschedule}
            className="px-4 py-2 rounded-lg border-2 border-black bg-tst-yellow hover:shadow-brutalist font-medium transition-all"
          >
            Reschedule
          </button>
          <button
            onClick={handleCancelAppointment}
            className="px-4 py-2 rounded-lg border-2 border-black bg-red-100 hover:bg-red-200 hover:shadow-brutalist font-medium transition-all text-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-black shadow-brutalistLg">
      {/* Header for rescheduling */}
      {isRescheduling && (
        <div className="p-4 border-b-2 border-black bg-tst-yellow">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Reschedule Appointment</h3>
            <button
              onClick={() => {
                setIsRescheduling(false);
                setScheduled(true);
              }}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm mt-1">
            Current: {existingAppointmentEastern && formatTz(existingAppointmentEastern, 'EEEE, MMM d \'at\' h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}
          </p>
        </div>
      )}

      {/* Calendar Section */}
      <div className="p-4 border-b-2 border-black">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg md:text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Loading indicator */}
        {loadingSlots && (
          <div className="text-center py-2 text-sm text-gray-500">
            Loading available times...
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map(day => (
            <div key={day} className="font-bold text-xs md:text-sm text-gray-500 py-1 md:py-2">
              {day}
            </div>
          ))}
          {days.map(day => {
            const selectable = isDateSelectable(day) || isRescheduling;
            const selected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                disabled={!selectable || loadingSlots}
                className={`
                  p-1 md:p-2 border rounded-md min-h-[40px] md:min-h-[50px]
                  flex items-center justify-center
                  transition-all duration-200
                  ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''}
                  ${isToday(day) ? 'bg-tst-yellow border-2 border-black font-bold' : ''}
                  ${selected ? 'bg-tst-purple text-black border-2 border-black font-bold' : ''}
                  ${selectable && !selected ? 'border-2 border-black hover:bg-gray-100 cursor-pointer bg-tst-green' : ''}
                  ${!selectable ? 'cursor-not-allowed opacity-50' : ''}
                  ${loadingSlots ? 'opacity-50' : ''}
                `}
              >
                <span className="text-sm md:text-base">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-tst-yellow border border-black rounded"></div>
            <span>Today</span>
          </div>
           <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-tst-green border border-black rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-tst-purple border border-black rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded opacity-50"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Time Slots Section */}
      {selectedDate && (
        <div className="p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Clock size={18} />
            <span>Available times for {format(selectedDate, 'EEEE, MMM d')} (Eastern Time)</span>
          </h3>

          {timeSlots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No available time slots for this date
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.available && !isRescheduling}
                  data-testid="calendar-slot"
                  className={`
                    p-2 md:p-3 rounded-lg border-2 font-medium text-sm md:text-base
                    transition-all duration-200
                    ${selectedTime === slot.time
                      ? 'bg-tst-green border-black text-black shadow-md'
                      : 'border-black bg-white hover:bg-gray-50'
                    }
                    ${!slot.available && !isRescheduling
                      ? 'opacity-50 cursor-not-allowed line-through'
                      : 'cursor-pointer hover:shadow-md'
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Section */}
      {selectedDate && selectedTime && (
        <div className="p-4 border-t-2 border-black bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                {isRescheduling ? 'New appointment time:' : 'Selected appointment:'} (Eastern Time)
              </p>
              <p className="font-bold">
                {format(selectedDate, 'EEEE, MMMM d')} at {selectedTime}
              </p>
            </div>
            <Button
              onClick={handleSchedule}
              disabled={confirming}
              className={`
                ${confirming
                  ? 'bg-gray-300 cursor-wait'
                  : 'bg-tst-green'
                }
              `}
            >
              {confirming
                ? (isRescheduling ? 'Rescheduling...' : 'Scheduling...')
                : (isRescheduling ? 'Confirm Reschedule' : 'Confirm Appointment')
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadCalendar;
