"use server";
import crypto from "crypto";
export async function generateSignature(timestamp: number) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const signature = crypto
    .createHash("sha256")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  return signature;
}
