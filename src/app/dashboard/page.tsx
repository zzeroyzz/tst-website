/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Newspaper,
  Users,
  Calendar,
  LogOut,
  BookHeart,
} from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard/KanbanBoard";
import LeadsView from "@/components/Leads/LeadsView";
import NewsletterView from "@/components/Newsletter/NewsletterView";
import DashboardView from "@/components/DashboardView/DashboardView";
import AppointmentsDashboard from "@/components/AppointmentsDashboard/AppointmentsDashboard";
import BlogView from "@/components/Blog/BlogView";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("Dashboard"); // Default to Dashboard view
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const renderView = () => {
    switch (activeView) {
      case "Tasks":
        return <KanbanBoard />;
      case "Newsletter":
        return <NewsletterView />;
      case "Blogs":
        return <BlogView />;
      case "Leads":
        return <LeadsView />;
      case "Appointments":
        return <AppointmentsDashboard />;
      case "Dashboard":
      default:
        return <DashboardView />;
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Tasks", icon: CheckSquare },
    { name: "Newsletter", icon: Newspaper },
    { name: "Blogs", icon: BookHeart },
    { name: "Leads", icon: Users },
    { name: "Appointments", icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-gray-50 border-2 border-black">
      <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col ">
        <div className="font-bold text-2xl mb-10">Admin Panel</div>
        <nav className="flex-grow">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView(item.name);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeView === item.name
                      ? "bg-tst-purple text-black"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            <span className="text-red-500">Logout</span>
          </a>
        </div>
      </aside>
      <main className="flex-1 p-10 overflow-y-auto">{renderView()}</main>
    </div>
  );
};

export default DashboardPage;
