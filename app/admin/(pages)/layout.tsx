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
      <header className="fixed top-0 left-0 right-0 h-16 z-40">
        <NavBar />
      </header>

      <div className="pt-16"> 
        <SideBar items={items} />

        <main className="md:ml-64 min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
