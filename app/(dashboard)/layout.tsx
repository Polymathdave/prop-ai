import { AppSidebar } from "@/components/app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // // Check if user is authenticated
  // if (!session?.user) {
  //   redirect("/login?redirect=/dashboard");
  // }

  // Fetch full user data from database to get role

  
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id as string || ""))
    .limit(1);




  return (
    <SidebarProvider>
      <AppSidebar variant="inset" user={dbUser}/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 h-full md:gap-6 md:py-6">
             {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
