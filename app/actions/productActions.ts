"use server"

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ProductSchema, ProductValues } from "@/components/admin/ProductForm";
import { requireAuth } from "@/lib/auth-utils";
import { OrderStatus } from "@/lib/generated/prisma/enums";

export const addProduct = async (data: ProductValues) => {
    try {
        const res = await prisma.product.create({
            data: {...data}
        })
        console.log("Post created succesfully")

        return res
    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong")
    }
}

export const updateProduct = async (id: string, data: ProductValues) => {
  try {
    const res = await prisma.product.update({
      where: { id },
      data: { ...data },
    });

    console.log("Product updated successfully");
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update product");
  }
};

export async function deleteProduct(id: string) {
  try {
    const referencingCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (referencingCount > 0) {
      return {
        ok: false,
        reason: "IN_USE",
        message: `Cannot delete product because it is used in ${referencingCount} past order(s).`,
      };
    }

    await prisma.product.delete({ where: { id } });

    return { ok: true };
  } catch (err) {
    console.error("Delete failed:", err);

    return {
      ok: false,
      reason: "ERROR",
      message: "Something went wrong while deleting the product.",
    };
  }
}


export async function addToCart(productId: string) {
  const session = await requireAuth()
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error("Product not found");

  let cart = await prisma.order.findFirst({
    where: { userId, status: OrderStatus.PENDING },
  });

  if (!cart) {
    cart = await prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalAmount: 0,
      },
    });
    console.log("Cart Created")
  }

  const item = await prisma.orderItem.findFirst({
    where: {
      orderId: cart.id,
      productId,
    },
  });

  if (item) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: item.quantity + 1 },
    });
    console.log("Item updated")
  } else {
    await prisma.orderItem.create({
      data: {
        orderId: cart.id,
        productId,
        quantity: 1,
        unitPrice: product.price,
      },
    });
    console.log("Item created")
  }


  await prisma.order.update({
    where: { id: cart.id },
    data: {
      totalAmount: { increment: product.price },
    },
  });
}

export async function removeFromCart(productId: string) {
  const session = await requireAuth()
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  const cart = await prisma.order.findFirst({
    where: { userId: session.user.id, status: OrderStatus.PENDING },
  });
  if (!cart) return;

  const item = await prisma.orderItem.findFirst({
    where: { orderId: cart.id, productId },
  });
  if (!item) return;

  if (item.quantity > 1) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: item.quantity - 1 },
    });
  } else {
    await prisma.orderItem.delete({
      where: { id: item.id },
    });
  }

  await prisma.order.update({
    where: { id: cart.id },
    data: { totalAmount: { decrement: item.unitPrice } },
  });
}
