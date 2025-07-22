// src/components/DashboardView.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  subDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, BarChart2, Users, Clock } from 'lucide-react';
import { DashboardViewSkeleton } from '@/components/skeleton';

// Define the type for a reminder
type Reminder = {
  id: number;
  name: string;
  reminder_at: string;
  status: string;
};

// --- Stat Card Component ---
const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-lg border-2 border-black shadow-brutalistSm">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-gray-600">{title}</h3>
      <Icon className="text-gray-400" size={20} />
    </div>
    <div className="flex items-baseline gap-4">
      <p className="text-3xl font-extrabold">{value}</p>
      {change && (
        <div className={`text-sm font-bold px-2 py-1 rounded-md ${color}`}>
          {change}
        </div>
      )}
    </div>
  </div>
);

// --- Calendar Component ---
const ReminderCalendar = ({ reminders }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const remindersByDate = reminders.reduce((acc, reminder) => {
    const date = format(parseISO(reminder.reminder_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reminder);
    return acc;
  }, {});

  const statusColors = {
    New: "bg-blue-200",
    Contacted: "bg-yellow-200",
    "Reminder Sent": "bg-orange-200",
    "Consultation Scheduled": "bg-purple-200",
  };

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-black shadow-brutalistLg">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 rounded-md border-2 border-black bg-white hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map(day => (
          <div key={day} className="font-bold text-sm text-gray-500 py-2">{day}</div>
        ))}
        {days.map(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayReminders = remindersByDate[dayKey] || [];
          return (
            <div
              key={day.toString()}
              className={`p-2 border border-gray-200 rounded-md min-h-[100px] flex flex-col ${
                !isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday(day) ? 'bg-tst-yellow' : 'bg-white'}`}
            >
              <span className="font-bold">{format(day, 'd')}</span>
              <div className="mt-1 space-y-1 overflow-y-auto">
                {dayReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className={`p-1 text-xs font-bold rounded ${statusColors[reminder.status] || 'bg-gray-200'}`}
                    title={reminder.name}
                  >
                    {reminder.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Dashboard View ---
const DashboardView = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        conversionRate: 0,
        avgResponseTime: "N/A", // Default to N/A
    });
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        // --- Fetch Data for Statistics ---
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const { data: allContacts, error: totalError } = await supabase
            .from('contacts')
            .select('status, created_at');

        if (totalError) {
            console.error('Error fetching contacts for stats:', totalError);
        }

        if (allContacts) {
            const totalLeads = allContacts.length;
            const newLeads = allContacts.filter(c => new Date(c.created_at) > new Date(thirtyDaysAgo)).length;
            const convertedLeads = allContacts.filter(c => c.status === 'Converted').length;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            setStats({
                totalLeads,
                newLeads,
                conversionRate: parseFloat(conversionRate.toFixed(1)),
                avgResponseTime: "N/A", // To calculate this, a `contacted_at` timestamp column is needed.
            });
        }

        // --- Fetch Data for Reminders ---
        const { data: reminderData, error: reminderError } = await supabase
            .from('contacts')
            .select('id, name, reminder_at, status')
            .not('reminder_at', 'is', null)
            .order('reminder_at', { ascending: true });

        if (reminderError) {
            console.error('Error fetching reminders:', reminderError);
        } else {
            setReminders(reminderData as Reminder[]);
        }

        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const channel = supabase
          .channel('realtime-dashboard')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        fetchDashboardData();

        return () => {
          supabase.removeChannel(channel);
        };
      }, [supabase, fetchDashboardData]);

    // Show skeleton while loading
    if (loading) {
        return <DashboardViewSkeleton />;
    }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Leads" value={stats.totalLeads} change={null} icon={Users} color="bg-green-100 text-green-800" />
          <StatCard title="New Leads (30d)" value={stats.newLeads} change={null} icon={Users} color="bg-green-100 text-green-800" />
          <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} change={null} icon={BarChart2} color="bg-red-100 text-red-800" />
          <StatCard title="Avg. Response (hr)" value={stats.avgResponseTime} change={null} icon={Clock} color="bg-yellow-100 text-yellow-800" />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4">Reminders</h2>
        <ReminderCalendar reminders={reminders} />
      </div>
    </div>
  );
};

export default DashboardView;
