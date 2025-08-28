'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  contactStatus: string;
  segments: string[];
  createdAt: string;
  lastMessageAt?: string;
  messageCount: number;
  appointmentStatus?: string;
  scheduledAppointmentAt?: string;
  messagesSent: number;
  messagesReceived: number;
  lastMessage?: {
    content: string;
    direction: string;
    createdAt: string;
  };
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ContactsManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Fetch real contacts from database
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          email,
          phone_number,
          contact_status,
          segments,
          created_at,
          last_message_at,
          message_count,
          appointment_status,
          scheduled_appointment_at,
          archived
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
        return;
      }

      // Transform data to match interface
      const transformedContacts: Contact[] = data.map((contact: any) => ({
        id: contact.id.toString(),
        name: contact.name || 'Unknown',
        email: contact.email || '',
        phoneNumber: contact.phone_number || '',
        contactStatus: contact.contact_status || 'ACTIVE',
        segments: contact.segments || [],
        createdAt: contact.created_at,
        lastMessageAt: contact.last_message_at,
        messageCount: contact.message_count || 0,
        appointmentStatus: contact.appointment_status,
        scheduledAppointmentAt: contact.scheduled_appointment_at,
        messagesSent: 0, // TODO: Calculate from crm_messages
        messagesReceived: 0, // TODO: Calculate from crm_messages
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      toast.success('Contact deleted successfully (demo)');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
    setShowDropdown(null);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
    setShowDropdown(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PROSPECT':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      !searchTerm ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus || contact.contactStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-2 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="border-2 border-black rounded-lg px-3 py-2 bg-white min-w-0"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROSPECT">Prospect</option>
            <option value="CLIENT">Client</option>
          </select>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-tst-purple text-white border-2 border-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutalistSm">
          <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredContacts.length}
          </p>
        </div>
        <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutalistSm">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600">
            {filteredContacts.filter(c => c.contactStatus === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutalistSm">
          <h3 className="text-sm font-medium text-gray-500">Prospects</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filteredContacts.filter(c => c.contactStatus === 'PROSPECT').length}
          </p>
        </div>
        <div className="bg-white border-2 border-black rounded-lg p-4 shadow-brutalistSm">
          <h3 className="text-sm font-medium text-gray-500">With Messages</h3>
          <p className="text-2xl font-bold text-purple-600">
            {filteredContacts.filter(c => c.messageCount > 0).length}
          </p>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-brutalistLg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                        {contact.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {contact.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        contact.contactStatus
                      )}`}
                    >
                      {contact.contactStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {contact.messageCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.appointmentStatus && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {contact.appointmentStatus}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contact.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowDropdown(
                            showDropdown === contact.id ? null : contact.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 p-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showDropdown === contact.id && (
                        <div className="absolute right-0 top-8 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewContact(contact)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Contact
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Contact
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No contacts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first contact.'}
            </p>
            {!searchTerm && !selectedStatus && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-tst-purple text-white border-2 border-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal placeholders - these would normally show actual modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <h3 className="text-lg font-bold mb-4">Create Contact (Demo)</h3>
            <p className="text-gray-600">
              GraphQL integration needed for full functionality
            </p>
            <Button
              onClick={() => setShowCreateModal(false)}
              className="bg-gray-200 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showEditModal && selectedContact && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <h3 className="text-lg font-bold mb-4">
              Edit Contact: {selectedContact.name}
            </h3>
            <p className="text-gray-600">
              GraphQL integration needed for full functionality
            </p>
            <Button
              onClick={() => {
                setShowEditModal(false);
                setSelectedContact(null);
              }}
              className="bg-gray-200 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg border-2 border-black max-w-md">
            <h3 className="text-lg font-bold mb-4">Contact Details</h3>
            <div className="space-y-2 mb-4">
              <p>
                <strong>Name:</strong> {selectedContact.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedContact.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedContact.phoneNumber || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedContact.contactStatus}
              </p>
              <p>
                <strong>Messages:</strong> {selectedContact.messagesSent} sent,{' '}
                {selectedContact.messagesReceived} received
              </p>
            </div>
            <Button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedContact(null);
              }}
              className="bg-gray-200 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsManager;