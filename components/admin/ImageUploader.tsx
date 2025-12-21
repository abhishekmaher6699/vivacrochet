"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";

type ImageUploaderProps = {
  defaultUrls?: string[]; // changed from single URL
  onChange?: (urls: string[]) => void;
  endpoint: keyof OurFileRouter;
};

export const ImageUploader = ({
  defaultUrls = [],
  onChange,
  endpoint,
}: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(defaultUrls);

  const updateImages = (newImages: string[]) => {
    setImages(newImages);
    onChange?.(newImages);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    updateImages(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <UploadDropzone
        endpoint={endpoint}
        content={{
          label: "Drop or click to upload images",
          allowedContent: "PNG, JPG, JPEG. Up to 5 MB",
        }}
        appearance={{
          container: "rounded-xl border h-58 cursor-pointer",
        }}
        onUploadError={(e) => {
          toast.error("Uploading image failed");
        }}
        onClientUploadComplete={(res) => {
          const urls = res?.map((file) => file.url) || [];
          const updated = [...images, ...urls]; // append new urls
          updateImages(updated);
        }}
      />

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={img}
              className="relative w-full h-20 md:h-32 rounded overflow-hidden border"
            >
              <Image
                src={img}
                fill
                className="object-contain"
                alt={`image-${index}`}
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
