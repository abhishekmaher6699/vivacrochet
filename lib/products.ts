import prisma from "./db";

export const getProductsList = async () => {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
  });
  return products
}
