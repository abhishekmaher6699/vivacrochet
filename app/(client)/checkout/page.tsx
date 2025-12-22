import dynamic from "next/dynamic";
import { Suspense } from "react";
import { getProductsList } from "@/lib/products";
import { LoadingScreen } from "@/components/LoadingScreen"

const CheckoutClient = dynamic(() => import("@/components/user/CheckoutClient"));

export default async function CheckoutPage() {
  const products = await getProductsList();

  return (
    <div className="md:p-6 p-2">
      <Suspense fallback={<LoadingScreen />}>
        <CheckoutClient products={products} />
      </Suspense>
    </div>
  );
}
