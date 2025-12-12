import React, { ReactNode } from "react";
import NavBar from "@/components/user/Navbar";
import SideBar from "@/components/user/Sidebar";

export const items = [
  { href: "/products", children: "Products" },
  { href: "/checkout", children: "Checkout" },
  { href: "/history", children: "Your Orders" },
];

const UserLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
 <header className="fixed top-0 left-0 right-0 h-16 z-40">
        <NavBar />
      </header>

      <div className="pt-16"> {/* push page content below header (header height = 4rem = h-16) */}
        <SideBar items={items} />

        <main className="md:ml-64 min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </>
  );
};

export default UserLayout;
