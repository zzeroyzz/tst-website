/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LeadsView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, differenceInDays } from "date-fns";
import { Plus } from "lucide-react";
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
            ×
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
  const [archivedLeads, setArchivedLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClientComponentClient();

  const fetchLeads = useCallback(async () => {
    // Fetch active leads
    const { data: activeData, error: activeError } = await supabase
      .from("contacts")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    // Fetch archived leads
    const { data: archivedData, error: archivedError } = await supabase
      .from("contacts")
      .select("*")
      .eq("archived", true)
      .order("created_at", { ascending: false });

    if (activeError) {
      console.error("Error fetching active leads:", activeError);
    } else {
      setLeads(activeData);
    }

    if (archivedError) {
      console.error("Error fetching archived leads:", archivedError);
    } else {
      setArchivedLeads(archivedData);
    }

    setLoading(false);
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
    const originalArchivedLeads = [...archivedLeads];

    // Update in the appropriate list
    const newLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, ...updatedData } : lead
    );
    const newArchivedLeads = archivedLeads.map(lead =>
      lead.id === leadId ? { ...lead, ...updatedData } : lead
    );

    setLeads(newLeads);
    setArchivedLeads(newArchivedLeads);

    const { error } = await supabase.from("contacts").update(updatedData).eq("id", leadId);

    if (error) {
        toast.error(`Failed to update lead: ${error.message}`);
        // Revert on failure
        setLeads(originalLeads);
        setArchivedLeads(originalArchivedLeads);
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

      // Move lead from active to archived
      const leadToArchive = leads.find(l => l.id === leadId);
      if (leadToArchive) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        setArchivedLeads(prev => [{ ...leadToArchive, archived: true }, ...prev]);
      }

      toast.success('Lead archived successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to archive lead: ${error.message}`);
      return false;
    }
  };

  const handleUnarchiveLead = async (leadId: number) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ archived: false })
        .eq("id", leadId);

      if (error) {
        throw error;
      }

      // Move lead from archived to active
      const leadToUnarchive = archivedLeads.find(l => l.id === leadId);
      if (leadToUnarchive) {
        setArchivedLeads(prev => prev.filter(l => l.id !== leadId));
        setLeads(prev => [{ ...leadToUnarchive, archived: false }, ...prev]);
      }

      toast.success('Lead unarchived successfully!');
      return true;
    } catch (error: any) {
      toast.error(`Failed to unarchive lead: ${error.message}`);
      return false;
    }
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  // Get the current leads to display based on active tab
  const currentLeads = activeTab === 'active' ? leads : archivedLeads;

  // Show skeleton while loading
  if (loading) {
    return <LeadsViewSkeleton rowCount={5} />;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">Leads</h2>

            {/* Tab Navigation */}
            <div className="flex border-2 border-black rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 font-bold transition-colors ${
                  activeTab === 'active'
                    ? 'bg-tst-purple text-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Active ({leads.length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-2 font-bold transition-colors border-l-2 border-black ${
                  activeTab === 'archived'
                    ? 'bg-tst-purple text-black'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Archived ({archivedLeads.length})
              </button>
            </div>
          </div>

          {/* Only show Add Lead button on active tab */}
          {activeTab === 'active' && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-tst-purple text-black flex items-center gap-2"
            >
              <Plus size={20} />
              Add Lead
            </Button>
          )}
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
                </tr>
              </thead>
              <tbody>
                {currentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {activeTab === 'active' ? 'No active leads found' : 'No archived leads found'}
                    </td>
                  </tr>
                ) : (
                  currentLeads.map((lead) => {
                    const daysOld = differenceInDays(new Date(), new Date(lead.created_at));
                    // FIX: A lead is only "warm" if it's recent AND requires action.
                    const isActionableStatus = !['Consultation Scheduled', 'Converted', 'Not a Fit'].includes(lead.status);
                    const isWarm = daysOld <= 7 && isActionableStatus && activeTab === 'active';

                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-gray-200 hover:bg-tst-yellow cursor-pointer group"
                        onClick={() => handleRowClick(lead)}
                      >
                        <td className="p-4">
                          <div className={`w-3 h-3 rounded-full ${isWarm ? 'bg-red-500' : 'bg-gray-400'}`} title={isWarm ? 'Warm Lead' : 'Cold Lead'}></div>
                        </td>
                        <td className="p-4 font-medium">
                          {lead.name}
                          {activeTab === 'archived' && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                            <div>{lead.email}</div>
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                        </td>
                        <td className="p-4">
                          {format(new Date(lead.created_at), "PPP")}
                        </td>
                        <td className="p-4">
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
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
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
            onArchive={selectedLead.archived ? undefined : handleArchiveLead}
            onUnarchive={selectedLead.archived ? handleUnarchiveLead : undefined}
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
    </>
  );
};

export default LeadsView;
