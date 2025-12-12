"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";


export default function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setError(null);
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  return (
    <>
      <Button variant={"elevated"} 
              onClick={openModal} 
              // size="sm"
              className="bg-black rounded-none h-10 w-28 text-sm md:h-10 md:w-30 text-white hover:bg-pink-400">
        Add product
      </Button>

      {open && (
        <div className="addForm fixed inset-0 z-50 flex items-center justify-center p-4">

          <ProductForm error={error} closeModal={closeModal} />
          
        </div>
      )}
    </>
  );
}
