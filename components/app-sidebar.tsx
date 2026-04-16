"use client";

import {
  Bot,
  Building,
  Bell,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
// This is sample data.


// Base navigation items that are always shown
const baseNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Bot,
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
];

// Properties tab - only for landlords and agents
const propertiesNavItem = {
  title: "My Properties",
  url: "/properties",
  icon: Building,
  isActive: true,
  items: [
    {
      title: "History",
      url: "#",
    },
    {
      title: "Starred",
      url: "#",
    },
    {
      title: "Settings",
      url: "#",
    },
  ],
};

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & {
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "landlord" | "agent";
  } | null;
}) {
  // Build navigation items based on user role
  const navItems = useMemo(() => {
    const items = [...baseNavItems];
    
    // Only add "My Properties" tab for landlords and agents
    if (user && (user.role === "landlord" || user.role === "agent")) {
      items.push(propertiesNavItem);
    }
    
    return items;
  }, [user?.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <Image
                  src="/logo-light.png"
                  alt="logo"
                  width={80}
                  height={25}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
