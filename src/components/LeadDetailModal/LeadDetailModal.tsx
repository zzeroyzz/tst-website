/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/LeadDetailModal/LeadDetailModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Send, Archive, ArchiveRestore } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Button from '@/components/Button/Button';
import toast from 'react-hot-toast';
import type { Lead } from '@/types/lead';

// Status color helper function
const getStatusClasses = (status: string) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "Contacted":
      return "bg-yellow-100 text-yellow-800";
    case "Reminder Sent":
      return "bg-orange-100 text-orange-800";
    case "Consultation Scheduled":
      return "bg-purple-100 text-purple-800";
    case "Converted":
      return "bg-tst-green text-green-800";
    case "Not a Fit":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (leadId: number, updatedData: Partial<Lead>, successMessage?: string) => Promise<boolean>;
  onArchive?: (leadId: number) => Promise<boolean>;
  onUnarchive?: (leadId: number) => Promise<boolean>;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdate,
  onArchive,
  onUnarchive
}) => {
  const [status, setStatus] = useState(lead.status || 'New');
  const [notes, setNotes] = useState(lead.notes || "");
  const [reminderDate, setReminderDate] = useState(lead.reminder_at ? format(parseISO(lead.reminder_at), "yyyy-MM-dd'T'HH:mm") : "");
  const [reminderNote, setReminderNote] = useState(lead.reminder_message || "");
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  const statusOptions = ["New", "Contacted", "Reminder Sent", "Consultation Scheduled", "Converted", "Not a Fit"];

  // Auto-update status based on questionnaire completion and appointment scheduling
  useEffect(() => {
    if (lead.questionnaire_completed) {
      if (lead.scheduled_appointment_at) {
        // Has appointment - set to Consultation Scheduled
        if (status === 'New' || status === 'Contacted' || status === 'Reminder Sent') {
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

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
        status,
        notes,
        reminder_at: reminderDate ? new Date(reminderDate).toISOString() : "",
       reminder_message: reminderNote ? reminderNote : "",
    };
    const success = await onUpdate(lead.id, updatedData);
    setIsSaving(false);
    if (success) {
        onClose();
    }
  };

  const handleSendReminder = async () => {
    setIsSending(true);
    const toastId = toast.loading('Sending reminder...');

    try {
        const response = await fetch('/api/leads/send-reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: lead.email }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        toast.dismiss(toastId);

        const updatedData = {
            status: 'Reminder Sent',
            notes: notes,
            reminder_at: reminderDate ? new Date(reminderDate).toISOString() : null,
            reminder_message: reminderNote || null
        };
        const success = await onUpdate(lead.id, updatedData, 'Reminder sent! Lead status updated.');

        if (success) {
            onClose();
        }

    } catch (error: any) {
        toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
        setIsSending(false);
    }
  };

  const handleCopyQuestionnaireLink = () => {
    if (lead.questionnaire_token) {
      navigator.clipboard.writeText(`${window.location.origin}/questionnaire/${lead.questionnaire_token}`);
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

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl border-2 border-black">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {lead.name}
                  {lead.archived && (
                    <span className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-full">
                      Archived
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">{lead.email} | {lead.phone}</p>
            </div>
            <Button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors bg-tst-red text-white"
              >
                <X size={20} />
              </Button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side for notes and status */}
            <div className="space-y-4">
                <div className="pt-4">
                    <label className="font-bold block mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple ${getStatusClasses(status)}`}
                        disabled={lead.archived}
                    >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {lead.archived && (
                      <p className="text-sm text-gray-500 mt-1">
                        Status cannot be changed for archived leads
                      </p>
                    )}
                    {/* Status suggestions based on questionnaire/appointment data */}
                    {!lead.archived && lead.questionnaire_completed && !lead.scheduled_appointment_at && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        💡 <strong>Suggestion:</strong> Questionnaire completed but no appointment scheduled.
                        Consider status: {lead.qualified_lead === false ? '"Not a Fit"' : '"Contacted"'}
                      </div>
                    )}
                    {!lead.archived && lead.scheduled_appointment_at && status !== 'Consultation Scheduled' && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        💡 <strong>Suggestion:</strong> Appointment scheduled - consider status &rdquo;Consultation Scheduled&quot;
                      </div>
                    )}
                </div>

                <div>
                    <label className="font-bold block mb-1">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={8}
                        className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
                        placeholder="Add notes about your interactions with this lead..."
                        disabled={lead.archived}
                    />
                    {lead.archived && (
                      <p className="text-sm text-gray-500 mt-1">
                        Notes cannot be edited for archived leads
                      </p>
                    )}
                </div>

                {/* Appointment Information */}
                {lead.scheduled_appointment_at && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-lg mb-2 text-purple-800">📅 Scheduled Appointment</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Date & Time:</strong> {formatAppointmentDate(lead.scheduled_appointment_at)}</p>
                      <p><strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          lead.appointment_status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          lead.appointment_status === 'completed' ? 'bg-tst-green text-green-800' :
                          lead.appointment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.appointment_status || 'None'}
                        </span>
                      </p>

                      {lead.last_appointment_update && (
                        <p className="text-xs text-gray-500">
                          Last updated: {format(new Date(lead.last_appointment_update), "PPp")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

            </div>

            {/* Right side for lead info, questionnaire */}
            <div className="space-y-2">
                {/* Lead Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Lead Information</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-base"><strong>Contact Form Submitted:</strong> {format(new Date(lead.created_at), "PPp")}</p>

                    <p className="text-base"><strong>Questionnaire Status:</strong></p>
                    {lead.questionnaire_completed ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-green-600 font-medium">✓ Completed</p>
                          {lead.questionnaire_completed_at && (
                            <span className="text-xs">
                              on {format(new Date(lead.questionnaire_completed_at), "PPp")}
                            </span>
                          )}
                        </div>


                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-orange-600 font-medium">⏳ Pending completion</p>
                        <button
                          onClick={handleCopyQuestionnaireLink}
                          className="text-sm text-blue-600 underline hover:text-blue-800"
                          disabled={lead.archived}
                        >
                          Copy questionnaire link
                        </button>
                        {lead.questionnaire_reminder_sent_at && (
                          <p className="text-xs text-gray-500">
                            Reminder sent: {format(new Date(lead.questionnaire_reminder_sent_at), "PPp")}
                          </p>
                        )}
                      </div>
                    )}
                </div>

                        <p className="text-base"><strong>Qualified Lead:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.qualified_lead === true ? 'bg-tst-green text-green-800' :
                            lead.qualified_lead === false ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.qualified_lead === true ? 'Yes' : lead.qualified_lead === false ? 'No' : 'Unknown'}
                          </span>
                        </p>
                        <p className="text-base"><strong>Located in Georgia:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.located_in_georgia ? 'bg-tst-green text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.located_in_georgia ? 'Yes' : 'No'}
                          </span>
                        </p>
                        <p className="text-base"><strong>Interested in:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.interested_in ? 'bg-tst-green text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.interested_in ? lead.interested_in : 'N/A'}
                          </span>
                        </p>
                         <p className="text-base"><strong>Budget works:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.budget_works ? 'bg-tst-teal' : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.budget_works ? lead.budget_works : 'N/A'}
                          </span>
                        </p>
                         <p className="text-base"><strong>Scheduling Preference:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.budget_works ? 'bg-tst-green text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.scheduling_preference ? lead.scheduling_preference : 'N/A'}
                          </span>
                        </p>
                        <p className="text-base"><strong>Payment Method:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            lead.budget_works ? 'bg-tst-green text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.payment_method ? lead.payment_method : 'N/A'}
                          </span>
                        </p>

                </div>




            </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
            <div className="flex gap-3">
                {/* Send Reminder Button - only for active leads */}
                {!lead.archived && (
                  <Button
                      onClick={handleSendReminder}
                      disabled={isSending || isSaving || isArchiving || isUnarchiving}
                      className="flex items-center gap-2 px-4 py-2 bg-tst-yellow text-black font-bold rounded-md border-2 border-black hover:bg-yellow-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                      <Send size={16} />
                      {isSending ? 'Sending...' : 'Send Reminder'}
                  </Button>
                )}

                {/* Archive/Unarchive Button */}
                {lead.archived && onUnarchive ? (
                  <Button
                      onClick={handleUnarchive}
                      disabled={isSending || isSaving || isArchiving || isUnarchiving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-md border-2 border-black hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                      <ArchiveRestore size={16} />
                      {isUnarchiving ? 'Unarchiving...' : 'Unarchive Lead'}
                  </Button>
                ) : (
                  !lead.archived && onArchive && (
                    <Button
                        onClick={handleArchive}
                        disabled={isSending || isSaving || isArchiving || isUnarchiving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-bold rounded-md border-2 border-black hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Archive size={16} />
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
                  className="px-6 py-2 bg-tst-purple text-black font-bold rounded-md hover:opacity-90 border-2 border-black"
              >
                  {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
        </div>
      </div>
    </div>

  );
};

export default LeadDetailModal;
