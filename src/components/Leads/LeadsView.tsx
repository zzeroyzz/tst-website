/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LeadsView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, differenceInDays, parseISO } from "date-fns";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { LeadsViewSkeleton } from "@/components/skeleton";
import Button from "@/components/Button/Button";

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  notes?: string;
  created_at: string;
  reminder_at?: string;
  reminder_message?: string;
};

// Replaced statusColors object with a function to be more Tailwind-friendly
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
      return "bg-green-100 text-green-800";
    case "Not a Fit":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({
  lead,
  onClose,
  onConfirm,
  isDeleting
}: {
  lead: Lead;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-black shadow-brutalistLg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Delete Lead</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this lead?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="font-medium text-sm">{lead.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {lead.email} • {format(new Date(lead.created_at), "PPP")}
            </p>
          </div>
          <p className="text-red-600 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-200"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Lead Detail Modal Component ---
const LeadDetailModal = ({ lead, onClose, onUpdate }) => {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [reminderDate, setReminderDate] = useState(lead.reminder_at ? format(parseISO(lead.reminder_at), "yyyy-MM-dd'T'HH:mm") : "");
  const [reminderNote, setReminderNote] = useState(lead.reminder_message || "");
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = ["New", "Contacted", "Reminder Sent", "Consultation Scheduled", "Converted", "Not a Fit"];

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
        status,
        notes,
        reminder_at: reminderDate ? new Date(reminderDate).toISOString() : null,
        reminder_message: reminderNote || null
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

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl border-2 border-black">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold">{lead.name}</h2>
                <p className="text-gray-600">{lead.email} | {lead.phone}</p>
            </div>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-red-500">
                <X size={24} />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side for notes */}
            <div className="space-y-4">
                <div>
                    <label className="font-bold block mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple ${getStatusClasses(status)}`}
                    >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className="font-bold block mb-1">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={10}
                        className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
                        placeholder="Add notes about your interactions with this lead..."
                    />
                </div>
            </div>
            {/* Right side for reminders and info */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                 <div>
                    <h3 className="font-bold text-lg mb-2">Lead Information</h3>
                    <p><strong>Submitted:</strong> {format(new Date(lead.created_at), "PPP")}</p>
                 </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2">Set a Reminder</h3>
                    <div className="space-y-2">
                        <input
                            type="datetime-local"
                            value={reminderDate}
                            onChange={e => setReminderDate(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-md bg-white"
                        />
                        <textarea
                            rows={2}
                            value={reminderNote}
                            onChange={e => setReminderNote(e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-md bg-white"
                            placeholder="Reminder note..."
                        ></textarea>
                    </div>
                 </div>
            </div>
        </div>

        <div className="flex justify-between items-center mt-6">
            <button
                onClick={handleSendReminder}
                disabled={isSending || isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-tst-yellow text-black font-bold rounded-md border-2 border-black hover:bg-yellow-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                <Send size={18} />
                {isSending ? 'Sending...' : 'Send Reminder'}
            </button>
            <button
                onClick={handleSave}
                disabled={isSaving || isSending}
                className="px-6 py-2 bg-tst-purple text-black font-bold rounded-md hover:opacity-90 border-2 border-black"
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Leads View Component ---
const LeadsView = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; lead: Lead | null }>({
    show: false,
    lead: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
    } else {
      setLeads(data);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel("realtime-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLeads]);

  const handleUpdateLead = async (leadId: number, updatedData: Partial<Lead>, successMessage = "Lead updated successfully!") => {
    // Implement optimistic UI update correctly
    const originalLeads = [...leads];

    const newLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, ...updatedData } : lead
    );
    setLeads(newLeads);

    const { error } = await supabase.from("contacts").update(updatedData).eq("id", leadId);

    if (error) {
        toast.error(`Failed to update lead: ${error.message}`);
        setLeads(originalLeads); // Revert on failure
        return false;
    } else {
        toast.success(successMessage);
        return true;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation(); // Prevent row click
    setDeleteModal({ show: true, lead });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.lead) return;

    setIsDeleting(true);
    const deleteToast = toast.loading('Deleting lead...');

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", deleteModal.lead.id);

      if (error) {
        throw error;
      }

      // Update local state to remove the deleted lead
      setLeads(prev => prev.filter(l => l.id !== deleteModal.lead!.id));

      toast.dismiss(deleteToast);
      toast.success('Lead deleted successfully!');
      setDeleteModal({ show: false, lead: null });

    } catch (error: any) {
      toast.error(`Failed to delete lead: ${error.message}`, { id: deleteToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  // Show skeleton while loading
  if (loading) {
    return <LeadsViewSkeleton rowCount={5} />;
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold mb-6">Leads</h2>
        <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-gray-50">
                <tr>
                  <th className="p-4 font-bold"></th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Submitted</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const daysOld = differenceInDays(new Date(), new Date(lead.created_at));
                  // FIX: A lead is only "warm" if it's recent AND requires action.
                  const isActionableStatus = !['Consultation Scheduled', 'Converted', 'Not a Fit'].includes(lead.status);
                  const isWarm = daysOld <= 7 && isActionableStatus;

                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-200 hover:bg-tst-yellow cursor-pointer group"
                    >
                      <td className="p-4" onClick={() => handleRowClick(lead)}>
                        <div className={`w-3 h-3 rounded-full ${isWarm ? 'bg-red-500' : 'bg-gray-400'}`} title={isWarm ? 'Warm Lead' : 'Cold Lead'}></div>
                      </td>
                      <td className="p-4 font-medium" onClick={() => handleRowClick(lead)}>
                        {lead.name}
                      </td>
                      <td className="p-4" onClick={() => handleRowClick(lead)}>
                          <div>{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="p-4" onClick={() => handleRowClick(lead)}>
                        {format(new Date(lead.created_at), "PPP")}
                      </td>
                      <td className="p-4" onClick={() => handleRowClick(lead)}>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 relative">
                        <Button
                          type="button"
                          onClick={(e) => handleDeleteClick(e, lead)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        wrapperClassName="absolute -top-2 -right-2"
                        >
                          <X size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.lead && (
        <DeleteConfirmModal
          lead={deleteModal.lead}
          onClose={() => setDeleteModal({ show: false, lead: null })}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default LeadsView;
