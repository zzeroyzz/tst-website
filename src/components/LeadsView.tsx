// src/components/LeadsView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, differenceInDays } from "date-fns";
import { X } from "lucide-react";

// --- Lead Detail Modal Component ---
const LeadDetailModal = ({ lead, onClose, onUpdate }) => {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");

  const statusOptions = ["New", "Contacted", "Consultation Scheduled", "Converted", "Not a Fit"];
  const statusColors = {
    New: "bg-blue-100 text-blue-800",
    Contacted: "bg-yellow-100 text-yellow-800",
    "Consultation Scheduled": "bg-purple-100 text-purple-800",
    Converted: "bg-green-100 text-green-800",
    "Not a Fit": "bg-gray-100 text-gray-800",
  };

  const handleSave = () => {
    onUpdate(lead.id, { status, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
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
                        className={`w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-tst-purple ${statusColors[status]}`}
                    >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className="font-bold block mb-1">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="10"
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
                    <p className="text-sm text-gray-500 mb-2">Reminder functionality coming soon!</p>
                    <input type="datetime-local" disabled className="w-full p-2 border-2 border-gray-300 rounded-md bg-gray-200 cursor-not-allowed" />
                    <textarea rows="2" disabled className="mt-2 w-full p-2 border-2 border-gray-300 rounded-md bg-gray-200 cursor-not-allowed" placeholder="Reminder note..."></textarea>
                 </div>
            </div>
        </div>

        <div className="flex justify-end mt-6">
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-tst-purple text-black font-bold rounded-md hover:opacity-90"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Leads View Component ---
const LeadsView = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const statusColors = {
    New: "bg-blue-100 text-blue-800",
    Contacted: "bg-yellow-100 text-yellow-800",
    "Consultation Scheduled": "bg-purple-100 text-purple-800",
    Converted: "bg-green-100 text-green-800",
    "Not a Fit": "bg-gray-100 text-gray-800",
  };

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
        (payload) => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLeads]);

  const handleUpdateLead = async (leadId, updatedData) => {
    // Optimistic UI Update
    setLeads(leads.map(lead => lead.id === leadId ? {...lead, ...updatedData} : lead));

    // Update DB in background
    await supabase.from("contacts").update(updatedData).eq("id", leadId);
  };

  if (loading) return <p>Loading leads...</p>;

  return (
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
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const daysOld = differenceInDays(new Date(), new Date(lead.created_at));
                const isWarm = daysOld <= 7;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-gray-200 hover:bg-tst-yellow cursor-pointer"
                  >
                    <td className="p-4">
                      <div className={`w-3 h-3 rounded-full ${isWarm ? 'bg-red-500' : 'bg-gray-400'}`} title={isWarm ? 'Warm Lead' : 'Cold Lead'}></div>
                    </td>
                    <td className="p-4 font-medium">{lead.name}</td>
                    <td className="p-4">
                        <div>{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="p-4">{format(new Date(lead.created_at), "PPP")}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[lead.status] || 'bg-gray-100'}`}>
                        {lead.status}
                      </span>
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
  );
};

export default LeadsView;
