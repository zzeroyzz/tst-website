/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/LeadDetailModal/LeadDetailModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Archive,
  ArchiveRestore,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
  CreditCard,
  Users,
  Bell,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Button from '@/components/Button/Button';
import toast from 'react-hot-toast';
import type { Lead } from '@/types/lead';

// Status color helper function
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 ';
    case 'Contacted':
      return 'bg-yellow-100 ';
    case 'Reminder Sent':
      return 'bg-orange-100';
    case 'Consultation Scheduled':
      return 'bg-purple-100 ';
    case 'Converted':
      return 'bg-tst-green';
    case 'Not a Fit':
      return 'bg-gray-100';
    default:
      return 'bg-gray-100';
  }
};

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (
    leadId: number,
    updatedData: Partial<Lead>,
    successMessage?: string
  ) => Promise<boolean>;
  onArchive?: (leadId: number) => Promise<boolean>;
  onUnarchive?: (leadId: number) => Promise<boolean>;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdate,
  onArchive,
  onUnarchive,
}) => {
  const [status, setStatus] = useState(lead.status || 'New');
  const [notes, setNotes] = useState(lead.notes || '');
  const [reminderDate, setReminderDate] = useState(
    lead.reminder_at
      ? format(parseISO(lead.reminder_at), "yyyy-MM-dd'T'HH:mm")
      : ''
  );
  const [reminderNote, setReminderNote] = useState(lead.reminder_message || '');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  const statusOptions = [
    'New',
    'Contacted',
    'Reminder Sent',
    'Consultation Scheduled',
    'Converted',
    'Not a Fit',
  ];
  console.log(lead, 'lead in modal');
  // Auto-update status based on questionnaire completion and appointment scheduling
  useEffect(() => {
    if (lead.questionnaire_completed) {
      if (lead.scheduled_appointment_at) {
        // Has appointment - set to Consultation Scheduled
        if (
          status === 'New' ||
          status === 'Contacted' ||
          status === 'Reminder Sent'
        ) {
          setStatus('Consultation Scheduled');
        }
      } else {
        // Completed questionnaire but no appointment
        if (lead.qualified_lead === false) {
          // Not qualified - set to Not a Fit
          if (status !== 'Not a Fit') {
            setStatus('Not a Fit');
          }
        } else if (lead.qualified_lead === true) {
          // Qualified but hasn't scheduled - keep as Contacted if not further along
          if (status === 'New') {
            setStatus('Contacted');
          }
        }
      }
    }
  }, [lead, status]);

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Parse reminder history from notes
  const getReminderHistory = () => {
    // Define the type for reminder objects
    interface Reminder {
      type: 'Manual' | 'Auto';
      date: Date;
      note: string;
    }

    const reminders: Reminder[] = [];

    // Manual reminders (from questionnaire_reminder_sent_at)
    if (lead.questionnaire_reminder_sent_at) {
      reminders.push({
        type: 'Manual',
        date: new Date(lead.questionnaire_reminder_sent_at),
        note: `Manual questionnaire reminder sent`,
      });
    }

    // Auto reminders (from last_auto_reminder_sent and auto_reminder_count)
    if (lead.last_auto_reminder_sent && lead.auto_reminder_count) {
      reminders.push({
        type: 'Auto',
        date: new Date(lead.last_auto_reminder_sent),
        note: `Auto reminder #${lead.auto_reminder_count} sent`,
      });
    }

    // Parse additional reminders from notes text
    if (notes) {
      const noteLines = notes.split('\n');
      noteLines.forEach(line => {
        // Look for manual reminder patterns
        if (line.includes('Questionnaire reminder sent on')) {
          const match = line.match(/Questionnaire reminder sent on (.+)/);
          if (match) {
            try {
              const date = new Date(match[1]);
              if (!isNaN(date.getTime())) {
                reminders.push({
                  type: 'Manual',
                  date: date,
                  note: line.trim(),
                });
              }
            } catch (e) {
              // Skip invalid dates
            }
          }
        }

        // Look for auto reminder patterns
        if (
          line.includes('Questionnaire reminder #') &&
          line.includes('sent on')
        ) {
          const match = line.match(
            /Questionnaire reminder #(\d+) sent on (.+)/
          );
          if (match) {
            try {
              const date = new Date(match[2]);
              if (!isNaN(date.getTime())) {
                reminders.push({
                  type: 'Auto',
                  date: date,
                  note: line.trim(),
                });
              }
            } catch (e) {
              // Skip invalid dates
            }
          }
        }
      });
    }

    // Remove duplicates and sort by date (newest first)
    const uniqueReminders = reminders.filter(
      (reminder, index, self) =>
        index ===
        self.findIndex(
          r =>
            r.date.getTime() === reminder.date.getTime() &&
            r.type === reminder.type
        )
    );

    return uniqueReminders.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
      status,
      notes,
      reminder_at: reminderDate ? new Date(reminderDate).toISOString() : null,
      reminder_message: reminderNote || null,
    };
    const success = await onUpdate(lead.id, updatedData);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const handleSendReminder = async () => {
    setIsSending(true);
    const toastId = toast.loading('Sending questionnaire reminder...');

    try {
      // Call the questionnaire reminder API with the lead's contact ID
      const response = await fetch('/api/questionnaire/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: lead.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reminder');
      }

      // 🔥 CREATE NOTIFICATION FOR MANUAL REMINDER
      try {
        await fetch('/api/dashboard/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reminder_sent',
            title: 'Manual Reminder Sent',
            message: `Manual reminder sent to ${lead.name}`,
            contact_id: lead.id,
            contact_name: lead.name,
            contact_email: lead.email,
            reminder_number: 1, // Manual reminders are always "1" since we track separately
          }),
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the whole process if notification creation fails
      }

      toast.success('Questionnaire reminder sent successfully!', {
        id: toastId,
      });

      // Update the lead status and add a note about the reminder
      const now = new Date();
      const currentDate = now.toISOString();
      const reminderNote = `Manual questionnaire reminder sent on ${format(now, 'PPp')}`;

      const updatedData = {
        status: 'Reminder Sent',
        notes: notes ? `${notes}\n\n${reminderNote}` : reminderNote,
        questionnaire_reminder_sent_at: currentDate,
      };

      const success = await onUpdate(
        lead.id,
        updatedData,
        'Reminder sent! Lead status updated.'
      );

      if (success) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyQuestionnaireLink = () => {
    if (lead.questionnaire_token) {
      navigator.clipboard.writeText(
        `${window.location.origin}/questionnaire/${lead.questionnaire_token}`
      );
      toast.success('Questionnaire link copied to clipboard');
    }
  };

  const handleArchive = async () => {
    if (!onArchive) {
      toast.error('Archive functionality not available');
      return;
    }

    setIsArchiving(true);
    try {
      const success = await onArchive(lead.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to archive lead');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!onUnarchive) {
      toast.error('Unarchive functionality not available');
      return;
    }

    setIsUnarchiving(true);
    try {
      const success = await onUnarchive(lead.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to unarchive lead');
    } finally {
      setIsUnarchiving(false);
    }
  };

  const reminderHistory = getReminderHistory();

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-450 flex flex-col border-2 border-black overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex justify-between bg-white border-b border-gray-200 p-4 sm:p-6 relative">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {lead.name}
                </h2>
                {lead.archived && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full self-start flex-shrink-0">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail size={14} />
                  <span className="break-all">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Close button - positioned absolutely in top right */}
          <Button onClick={onClose} className="bg-tst-red text-white">
            <X size={18} />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Status & Notes */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="font-bold block mb-2 text-sm">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={`w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple text-sm ${getStatusClasses(status)}`}
                    disabled={lead.archived}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {lead.archived && (
                    <p className="text-xs text-gray-500 mt-1">
                      Status cannot be changed for archived leads
                    </p>
                  )}

                  {/* Status suggestions */}
                  {!lead.archived &&
                    lead.questionnaire_completed &&
                    !lead.scheduled_appointment_at && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        💡 <strong>Suggestion:</strong> Questionnaire completed
                        but no appointment scheduled. Consider status:{' '}
                        {lead.qualified_lead === false
                          ? '"Not a Fit"'
                          : '"Contacted"'}
                      </div>
                    )}
                  {!lead.archived &&
                    lead.scheduled_appointment_at &&
                    status !== 'Consultation Scheduled' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        💡 <strong>Suggestion:</strong> Appointment scheduled -
                        consider status &quot;Consultation Scheduled&quot;
                      </div>
                    )}
                </div>

                {/* Reminder History */}
                {reminderHistory.length > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-sm mb-2 text-orange-800 flex items-center gap-2">
                      <Bell size={16} />
                      Reminder History ({reminderHistory.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {reminderHistory.map((reminder, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span
                            className={`px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                              reminder.type === 'Auto'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {reminder.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-600 break-words">
                              {reminder.note}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {format(reminder.date, 'PPp')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="font-bold block mb-2 text-sm">
                    Notes
                    {notes && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({notes.split('\n').filter(line => line.trim()).length}{' '}
                        lines)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={6}
                    className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple resize-none text-sm"
                    placeholder="Add notes about your interactions with this lead..."
                    disabled={lead.archived}
                  />
                  {lead.archived && (
                    <p className="text-xs text-gray-500 mt-1">
                      Notes cannot be edited for archived leads
                    </p>
                  )}
                  {notes && !lead.archived && (
                    <p className="text-xs text-gray-500 mt-1">
                      Notes include manual entries and auto-reminder history
                    </p>
                  )}
                </div>

                {/* Appointment Information - Mobile */}
                {lead.scheduled_appointment_at && (
                  <div className="lg:hidden bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-sm mb-2 text-purple-800 flex items-center gap-2">
                      <Calendar size={16} />
                      Scheduled Appointment
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p>
                        <strong>Date & Time:</strong>
                        <br className="sm:hidden" />{' '}
                        {formatAppointmentDate(lead.scheduled_appointment_at)}
                      </p>
                      <p className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <strong>Status:</strong>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.appointment_status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.appointment_status === 'COMPLETED'
                                ? 'bg-tst-green text-green-800'
                                : lead.appointment_status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lead.appointment_status || 'None'}
                        </span>
                      </p>
                      {lead.last_appointment_update && (
                        <p className="text-xs text-gray-500">
                          Last updated:{' '}
                          {format(
                            new Date(lead.last_appointment_update),
                            'PPp'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Lead Information */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <User size={16} />
                    Lead Information
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={14}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <div>
                        <strong>Contact Form Submitted:</strong>
                        <br className="sm:hidden" />
                        <span className="text-gray-600">
                          {format(new Date(lead.created_at), 'PPp')}
                        </span>
                      </div>
                    </div>

                    {/* Questionnaire Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {lead.questionnaire_completed ? (
                          <CheckCircle
                            size={14}
                            className="text-green-600 flex-shrink-0"
                          />
                        ) : (
                          <Clock
                            size={14}
                            className="text-orange-600 flex-shrink-0"
                          />
                        )}
                        <strong>Questionnaire Status:</strong>
                      </div>

                      {lead.questionnaire_completed ? (
                        <div className="ml-4 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-green-600 font-medium text-xs">
                              ✓ Completed
                            </span>
                            {lead.questionnaire_completed_at && (
                              <span className="text-xs text-gray-500">
                                on{' '}
                                {format(
                                  new Date(lead.questionnaire_completed_at),
                                  'PPp'
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="ml-4 space-y-1">
                          <p className="text-orange-600 font-medium text-xs">
                            ⏳ Pending completion
                          </p>
                          <button
                            onClick={handleCopyQuestionnaireLink}
                            className="text-xs text-blue-600 underline hover:text-blue-800"
                            disabled={lead.archived}
                          >
                            Copy questionnaire link
                          </button>
                          {lead.questionnaire_reminder_sent_at && (
                            <p className="text-xs text-gray-500">
                              Last manual reminder:{' '}
                              {format(
                                new Date(lead.questionnaire_reminder_sent_at),
                                'PPp'
                              )}
                            </p>
                          )}
                          {lead.last_auto_reminder_sent && (
                            <p className="text-xs text-gray-500">
                              Last auto reminder:{' '}
                              {format(
                                new Date(lead.last_auto_reminder_sent),
                                'PPp'
                              )}
                              {lead.auto_reminder_count &&
                                ` (${lead.auto_reminder_count})`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Qualification Details */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-bold text-sm mb-2">
                    Qualification Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Qualified Lead:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.qualified_lead === true
                            ? 'bg-tst-green'
                            : lead.qualified_lead === false
                              ? 'bg-red-100'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.qualified_lead === true
                          ? 'Yes'
                          : lead.qualified_lead === false
                            ? 'No'
                            : 'Unknown'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="font-medium">In Georgia:</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.located_in_georgia
                            ? 'bg-tst-green'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lead.located_in_georgia === true
                          ? 'Yes'
                          : lead.located_in_georgia === false
                            ? 'No'
                            : 'Unknown'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span className="font-medium">Interested in:</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-tst-purple text-black break-words text-right">
                          {lead.interested_in || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} />
                          <span className="font-medium">Budget:</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-tst-teal text-black">
                          {lead.budget_works === true
                            ? 'Yes'
                            : lead.budget_works === false
                              ? 'No'
                              : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span className="font-medium">Schedule:</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-tst-yellow text-black">
                          {lead.scheduling_preference || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <CreditCard size={12} />
                          <span className="font-medium">Payment Method:</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-tst-green text-black">
                          {lead.payment_method || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Information - Desktop */}
                {lead.scheduled_appointment_at && (
                  <div className="hidden lg:block bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-sm mb-2 text-purple-800 flex items-center gap-2">
                      <Calendar size={16} />
                      Scheduled Appointment
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p>
                        <strong>Date & Time:</strong>
                        <br />{' '}
                        {formatAppointmentDate(lead.scheduled_appointment_at)}
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.appointment_status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.appointment_status === 'COMPLETED'
                                ? 'bg-tst-green text-green-800'
                                : lead.appointment_status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lead.appointment_status || 'None'}
                        </span>
                      </p>
                      {lead.last_appointment_update && (
                        <p className="text-xs text-gray-500">
                          Last updated:{' '}
                          {format(
                            new Date(lead.last_appointment_update),
                            'PPp'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Send Reminder Button - only for active leads */}
              {!lead.archived && (
                <Button
                  onClick={handleSendReminder}
                  disabled={
                    isSending || isSaving || isArchiving || isUnarchiving
                  }
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-tst-yellow text-black font-bold rounded-md border-2 border-black hover:bg-yellow-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  <Send size={14} />
                  {isSending ? 'Sending...' : 'Send Manual Reminder'}
                </Button>
              )}

              {/* Archive/Unarchive Button */}
              {lead.archived && onUnarchive ? (
                <Button
                  onClick={handleUnarchive}
                  disabled={
                    isSending || isSaving || isArchiving || isUnarchiving
                  }
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white font-bold rounded-md border-2 border-black hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  <ArchiveRestore size={14} />
                  {isUnarchiving ? 'Unarchiving...' : 'Unarchive Lead'}
                </Button>
              ) : (
                !lead.archived &&
                onArchive && (
                  <Button
                    onClick={handleArchive}
                    disabled={
                      isSending || isSaving || isArchiving || isUnarchiving
                    }
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white font-bold rounded-md border-2 border-black hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    <Archive size={14} />
                    {isArchiving ? 'Archiving...' : 'Archive Lead'}
                  </Button>
                )
              )}
            </div>

            {/* Save Button - only for active leads */}
            {!lead.archived && (
              <Button
                onClick={handleSave}
                disabled={isSaving || isSending || isArchiving || isUnarchiving}
                className="px-4 py-2 bg-tst-purple text-black font-bold rounded-md hover:opacity-90 border-2 border-black text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
