import { generateSignature } from "./action";

export async function uploadImage(categoryForm: FormData) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = await generateSignature(timestamp);

  const formData = new FormData();
  const thumbnail = categoryForm.get("thumbnail");
  if (thumbnail) {
    formData.append("file", thumbnail as Blob);
  }

  if (apiKey && timestamp) {
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
  }
  formData.append("signature", signature);
  console.log(formData);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (response.ok) {
    const url = data.secure_url.split("/")[7];
    const link = `http://localhost:3000/images/${url}`;
    return link;
  } else {
    console.log("error=>", data.error.message);
    return data.error.message;
  }
}
