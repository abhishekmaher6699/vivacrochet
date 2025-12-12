import React, { ReactNode } from "react";
import NavBar from "@/components/admin/NavBar";
import SideBar from "@/components/admin/app-sidebar";

const items = [
  { href: "/admin/products", children: "Manage Products" },
  { href: "/admin/stats", children: "Stats" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40">
        <NavBar />
      </header>

      {/* Fixed sidebar + main content */}
      <div className="pt-16"> {/* push page content below header (header height = 4rem = h-16) */}
        <SideBar items={items} />

        {/* Main content area — leave room for the fixed sidebar (w-64) */}
        <main className="md:ml-64 min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
