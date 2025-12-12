"use client"

import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default function Home() {

  redirect("/products")
  return (
    <div>
    </div>
  );
}
