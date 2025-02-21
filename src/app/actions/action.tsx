"use server";
import { prisma } from "../lib/prismainstaince";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Replace with your cloud name
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // Replace with your API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Replace with your API secret
});

export async function generateSignature(timestamp: number) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const signature = crypto
    .createHash("sha256")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  return signature;
}
export async function uploadImageTODatabase(
  link: string,
  size: number,
  type: string,
  name: string,
  width: number,
  height: number
) {
  let formattedSize: string;
  const bytes = size;
  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) {
    formattedSize = `${mb.toFixed(2)} MB`;
  } else if (kb >= 1) {
    formattedSize = `${kb.toFixed(2)} KB`;
  } else {
    formattedSize = `${bytes} bytes`;
  }

  // Store in the database using Prisma
  await prisma.media.create({
    data: {
      imageUrl: link,
      size,
      sizeFormatted: formattedSize,
      type,
      name,
      width,
      height,
    },
  });
  return {
    message: "image upload successfully in database",
  };
}
export async function acccessImages() {
  const data = await prisma.media.findMany();
  const reverse = data.reverse();

  return {
    reverse,
  };
}

export async function deleteImage(id: string, url: string) {
  const splitLink = url.split("/")[4].split(".")[0];
  const existingMedia = await prisma.media.findUnique({
    where: { id: id },
  });

  if (!existingMedia) {
    console.log("Media not found, cannot delete.");
  } else {
    await prisma.media.delete({
      where: { id: id },
    });
    try {
      const result = await cloudinary.uploader.destroy(splitLink);
      console.log(
        `Image with public ID '${splitLink}' deleted successfully:`,
        result
      );
      return true; // Indicate success
    } catch (error) {
      console.error(`Error deleting image:`, error);
      return false; // Indicate failure
    }
    console.log("Media deleted successfully.");
  }

  return {
    message: "Image successfully deleted from database",
  };
}
