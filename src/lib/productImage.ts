import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convex";

const MAX_EDGE = 720;
const JPEG_QUALITY = 0.82;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image"));
    };
    image.src = url;
  });
}

export async function compressProductImage(file: File): Promise<Blob> {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to process image");
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((next) => resolve(next), "image/jpeg", JPEG_QUALITY);
  });
  if (!blob) throw new Error("Unable to process image");
  return blob;
}

export async function uploadProductImage(file: File): Promise<string> {
  const blob = await compressProductImage(file);
  const uploadUrl = await convex.mutation(api.products.generateUploadUrl, {});
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/jpeg" },
    body: blob,
  });
  if (!result.ok) throw new Error("Unable to upload image");
  const payload = (await result.json()) as { storageId?: string };
  if (!payload.storageId) throw new Error("Unable to upload image");
  return payload.storageId;
}
