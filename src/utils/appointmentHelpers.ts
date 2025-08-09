// src/utils/appointmentHelpers.ts
import { format, isToday, isTomorrow, isThisWeek, isAfter, isBefore } from 'date-fns';

export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE \'at\' h:mm a');
  }

  return format(date, 'MMM d \'at\' h:mm a');
};

export const getAppointmentStatus = (
  appointmentDate: string,
  status: string
): 'upcoming' | 'past' | 'today' | 'cancelled' | 'completed' => {
  const date = new Date(appointmentDate);
  const now = new Date();

  if (status === 'cancelled' || status === 'completed') {
    return status as 'cancelled' | 'completed';
  }

  if (isToday(date)) {
    return 'today';
  }

  if (isBefore(date, now)) {
    return 'past';
  }

  return 'upcoming';
};

export const getAppointmentStatusColor = (status: ReturnType<typeof getAppointmentStatus>): string => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'today':
      return 'bg-green-100 text-green-800';
    case 'past':
      return 'bg-gray-100 text-gray-600';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};
