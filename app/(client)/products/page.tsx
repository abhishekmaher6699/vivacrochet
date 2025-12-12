// app/products/page.tsx
import * as z from "zod";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import AddProductForm from "@/components/admin/AddProductForm";
import { getProductsList } from "@/lib/products";
import { requireAuth } from "@/lib/auth-utils";
import { LoadingScreen } from "@/components/LoadingScreen"

const UserProductCard = dynamic(() => import("@/components/user/ProductCard"), { suspense: true });

export default async function ProductsPage() {
  await requireAuth();
  const products = await getProductsList();

  return (
    <div className="md:p-6 p-2">
      <div className="flex mb-6 justify-between items-center">
        <h1 className="text-xl md:text-2xl font-extrabold">Products</h1>
      </div>

      <Suspense fallback={<LoadingScreen />}>
        <UserProductCard products={products} />
      </Suspense>
    </div>
  );
}
