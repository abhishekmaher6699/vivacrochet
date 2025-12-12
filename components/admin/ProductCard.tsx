"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { deleteProduct } from "@/app/actions/productActions";
import { Button } from "../ui/button";
import { ProductValues } from "./ProductForm";
import { ConfirmDialog } from "../confirmPopup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Dynamically load the edit form only when needed (reduces initial bundle size)
const EditForm = dynamic(() => import("./EditproductForm"), { ssr: false });

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;
const FALLBACK_IMG = "https://images.pexels.com/photos/19090/pexels-photo.jpg";
const CARD_SHADOW =
  "4px 4px 0 0 rgba(0,0,0,0.9), -4px -4px 0 0 rgba(255,255,255,0.8), inset 2px 2px 0 rgba(0,0,0,0.06)";
const IMG_SHADOW =
  "4px 4px 0 0 rgba(0,0,0,0.9), inset 2px 2px 0 rgba(255,255,255,0.6)";
const ITEM_CLASS =
  "relative bg-[#fbfbfb] border-4 border-black rounded-none p-4 flex flex-col";


export default function ProductCard({
  products,
}: {
  products: ProductValues[];
}) {
  const router = useRouter()
  
  // Only store selected product id to keep state light
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Find selected product when needed
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  // Manage body scroll when modal opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return;
  }, [isModalOpen]);

  const openModal = useCallback((id: string) => {
    setError(null);
    setSelectedId(id);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedId(null);
  }, []);

  const handleDelete = useCallback(async (id?: string) => {
    if (!id) return;

    setDeletingId(id);

    const res = await deleteProduct(id);

    setDeletingId(null);

    if (!res.ok) {
      toast.error(res.message ?? "Unable to delete product");
      return;
    }

    toast.success("Product deleted successfully!");
    router.refresh()
    
  }, []);

  const renderedItems = useMemo(
    () =>
      products.map((product) => (
        <AdminProductItem
          key={product.id}
          product={product}
          onEdit={() => openModal(product.id)}
          onDelete={() => handleDelete(product.id)}
          deleting={deletingId === product.id}
        />
      )),
    [products, openModal, handleDelete, deletingId]
  );

  return (
    <div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {renderedItems}
      </div>

      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <EditForm product={selectedProduct} closeModal={closeModal} />
        </div>
      )}

      {error ? (
        <div className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

const AdminProductItem = React.memo(function AdminProductItem({
  product,
  onEdit,
  onDelete,
  deleting,
}: {
  product: ProductValues;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const img =
    product.images && product.images.length > 0
      ? product.images[0]
      : FALLBACK_IMG;

  const stockColorClass =
    product.stock > 10
      ? "text-green-700"
      : product.stock > 0
      ? "text-amber-700"
      : "text-red-700";

  return (
    <article
      className={ITEM_CLASS}
      style={{ boxShadow: CARD_SHADOW }}
      aria-labelledby={`product-${product.id}-title`}
    >
      <div
        className="rounded-none overflow-hidden mb-2 shrink-0"
        style={{ boxShadow: IMG_SHADOW }}
      >
        <img
          src={img}
          alt={product.title}
          className="w-full md:h-50 object-cover block"
          loading="lazy"
        />
      </div>

      <div className="flex-1">
        <h2
          id={`product-${product.id}-title`}
          className="text-lg font-bold tracking-tight mb-1"
        >
          {product.title}
        </h2>

        {product.description ? (
          <p className="text-sm text-gray-700 mb-2 md:mb-3 line-clamp-3">
            {product.description}
          </p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-lg font-semibold">{rupee(product.price)}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Stock</div>
            <div className={`text-sm font-medium ${stockColorClass}`}>
              {product.stock} {product.stock === 1 ? "unit" : "units"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            onClick={onEdit}
            className="flex-1 py-2 px-3 rounded-none text-sm font-semibold border-2 border-black bg-pink-400 hover:translate-x-0.2 hover:-translate-y-0.2 active:translate-y-0 transition-transform"
            style={{ boxShadow: "2px 2px 0 0 rgba(0,0,0,0.9)" }}
            aria-label={`Edit ${product.title}`}
          >
            Edit
          </Button>

          <ConfirmDialog
            title="Delete?"
            description="The product will be deleted."
            confirmLabel="Delete"
            destructive
            onConfirm={onDelete}
            trigger={
              <Button
                className="flex-1 py-2 px-3 rounded-none text-sm font-semibold border-2 border-black bg-pink-400 hover:translate-x-0.2 hover:-translate-y-0.2 active:translate-y-0 transition-transform"
                style={{ boxShadow: "2px 2px 0 0 rgba(0,0,0,0.9)" }}
                aria-label={`Delete ${product.title}`}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            }
          />
        </div>
      </div>
    </article>
  );
});
AdminProductItem.displayName = "AdminProductItem";

