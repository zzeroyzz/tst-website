/* eslint-disable react-hooks/exhaustive-deps */
// src/components/AppointmentRescheduleCalendar/AppointmentRescheduleCalendar.tsx
'use client';

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
  addHours,
  getDay,
  isSameDay,
  isAfter,
  addDays,
} from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import Button from '@/components/Button/Button';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentRescheduleCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string | number;
  contactUuid?: string; // Add UUID support
  contactName: string;
  contactEmail: string;
  currentAppointmentDate: Date; // UTC
  onReschedule: (
    contactId: string | number,
    newDateTime: Date
  ) => Promise<void>;
}

interface TimeSlot {
  time: string; // label in Eastern (e.g., "9:15 AM")
  available: boolean;
  dateTime: Date; // UTC to send to server
  isCurrent: boolean; // marks the user's current appointment slot
}

interface BookedSlot {
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  contactId?: string | number;
}

const EASTERN_TIMEZONE = 'America/New_York';
const APPOINTMENT_DURATION = 15; // minutes

// API: fetch all booked appointments within the month window
const fetchBookedAppointments = async (
  startDate: Date,
  endDate: Date
): Promise<BookedSlot[]> => {
  try {
    const res = await fetch('/api/appointment/booked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.bookedSlots ?? [];
  } catch (e) {
    console.error('Booked slots fetch error:', e);
    return [];
  }
};

// Availability map
const AVAILABILITY: Record<number, Array<{ start: string; end: string }>> = {
  1: [
    { start: '09:00', end: '10:45' },
    { start: '18:00', end: '19:00' },
  ],
  2: [
    { start: '09:00', end: '10:45' },
    { start: '18:00', end: '19:00' },
  ],
  3: [
    { start: '09:00', end: '10:45' },
    { start: '18:00', end: '19:00' },
  ],
  4: [{ start: '11:00', end: '19:00' }],
  5: [{ start: '11:00', end: '18:45' }], // Friday 11am-6:45pm EST
  6: [],
  0: [],
};

const AppointmentRescheduleCalendar: React.FC<
  AppointmentRescheduleCalendarProps
> = ({
  isOpen,
  onClose,
  contactId,
  contactUuid,
  contactName,
  contactEmail,
  currentAppointmentDate, // UTC
  onReschedule,
}) => {
  // Convert current appointment to Eastern for header display
  const currentAppointmentEastern = toZonedTime(
    new Date(currentAppointmentDate),
    EASTERN_TIMEZONE
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [confirming, setConfirming] = useState(false);

  // booked slots state
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Load booked slots whenever the displayed month changes
  useEffect(() => {
    if (!isOpen) return;
    const run = async () => {
      setLoadingSlots(true);
      const booked = await fetchBookedAppointments(calendarStart, calendarEnd);
      setBookedSlots(booked);
      setLoadingSlots(false);
    };
    run();
  }, [isOpen, currentDate]);

  // Is *this* UTC slot already booked by someone else?
  // We only block the exact start time (±60s tolerance) to avoid wiping out the whole window.
  const isSlotBooked = (slotStartUTC: Date): boolean => {
    return bookedSlots.some(b => {
      const bookedStart = new Date(b.startTime);

      // Allow the client's own current appointment to be selectable
      if (b.contactId && String(b.contactId) === String(contactId)) {
        // If this booked slot is theirs and matches their current appointment start, don't block it
        if (
          Math.abs(
            bookedStart.getTime() - new Date(currentAppointmentDate).getTime()
          ) < 60_000
        ) {
          return false;
        }
      }

      // Same start (within 60s tolerance)?
      return Math.abs(slotStartUTC.getTime() - bookedStart.getTime()) < 60_000;
    });
  };

  // Build time slots for a given *Eastern* date; return UTC datetimes for API
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dow = getDay(date);
    const dayAvailability = AVAILABILITY[dow];

    if (!dayAvailability || dayAvailability.length === 0) return slots;

    // Now in Eastern
    const nowEastern = toZonedTime(new Date(), EASTERN_TIMEZONE);
    const fourHoursFromNowEastern = addHours(nowEastern, 4);

    dayAvailability.forEach(({ start, end }) => {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);

      const startOfDayEastern = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      let currentSlotEastern = new Date(startOfDayEastern);
      currentSlotEastern.setHours(sh, sm, 0, 0);

      const endTimeEastern = new Date(startOfDayEastern);
      endTimeEastern.setHours(eh, em, 0, 0);

      while (currentSlotEastern < endTimeEastern) {
        // Eastern label for UI
        const label = formatTz(currentSlotEastern, 'h:mm a', {
          timeZone: EASTERN_TIMEZONE,
        });

        // Convert the Eastern wall time to UTC for storage/compare
        const slotStartUTC = fromZonedTime(
          currentSlotEastern,
          EASTERN_TIMEZONE
        );

        // Is this the user's current appointment?
        const isCurrent =
          Math.abs(
            slotStartUTC.getTime() - new Date(currentAppointmentDate).getTime()
          ) < 60_000;

        // Availability rules:
        // 1) must be ≥ 4 hours from now (compare in Eastern)
        // 2) must not be booked by someone else at the same start time
        // (but keep *this* user's current slot selectable)
        const futureOK = isAfter(currentSlotEastern, fourHoursFromNowEastern);
        const notBooked = !isSlotBooked(slotStartUTC);
        const available = futureOK && (isCurrent || notBooked);

        slots.push({
          time: label,
          available,
          dateTime: slotStartUTC,
          isCurrent,
        });

        // next 15-min increment
        currentSlotEastern = new Date(
          currentSlotEastern.getTime() + APPOINTMENT_DURATION * 60 * 1000
        );
      }
    });

    return slots;
  };

  // Dates that can be clicked (reschedule allows today+ if it meets 4h rule and it's a working day)
  const isDateSelectable = (date: Date): boolean => {
    const todayEastern = toZonedTime(new Date(), EASTERN_TIMEZONE);
    todayEastern.setHours(0, 0, 0, 0);

    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    const dow = getDay(check);
    const hasAvailability = AVAILABILITY[dow] && AVAILABILITY[dow].length > 0;

    if (!hasAvailability) return false;

    // Get current appointment day of week
    const currentAppointmentDay = getDay(currentAppointmentEastern);

    // Allow same-day scheduling only for Thursday (4) and Friday (5) appointments
    if (check.getTime() === todayEastern.getTime()) {
      return (currentAppointmentDay === 4 || currentAppointmentDay === 5) && hasAvailability;
    }

    // Don't allow past dates
    if (check < todayEastern) return false;

    // Apply 3-day business day limit
    let businessDaysAhead = 0;
    let currentDate = new Date(todayEastern);
    currentDate = addDays(currentDate, 1);

    while (currentDate <= check) {
      const currentDayOfWeek = getDay(currentDate);
      if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
        businessDaysAhead++;
      }

      if (businessDaysAhead > 3) return false;

      if (isSameDay(currentDate, check)) {
        return businessDaysAhead <= 3 && hasAvailability;
      }

      currentDate = addDays(currentDate, 1);
    }

    return false;
  };

  // Rebuild time slots when date or booked data changes
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(null);
    }
  }, [selectedDate, bookedSlots]);

  // Reset when modal opens and jump to month of current appointment
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setConfirming(false);
      setCurrentDate(new Date(currentAppointmentDate));
    }
  }, [isOpen, currentAppointmentDate]);

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date) && !loadingSlots) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleTimeSelect = (time: string) => setSelectedTime(time);

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    const selected = timeSlots.find(s => s.time === selectedTime);
    if (!selected) {
      toast.error('Invalid time slot selected');
      return;
    }
    if (!selected.available) {
      toast.error('This time is no longer available. Please pick another.');
      // refresh just in case
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(null);
      return;
    }

    setConfirming(true);
    try {
      await onReschedule(contactId, selected.dateTime); // UTC
      onClose();
      toast.success('Appointment rescheduled successfully!');
    } catch (e) {
      toast.error('Failed to reschedule appointment. Please try again.');
      console.error('Reschedule error:', e);
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    if (!confirming) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg w-full max-w-sm sm:max-w-4xl max-h-[80vh] sm:max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-6 border-b-2 border-black bg-tst-yellow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  Reschedule Appointment
                </h2>
                <p className="text-xs sm:text-sm">
                  <span className="font-medium">{contactName}</span> •{' '}
                  <span className="hidden sm:inline">{contactEmail}</span>
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  <span className="font-medium">Current:</span>{' '}
                  {formatTz(
                    currentAppointmentEastern,
                    "MMM d 'at' h:mm a",
                    { timeZone: EASTERN_TIMEZONE }
                  )}
                </p>
              </div>
              <Button
                onClick={handleClose}
                disabled={confirming}
                className="p-2   rounded-lg transition-colors bg-tst-red"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[50vh] sm:max-h-[75vh]">
            {/* Calendar */}
            <div className="p-3 sm:p-6 border-b-2 border-black">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-base sm:text-lg font-bold">
                  {format(currentDate, 'MMMM yyyy')}
                </h3>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map(d => (
                  <div key={d} className="font-bold text-xs sm:text-sm text-gray-500 py-1 sm:py-2">
                    {d}
                  </div>
                ))}
                {days.map(day => {
                  const selectable = isDateSelectable(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrent = isSameDay(day, currentAppointmentEastern);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => handleDateClick(day)}
                      disabled={!selectable || loadingSlots}
                      className={`
                        p-1 sm:p-2 border rounded-md min-h-[40px] sm:min-h-[50px]
                        flex items-center justify-center transition-all duration-200
                        ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''}
                        ${isToday(day) ? 'bg-tst-yellow border-2 border-black font-bold' : ''}
                        ${isCurrent ? 'bg-red-100 border-2 border-red-400 font-bold' : ''}
                        ${selected ? 'bg-tst-purple text-black border-2 border-black font-bold' : ''}
                        ${selectable && !selected ? 'border-2 border-black hover:bg-gray-100 cursor-pointer bg-tst-green' : ''}
                        ${!selectable ? 'cursor-not-allowed opacity-50' : ''}
                        ${loadingSlots ? 'opacity-50' : ''}
                      `}
                    >
                      <span className="text-sm sm:text-base">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-tst-yellow border border-black rounded" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-tst-green border border-black rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-400 rounded" />
                  <span>Current Appt</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-tst-purple border border-black rounded" />
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="p-3 sm:p-6 overflow-scroll h-14 md:h-full">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>
                    Available times for {format(selectedDate, 'MMM d')}{' '}
                    <span className="hidden sm:inline">(Eastern Time)</span>
                  </span>
                </h4>

                {timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No available time slots for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-24 sm:max-h-56 overflow-y-auto">
                    {timeSlots.map(slot => {
                      const isSelected = selectedTime === slot.time;

                      // Base styles
                      let cls =
                        'p-2 sm:p-3 rounded-lg border-2 font-medium text-xs sm:text-sm transition-all duration-200';

                      if (isSelected) {
                        cls +=
                          ' bg-tst-green border-black text-black shadow-md';
                      } else if (!slot.available) {
                        cls +=
                          ' border-black bg-white opacity-50 cursor-not-allowed line-through';
                      } else {
                        cls +=
                          ' border-black bg-white hover:bg-gray-50 cursor-pointer hover:shadow-md';
                      }

                      // Apply "current appointment" visual (red outline + light fill)
                      // unless the slot is already selected (selected style wins)
                      if (!isSelected && slot.isCurrent) {
                        cls = cls
                          .replace('border-black', 'border-red-400')
                          .replace('bg-white', 'bg-red-50');
                      }

                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={cls}
                          title={
                            slot.isCurrent ? 'Current appointment' : undefined
                          }
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-6 border-t-2 border-black bg-gray-50">
            {selectedDate && selectedTime ? (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-gray-600">
                    New appointment time<span className="hidden sm:inline"> (Eastern)</span>:
                  </p>
                  <p className="font-bold text-sm sm:text-base">
                    {format(selectedDate, 'MMM d')} at {selectedTime}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={handleClose}
                    disabled={confirming}
                    className="bg-gray-200 hover:bg-gray-300 text-black text-xs sm:text-sm px-3 sm:px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmReschedule}
                    disabled={confirming}
                    className={
                      confirming ? 'bg-gray-300 cursor-wait text-xs sm:text-sm px-3 sm:px-4 py-2' : 'bg-tst-green text-xs sm:text-sm px-3 sm:px-4 py-2'
                    }
                  >
                    {confirming ? 'Rescheduling...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                  Select a new date and time for the appointment
                </p>
                <Button
                  onClick={handleClose}
                  disabled={confirming}
                  className="bg-gray-200 hover:bg-gray-300 text-black text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentRescheduleCalendar;
