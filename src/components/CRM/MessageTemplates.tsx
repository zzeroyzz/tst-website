'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Send } from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  lastUsed?: string;
}

const MessageTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Welcome - New Consultation',
      content:
        "Hi {{name}}! Thanks for scheduling your consultation with Toasted Sesame Therapy. We're looking forward to our session on {{appointment_date}} at {{appointment_time}}.",
      category: 'WELCOME',
      variables: ['name', 'appointment_date', 'appointment_time'],
      usageCount: 25,
      lastUsed: '2 days ago',
    },
    {
      id: '2',
      name: 'Appointment Reminder - 24h',
      content:
        'Hi {{name}}! Just a friendly reminder that your consultation is tomorrow at {{appointment_time}}.',
      category: 'APPOINTMENT_REMINDER',
      variables: ['name', 'appointment_time'],
      usageCount: 42,
      lastUsed: '1 day ago',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WELCOME':
        return 'bg-green-100 text-green-800';
      case 'APPOINTMENT_REMINDER':
        return 'bg-yellow-100 text-yellow-800';
      case 'FOLLOW_UP':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    // TODO: Show success toast
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Message Templates
          </h2>
          <p className="text-gray-600">
            Create and manage reusable message templates
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-tst-purple  text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6 h-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {template.name}
                </h3>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}
                >
                  {template.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopyTemplate(template)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy template"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit template"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">
                {template.content}
              </p>
            </div>

            {/* Variables */}
            {template.variables.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Variables:
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Used {template.usageCount} times</span>
              {template.lastUsed && <span>Last used {template.lastUsed}</span>}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-tst-green hover:bg-green-600 text-black text-sm py-2">
                <Send className="h-3 w-3 mr-1" />
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first message template to get started
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-tst-purple  text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Placeholder */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>

              {/* Form would go here */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Template name"
                  defaultValue={editingTemplate?.name || ''}
                />

                <select className="w-full p-3 border-2 border-black rounded-lg">
                  <option value="">Select category</option>
                  <option value="WELCOME">Welcome</option>
                  <option value="QUESTIONNAIRE">Questionnaire</option>
                  <option value="APPOINTMENT_REMINDER">
                    Appointment Reminder
                  </option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="GENERAL">General</option>
                </select>

                <textarea
                  className="w-full p-3 border-2 border-black rounded-lg h-32 resize-none"
                  placeholder="Message content..."
                  defaultValue={editingTemplate?.content || ''}
                />

                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Available variables:</p>
                  <p>{`{{name}}, {{appointment_date}}, {{appointment_time}}, {{questionnaire_link}}`}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="bg-tst-purple  text-white">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
