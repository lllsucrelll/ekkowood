import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Stores an uploaded image and returns its public URL.
 *
 * In production (once the user has a Vercel Blob token), uploads go to
 * Vercel Blob. Locally, before that account exists, files are written to
 * `public/uploads` so the whole banner-upload flow can be built and tested
 * without any external service.
 */
export async function uploadImage(file: File): Promise<string> {
  const extension = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${extension}`;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`banners/${filename}`, file, {
      access: "public",
      token: blobToken,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
