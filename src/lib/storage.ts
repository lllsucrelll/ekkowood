import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

type ImageFormat = { extension: string; mime: string; matches: (buf: Buffer) => boolean };

/**
 * Detected from the file's actual bytes, never from the client-supplied
 * filename or Content-Type (both attacker-controlled). SVG is deliberately
 * excluded: it can embed <script>, which would run if the stored file is
 * opened directly.
 */
const IMAGE_FORMATS: ImageFormat[] = [
  {
    extension: ".jpg",
    mime: "image/jpeg",
    matches: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    extension: ".png",
    mime: "image/png",
    matches: (buf) =>
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => buf[i] === b),
  },
  {
    extension: ".gif",
    mime: "image/gif",
    matches: (buf) => [0x47, 0x49, 0x46, 0x38].every((b, i) => buf[i] === b),
  },
  {
    extension: ".webp",
    mime: "image/webp",
    matches: (buf) =>
      [0x52, 0x49, 0x46, 0x46].every((b, i) => buf[i] === b) &&
      [0x57, 0x45, 0x42, 0x50].every((b, i) => buf[i + 8] === b),
  },
];

function detectImageFormat(buffer: Buffer): ImageFormat | null {
  return IMAGE_FORMATS.find((format) => format.matches(buffer)) ?? null;
}

export class UnsupportedImageError extends Error {}
export class ImageTooLargeError extends Error {}

/**
 * Stores an uploaded image and returns its public URL.
 *
 * The file's true format is sniffed from its magic bytes rather than
 * trusted from the browser-supplied `file.type`, which a request can set to
 * anything regardless of the actual bytes.
 *
 * In production (once the user has a Vercel Blob token), uploads go to
 * Vercel Blob. Locally, before that account exists, files are written to
 * `public/uploads` so the whole banner-upload flow can be built and tested
 * without any external service.
 */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageTooLargeError();
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const format = detectImageFormat(buffer);
  if (!format) {
    throw new UnsupportedImageError();
  }

  const filename = `${randomUUID()}${format.extension}`;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`banners/${filename}`, buffer, {
      access: "public",
      token: blobToken,
      contentType: format.mime,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
