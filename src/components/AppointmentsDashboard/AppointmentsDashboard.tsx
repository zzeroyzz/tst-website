/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AppointmentsDashboard/AppointmentsDashboard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  MoreVertical,
  Check,
  X,
  Edit,
  Eye,
} from 'lucide-react';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Contact } from '@/types/contact';
import Button from '@/components/Button/Button';
import { AppointmentsSkeleton } from '@/components/skeleton';
import AppointmentRescheduleCalendar from '@/components/AppointmentRescheduleCalendar/AppointmentRescheduleCalendar';
import AppointmentCancelModal from '@/components/AppointmentCancelModal/AppointmentCancelModal';
import LeadDetailModal from '@/components/LeadDetailModal/LeadDetailModal';
import { useAppointments } from '@/hooks/useAppointments';
import {
  getAppointmentStatus,
  getAppointmentStatusColor,
} from '@/utils/appointmentHelpers';
import toast from 'react-hot-toast';

const EASTERN_TIMEZONE = 'America/New_York';

// Robust UTC parser
const parseUtc = (val: string): Date => {
  let s = (val || '').trim();
  if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) s = s.replace(' ', 'T');
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += 'Z';
  return new Date(s);
};

// ET formatter
const formatAppointmentDateEastern = (utcDateString: string): string => {
  try {
    const utcDate = parseUtc(utcDateString);
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date after parse:', utcDateString);
      return utcDateString ?? '';
    }
    const easternDate = toZonedTime(utcDate, EASTERN_TIMEZONE);
    return formatTz(easternDate, "EEEE, MMMM d, yyyy 'at' h:mm a zzz", {
      timeZone: EASTERN_TIMEZONE,
    });
  } catch (e) {
    console.error('formatAppointmentDateEastern error:', e);
    return utcDateString ?? '';
  }
};

interface AppointmentCardProps {
  contact: Contact;
  onStatusUpdate: (uuid: string, status: string) => void;
  onReschedule: (uuid: string) => void;
  onCancel: (uuid: string) => void;
  onViewLead: (uuid: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  contact,
  onStatusUpdate,
  onReschedule,
  onCancel,
  onViewLead,
}) => {
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close actions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!contact.scheduled_appointment_at) return null;

  const appointmentStatus = getAppointmentStatus(
    contact.scheduled_appointment_at,
    contact.appointment_status
  );
  const statusColorClass = getAppointmentStatusColor(appointmentStatus);

  return (
    <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutalist transition-shadow relative min-h-[200px] flex flex-col">
      {/* header */}
      <div className="flex justify-between items-start mb-3">
        <div
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}
        >
          {appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1)}
        </div>

        <div className="relative" ref={dropdownRef}>
          <Button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded bg-white border border-gray-300 flex-shrink-0"
          >
            <MoreVertical size={16} />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded-lg shadow-brutalistLg z-20 min-w-[160px] overflow-hidden">
              <div
                onClick={() => {
                  onViewLead(contact.uuid);
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 cursor-pointer text-sm font-medium transition-colors hover:bg-tst-purple"
              >
                <Eye size={16} />
                View Lead
              </div>
              <div className="border-t border-gray-200"></div>
              <div
                onClick={() => {
                  onStatusUpdate(contact.uuid, 'completed');
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 cursor-pointer text-sm font-medium transition-colors hover:bg-tst-purple"
              >
                <Check size={16} />
                Mark Complete
              </div>
              <div className="border-t border-gray-200"></div>
              <div
                onClick={() => {
                  onReschedule(contact.uuid);
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 cursor-pointer text-sm font-medium transition-colors hover:bg-tst-purple"
              >
                <Edit size={16} />
                Reschedule
              </div>
              <div className="border-t border-gray-200"></div>
              <div
                onClick={() => {
                  onCancel(contact.uuid);
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:bg-tst-red cursor-pointer text-sm font-medium transition-colors"
              >
                <X size={16} />
                Cancel
              </div>
            </div>
          )}
        </div>
      </div>

      {/* contact info */}
      <div className="mb-3 flex-grow">
        <h3 className="font-bold text-lg mb-2 break-words leading-tight">
          {contact.name}
        </h3>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
          {contact.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} className="flex-shrink-0" />
              <span>{contact.phone_number}</span>
            </div>
          )}
        </div>

        {contact.company && (
          <p className="text-sm text-gray-500 mt-2 break-words">
            {contact.position ? `${contact.position} at ` : ''}
            {contact.company}
          </p>
        )}
      </div>

      {/* appt */}
      <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded border mb-3">
        <Clock size={14} className="flex-shrink-0" />
        <span className="font-medium break-words">
          {formatAppointmentDateEastern(contact.scheduled_appointment_at)}
        </span>
      </div>

      {/* notes */}
      {contact.appointment_notes && (
        <div className="text-sm text-gray-600 mt-auto">
          <p className="font-medium mb-1">Notes:</p>
          <p className="break-words text-xs leading-relaxed">
            {contact.appointment_notes}
          </p>
        </div>
      )}
    </div>
  );
};

const AppointmentsDashboard: React.FC = () => {
  const { appointments, loading, error, refreshAppointments } = useAppointments();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'past' | 'cancelled' | 'completed'>(
    'upcoming'
  );

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleModalData, setRescheduleModalData] = useState<{
    uuid: string;
    contactName: string;
    contactEmail: string;
    currentAppointmentDate: Date;
  } | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelModalData, setCancelModalData] = useState<{
    uuid: string;
    contactName: string;
    contactEmail: string;
    appointmentDate: string;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Lead modal state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const supabase = createClientComponentClient();

  // --- Actions (all by UUID) ---

  const handleStatusUpdate = async (uuid: string, status: string) => {
    if (status !== 'completed') {
      toast.error('Invalid status update');
      return;
    }

    try {
      const response = await fetch(`/api/appointment/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, status }),
      });

      if (!response.ok) throw new Error('Failed to update appointment status');

      toast.success('Appointment marked as completed');
      refreshAppointments();
    } catch (e) {
      toast.error('Failed to update appointment');
      console.error('Update error:', e);
    }
  };

  const handleCancel = (uuid: string) => {
    const contact = appointments.find(c => c.uuid === uuid);
    if (!contact || !contact.scheduled_appointment_at) {
      toast.error('Contact or appointment not found');
      return;
    }
    setCancelModalData({
      uuid,
      contactName: `${contact.name} ${contact.last_name || ''}`.trim(),
      contactEmail: contact.email,
      appointmentDate: contact.scheduled_appointment_at,
    });
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelModalData) return;
    setIsCancelling(true);
    try {
      const response = await fetch('/api/appointment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: cancelModalData.uuid }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Failed to cancel appointment');

      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelModalData(null);
      refreshAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
      console.error('Cancel error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = (uuid: string) => {
    const contact = appointments.find(c => c.uuid === uuid);
    if (!contact || !contact.scheduled_appointment_at) {
      toast.error('Contact or appointment not found');
      return;
    }
    const utcAppointmentDate = new Date(contact.scheduled_appointment_at);
    setRescheduleModalData({
      uuid,
      contactName: `${contact.name} ${contact.last_name || ''}`.trim(),
      contactEmail: contact.email,
      currentAppointmentDate: utcAppointmentDate,
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async (
    uuid: string | number,
    newDateTime: Date
  ): Promise<void> => {
    // Accept both, but send UUID
    const uuidStr = typeof uuid === 'number' ? String(uuid) : uuid;

    const response = await fetch('/api/appointment/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: uuidStr,
        newDateTime: newDateTime.toISOString(),
      }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || 'Failed to reschedule appointment');
    refreshAppointments();
  };

  const handleViewLead = async (uuid: string) => {
    try {
      const { data: lead, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('uuid', uuid)
        .single();

      if (error) throw error;

      setSelectedLead(lead);
      setShowLeadModal(true);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead details');
    }
  };

  // Update/archive helpers by UUID (we'll wrap them when passing to the modal).
  const updateLeadByUuid = async (
    leadUuid: string,
    updatedData: any,
    successMessage = 'Lead updated successfully!'
  ) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updatedData)
        .eq('uuid', leadUuid);

      if (error) throw error;

      toast.success(successMessage);
      refreshAppointments();
      return true;
    } catch (error: any) {
      toast.error(`Failed to update lead: ${error.message}`);
      return false;
    }
  };

  const archiveLeadByUuid = async (leadUuid: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ archived: true })
        .eq('uuid', leadUuid);

      if (error) throw error;

      toast.success('Lead archived successfully!');
      refreshAppointments();
      return true;
    } catch (error: any) {
      toast.error(`Failed to archive lead: ${error.message}`);
      return false;
    }
  };

  // Filtering
  const filteredAppointments = appointments.filter(contact => {
    if (!contact.scheduled_appointment_at) return false;
    const status = getAppointmentStatus(
      contact.scheduled_appointment_at,
      contact.appointment_status
    );
    switch (filter) {
      case 'upcoming':
        return status === 'upcoming'; // This now properly excludes cancelled/completed
      case 'today':
        return status === 'today';
      case 'past':
        return status === 'past';
      case 'cancelled':
        return status === 'cancelled';
      case 'completed':
        return status === 'completed';
      default:
        return true;
    }
  });

  if (loading) {
    return <AppointmentsSkeleton count={6} showStats={true} showFilters={true} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error loading appointments: {error}</p>
        <Button
          onClick={refreshAppointments}
          className="px-4 py-2 border-2 border-black rounded-lg bg-tst-green transition-colors"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar size={24} /> Appointments
        </h2>
        <Button
          onClick={refreshAppointments}
          className="px-4 py-2 border-2 border-black rounded-lg bg-tst-green transition-colors"
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'today', label: 'Today' },
          { key: 'past', label: 'Past' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-2 rounded-lg border-2 border-black font-medium transition-colors ${
              filter === key ? 'bg-tst-purple text-black' : 'bg-white'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: appointments.length, color: 'bg-blue-100' },
          {
            label: 'Today',
            count: appointments.filter(
              c =>
                c.scheduled_appointment_at &&
                getAppointmentStatus(
                  c.scheduled_appointment_at,
                  c.appointment_status
                ) === 'today'
            ).length,
            color: 'bg-green-100',
          },
          {
            label: 'Upcoming',
            count: appointments.filter(
              c =>
                c.scheduled_appointment_at &&
                getAppointmentStatus(
                  c.scheduled_appointment_at,
                  c.appointment_status
                ) === 'upcoming'
            ).length,
            color: 'bg-yellow-100',
          },
          {
            label: 'Completed',
            count: appointments.filter(
              c => c.appointment_status === 'COMPLETED'
            ).length,
            color: 'bg-purple-100',
          },
          {
            label: 'Cancelled',
            count: appointments.filter(
              c => c.appointment_status === 'CANCELLED'
            ).length,
            color: 'bg-red-100',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} border-2 border-black rounded-lg p-4`}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No appointments found</p>
          <p className="text-sm">
            {filter === 'all'
              ? 'No appointments scheduled yet'
              : `No ${filter} appointments`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map(contact => (
            <AppointmentCard
              key={contact.uuid}
              contact={contact}
              onStatusUpdate={handleStatusUpdate}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
              onViewLead={handleViewLead}
            />
          ))}
        </div>
      )}

      {showRescheduleModal && rescheduleModalData && (
        <AppointmentRescheduleCalendar
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          contactId={rescheduleModalData.uuid} // prop name unchanged, value is UUID
          contactName={rescheduleModalData.contactName}
          contactEmail={rescheduleModalData.contactEmail}
          currentAppointmentDate={rescheduleModalData.currentAppointmentDate}
          onReschedule={handleRescheduleConfirm} // receives uuid from us
        />
      )}

      {showCancelModal && cancelModalData && (
        <AppointmentCancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          contactName={cancelModalData.contactName}
          contactEmail={cancelModalData.contactEmail}
          appointmentDate={cancelModalData.appointmentDate}
          isLoading={isCancelling}
        />
      )}

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(null);
          }}
          // Keep the same callback signature expected by the modal,
          // but ignore its id param and use our selected lead UUID.
          onUpdate={(_leadId: any, updatedData: any, msg?: string) =>
            updateLeadByUuid(selectedLead?.uuid, updatedData, msg)
          }
          onArchive={(_leadId: any) => archiveLeadByUuid(selectedLead?.uuid)}
        />
      )}
    </div>
  );
};

export default AppointmentsDashboard;
