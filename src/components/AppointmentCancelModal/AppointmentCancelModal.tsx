import React from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import Button from '@/components/Button/Button';

const EASTERN_TIMEZONE = 'America/New_York';

interface AppointmentCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
  contactEmail: string;
  appointmentDate: string; // UTC string from database
  isLoading?: boolean;
}

const formatAppointmentForModal = (utcDateString: string): string => {
  if (!utcDateString) return '—';

  // Check if date already has timezone info
  const hasTz = /(?:Z|[+\-]\d{2}:\d{2})$/i.test(utcDateString);
  const normalized = hasTz ? utcDateString : `${utcDateString}Z`;

  const utcDate = parseISO(normalized);
  if (isNaN(utcDate.getTime())) return '—';

  const easternDate = toZonedTime(utcDate, EASTERN_TIMEZONE);

  return formatTz(easternDate, "EEEE, MMMM d, yyyy 'at' h:mm a zzz", {
    timeZone: EASTERN_TIMEZONE,
  });
};

const AppointmentCancelModal: React.FC<AppointmentCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contactName,
  contactEmail,
  appointmentDate,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl border-4 border-black shadow-2xl max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-2 border-black">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              Cancel Appointment
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this appointment?
            </p>

            {/* Appointment Details */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="font-semibold text-gray-900">{contactName}</p>
                  <p className="text-sm text-gray-600 mb-2">{contactEmail}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatAppointmentForModal(appointmentDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-800 text-sm font-medium">
                ⚠️ This action cannot be undone.
              </p>
              <p className="text-red-700 text-sm mt-1">
                The client will be notified via email about the cancellation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t-2 border-black bg-gray-50">
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border-2 border-black rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Keep Appointment
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border-2 border-black rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentCancelModal;
