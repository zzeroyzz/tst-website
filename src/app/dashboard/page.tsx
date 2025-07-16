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
  LogOut,
  PlusCircle,
} from "lucide-react";
import Button from "@/components/Button";
import KanbanBoard from "@/components/KanbanBoard";
import LeadsView from "@/components/LeadsView";
import NewsletterView from "@/components/NewsletterView";

const DashboardView = () => (
  <div>
    <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
    <p>Welcome to your dashboard! Statistics and summaries will go here.</p>
  </div>
);
const BlogView = () => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-3xl font-bold">Blog Posts</h2>
      <Button className="bg-tst-purple">
        <PlusCircle className="mr-2 h-4 w-4" /> Create Post
      </Button>
    </div>
    <p>A full CRUD interface for blog posts will be implemented here.</p>
  </div>
);

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("Tasks"); // Default to Tasks view
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
      case "Leads":
        return <LeadsView />;
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
    { name: "Leads", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col">
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
