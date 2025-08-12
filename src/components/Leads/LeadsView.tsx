/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LeadsView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, differenceInDays } from "date-fns";
import { X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { LeadsViewSkeleton } from "@/components/skeleton";
import Button from "@/components/Button/Button";
import LeadDetailModal from "@/components/LeadDetailModal/LeadDetailModal";
import type { Lead } from '@/types/lead';


const getStatusClasses = (status: string) => {
  switch (status) {
    case "New":
      return "bg-tst-tel text-blue-800";
    case "Contacted":
      return "bg-tst-yellow text-yellow-800";
    case "Reminder Sent":
      return "bg-orange-100 text-orange-800";
    case "Consultation Scheduled":
      return "bg-tst-purple text-purple-800";
    case "Converted":
      return "bg-tst-green text-green-800";
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
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            disabled={isDeleting}
          >
            <X size={24} />
          </Button>
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

// --- Add Lead Modal Component ---
const AddLeadModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setIsAdding(true);
    const success = await onAdd(formData);
    setIsAdding(false);

    if (success) {
      onClose();
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-black shadow-brutalistLg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Add New Lead</h3>
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            disabled={isAdding}
          >
            <X size={24} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold block mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={handleInputChange('notes')}
              rows={3}
              className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple"
              placeholder="Add any initial notes..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={onClose}
              className="bg-gray-200"
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-tst-purple text-black"
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </form>
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
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClientComponentClient();

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("archived", false)  // Only fetch non-archived leads
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

  const handleAddLead = async (formData) => {
    const addToast = toast.loading('Adding new lead...');

    try {
      // Create new lead data with default values
      const newLeadData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        notes: formData.notes.trim() || null,
        status: 'New',
        questionnaire_completed: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("contacts")
        .insert([newLeadData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new lead to the local state
      setLeads(prev => [data, ...prev]);

      toast.dismiss(addToast);
      toast.success('Lead added successfully!');
      return true;

    } catch (error: any) {
      toast.error(`Failed to add lead: ${error.message}`, { id: addToast });
      return false;
    }
  };

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

  const handleArchiveLead = async (leadId: number) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ archived: true })
        .eq("id", leadId);

      if (error) {
        throw error;
      }

      // Remove from local state since it's archived
      setLeads(prev => prev.filter(l => l.id !== leadId));
      toast.success('Lead archived successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to archive lead: ${error.message}`);
      return false;
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Leads</h2>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-tst-purple text-black flex items-center gap-2"
          >
            <Plus size={20} />
            Add Lead
          </Button>
        </div>
        <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-black bg-gray-50">
                <tr>
                  <th className="p-4 font-bold"></th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Contact</th>
                  <th className="p-4 font-bold">Submitted</th>
                  <th className="p-4 font-bold">Questionnaire</th>
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
                        <div className="flex items-center gap-2">
                          {lead.questionnaire_completed ? (
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800">
                              Pending
                            </span>
                          )}
                          {!lead.questionnaire_completed && lead.questionnaire_reminder_sent_at && (
                            <span className="text-xs text-gray-500">
                              (Reminder sent)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4" onClick={() => handleRowClick(lead)}>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 relative">
                        <Button
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

        {/* Lead Detail Modal */}
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={handleUpdateLead}
            onArchive={handleArchiveLead}
          />
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLead}
        />
      )}

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
