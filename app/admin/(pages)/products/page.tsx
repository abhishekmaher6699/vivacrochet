import ProductCard from "@/components/admin/ProductCard";
import AddProductForm from "@/components/admin/AddProductForm";
import { getProductsList } from "@/lib/products";
import { requireAdminAuth } from "@/lib/auth-utils";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

export default async function ProductsPage() {
  await requireAdminAuth();
  const products = await getProductsList();

  return (
    <div className="md:p-6 p-2">
      <div className="flex mb-6 justify-between items-center">
        <h1 className="text-xl md:text-2xl font-extrabold">Products</h1>
        <AddProductForm />
      </div>

      <Suspense fallback={<LoadingScreen />}>
        <ProductCard products={products} />
      </Suspense>
    </div>
  );
}
