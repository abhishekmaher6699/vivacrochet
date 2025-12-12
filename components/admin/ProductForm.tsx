// components/admin/AddProductForm.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploader } from "./ImageUploader";
import { toast } from "sonner";
import { addProduct } from "@/app/actions/productActions";
import { ConfirmDialog } from "../confirmPopup";

export const ProductSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  description: z.string().optional().default(""),
  price: z.coerce.number({ message: "Price is required" }).nonnegative({
    message: "Price is required and must be a non-negative number.",
  }),
  stock: z.coerce
    .number({ message: "Stock is required" })
    .nonnegative()
    .min(1, {
      message: "Stock is required and must be a valid number.",
    }),
  images: z
    .array(z.string())
    .min(1, { message: "At least one product image is required." }),
});

export type ProductValues = z.infer<typeof ProductSchema>;

const ProductForm = ({ error, closeModal }: any) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: undefined as unknown as number,
      stock: undefined as unknown as number,
      images: [],
    },
  });

  const onSubmit = async (data: ProductValues) => {
    await addProduct(data);

    toast.success("Post created successfully");
    router.refresh();
    closeModal(true);
    router.push("/admin/products");
  };

  const cardShadow =
    "8px 8px 0 0 rgba(0,0,0,0.9), -4px -4px 0 0 rgba(255,255,255,0.8), inset 2px 2px 0 rgba(0,0,0,0.06)";

  return (
    <div
      style={{ boxShadow: cardShadow }}
      className=" addForm relative z-10 w-full max-w-xl bg-white rounded-lg px-6 py-6 shadow-lg md:h-[90vh] h-[70vh]  overflow-auto"
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add product</h3>
        <button
          onClick={closeModal}
          className="text-sm text-black px-2 py-1 border-none rounded bg-transparent hover:bg-gray-100"
        >
          Close
        </button>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="addForm"
          noValidate
        >
          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light text-gray-600">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light text-gray-600">
                      Slug
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-light text-gray-600">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Short description(optional)"
                      className="h-14"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light text-gray-600">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 1999 for ₹19.99"
                        // keep UI as string to satisfy input types; cast to string safely
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            field.onChange(undefined); // triggers "required" error instead of "invalid input"
                            return;
                          }
                          // convert to number when possible
                          const parsed = Number(val);
                          field.onChange(
                            Number.isFinite(parsed) ? parsed : (val as any)
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light text-gray-600">
                      Stock
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 1999 for ₹19.99"
                        // keep UI as string to satisfy input types; cast to string safely
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            // keep empty so validation will require it
                            field.onChange("" as any);
                            return;
                          }
                          // convert to number when possible
                          const parsed = Number(val);
                          field.onChange(
                            Number.isFinite(parsed) ? parsed : (val as any)
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-light text-gray-600">
                    Image
                  </FormLabel>
                  <FormControl>
                    <ImageUploader
                      endpoint="imageUploader"
                      defaultUrls={field.value} // now takes array
                      onChange={(urls) => field.onChange(urls)}
                      // optionally: onRemove or support multiple images depending on uploader
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <footer className="mt-4 flex items-center justify-end gap-2">
            <ConfirmDialog
              title="add Product?"
              description="Are you sure you want to add this product?"
              confirmLabel="Yes"
              cancelLabel="Cancel"
              destructive={false}
              onConfirm={form.handleSubmit(onSubmit)}
              trigger={
                <Button
                  type="button" // prevent normal form submit; ConfirmDialog will handle it
                  variant="elevated"
                  className="px-2 rounded-none bg-pink-500 text-white font-medium disabled:opacity-60"
                  disabled={submitting || isPending}
                >
                  {submitting || isPending ? "Adding..." : "Add product"}
                </Button>
              }
            />
          </footer>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
