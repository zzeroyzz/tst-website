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
  addDays,
  isAfter,
  addHours,
  getDay,
  isSameDay,
} from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarStepComponentProps {
  variant: 'nd' | 'affirming' | 'trauma';
  onTimeSelected: (dateTime: Date) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  dateTime: Date;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

const EASTERN_TIMEZONE = 'America/New_York';

// Same availability configuration as LeadCalendar
const AVAILABILITY = {
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
  4: [
    { start: '11:00', end: '19:00' },
  ],
  5: [],
  6: [],
  0: [],
};

const CalendarStepComponent: React.FC<CalendarStepComponentProps> = ({
  variant,
  onTimeSelected,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
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
      try {
        const response = await fetch('/api/appointment/booked-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: calendarStart.toISOString(),
            endDate: calendarEnd.toISOString(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data.bookedSlots || []);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlotsForMonth();
  }, [currentDate]);

  // Check if a slot is booked
  const isSlotBooked = (slotStartUTC: Date): boolean => {
    const t = slotStartUTC.getTime();
    return bookedSlots.some(b => new Date(b.startTime).getTime() === t);
  };

  // Generate time slots for a selected date
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = getDay(date);
    const dayAvailability = AVAILABILITY[dayOfWeek];

    if (!dayAvailability || dayAvailability.length === 0) {
      return slots;
    }

    const nowUTC = new Date();
    const nowEastern = toZonedTime(nowUTC, EASTERN_TIMEZONE);
    const fourHoursFromNowEastern = addHours(nowEastern, 4);

    dayAvailability.forEach(({ start, end }) => {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const startOfDayEastern = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      let currentSlotEastern = new Date(startOfDayEastern);
      currentSlotEastern.setHours(startHour, startMin, 0, 0);

      const endTimeEastern = new Date(startOfDayEastern);
      endTimeEastern.setHours(endHour, endMin, 0, 0);

      while (currentSlotEastern < endTimeEastern) {
        const slotDateTimeEastern = new Date(currentSlotEastern);
        const slotDateTimeUTC = fromZonedTime(slotDateTimeEastern, EASTERN_TIMEZONE);

        const isFutureAvailable = isAfter(slotDateTimeEastern, fourHoursFromNowEastern);
        const isNotBooked = !isSlotBooked(slotDateTimeUTC);

        slots.push({
          time: formatTz(slotDateTimeEastern, 'h:mm a', { timeZone: EASTERN_TIMEZONE }),
          available: isFutureAvailable && isNotBooked,
          dateTime: slotDateTimeUTC,
        });

        currentSlotEastern = new Date(currentSlotEastern.getTime() + 15 * 60 * 1000);
      }
    });

    return slots;
  };

  // Check if a date has available slots
  const dateHasAvailableSlots = (date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const dayAvailability = AVAILABILITY[dayOfWeek];

    if (!dayAvailability || dayAvailability.length === 0) {
      return false;
    }

    const slots = generateTimeSlots(date);
    return slots.some(slot => slot.available);
  };

  // Check if a date is selectable
  const isDateSelectable = (date: Date): boolean => {
    const todayEastern = toZonedTime(new Date(), EASTERN_TIMEZONE);
    todayEastern.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate <= todayEastern) return false;

    const dayOfWeek = getDay(checkDate);
    const hasAvailability = AVAILABILITY[dayOfWeek] && AVAILABILITY[dayOfWeek].length > 0;
    if (!hasAvailability) return false;

    let businessDaysAhead = 0;
    let currentDate = new Date(todayEastern);
    currentDate = addDays(currentDate, 1);

    while (currentDate <= checkDate) {
      const currentDayOfWeek = getDay(currentDate);
      if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
        businessDaysAhead++;
      }

      if (businessDaysAhead > 3) return false;

      if (isSameDay(currentDate, checkDate)) {
        return (
          businessDaysAhead <= 3 &&
          (!loadingSlots ? dateHasAvailableSlots(checkDate) : true)
        );
      }

      currentDate = addDays(currentDate, 1);
    }

    return false;
  };

  // Update time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedDate, bookedSlots]);

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date)) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    const selectedSlot = timeSlots.find(slot => slot.time === time);
    if (selectedSlot) {
      // Directly trigger time selection and navigation
      onTimeSelected(selectedSlot.dateTime);
    }
  };


  return (
    <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b-2 border-black text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Pick a time → Quick intake → Free consult.</h2>
        <p className="text-lg text-gray-600">Select a date and time that works best for you. <br/> First full session guaranteed, no charge if you choose not to move forward.</p>
      </div>

      {/* Calendar Section */}
      <div className="p-6 border-b-2 border-black">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg md:text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {loadingSlots && (
          <div className="text-center py-2 text-sm text-gray-500">
            Loading available times...
          </div>
        )}

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {weekdays.map(day => (
            <div key={day} className="font-bold text-xs md:text-sm text-gray-500 py-1 md:py-2">
              {day}
            </div>
          ))}
          {days.map(day => {
            const selectable = isDateSelectable(day);
            const selected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                disabled={!selectable || loadingSlots}
                className={`
                  p-1 md:p-2 border rounded-md min-h-[40px] md:min-h-[50px]
                  flex items-center justify-center transition-all duration-200
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
        <div className="flex flex-wrap gap-2 text-xs">
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
        <div className="p-6">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Clock size={18} />
            <span>
              Available times for {format(selectedDate, 'EEEE, MMM d')} (Eastern Time)
            </span>
          </h4>

          {timeSlots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No available time slots for this date
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto mb-6">
              {timeSlots.map(slot => (
                <div key={slot.time} className="relative">
                  <button
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`
                      w-full p-2 md:p-3 rounded-lg border-2 font-medium text-sm md:text-base
                      transition-all duration-200 border-black bg-white hover:bg-tst-green
                      ${
                        !slot.available
                          ? 'opacity-50 cursor-not-allowed line-through'
                          : 'cursor-pointer hover:shadow-md'
                      }
                    `}
                  >
                    {slot.time}
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarStepComponent;
