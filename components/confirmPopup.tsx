"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export const ConfirmDialogSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  confirmLabel: z.string().min(1).optional(),
  cancelLabel: z.string().min(1).optional(),
  destructive: z.boolean().optional(),
});

export type ConfirmDialogOptions = z.infer<typeof ConfirmDialogSchema>;

type ConfirmDialogProps = ConfirmDialogOptions & {
  trigger: React.ReactNode;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  // ✅ runtime validation (safeParse)
  const parsed = ConfirmDialogSchema.safeParse(props);

  if (!parsed.success) {
    console.error("Invalid ConfirmDialog props", parsed.error);
    return null;
  }

  const {
    trigger,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !loading && setOpen(o)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-pink-400 hover:bg-black hover:text-white text-white hover:-translate-y-1 transition-all hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant={"elevated"}
              className="bg-pink-400"
            >
              {loading ? "Please wait…" : confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
