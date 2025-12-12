import prisma from "@/lib/db";

export const getCartLines = async (
  items: { productId: string; quantity: number }[]
) => {
  if (!items.length) return [];

  const ids = items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
  });

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images,
        },
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  return lines;
};
