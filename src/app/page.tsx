"use client";
import Image from "next/image";
import React, { useState } from "react";
import { uploadImage } from "./actions/uploadaction";

function Page() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const link = await uploadImage(formData);
        console.log("TCL: Page -> link", link);

        setLoading(false);
        setImage(link);
        setPreview(null); // Remove preview after upload
      }}
      className="space-y-4 p-4 bg-white w-72 mx-auto rounded-lg shadow-md"
    >
      <div>
        <label
          htmlFor="image"
          className="flex flex-col items-center justify-center min-h-32 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          {preview ? (
            <Image
              src={preview}
              height={60}
              width={200}
              alt="Preview"
              className="mt-2 w-full rounded-lg border border-gray-300 min-h-32"
            />
          ) : image ? (
            <Image
              src={image}
              height={60}
              width={200}
              alt="Uploaded"
              className="mt-2 w-full rounded-lg border border-gray-300 min-h-32"
            />
          ) : (
            <span className="text-sm text-gray-600">
              Click to select an image
            </span>
          )}
          <input
            type="file"
            id="image"
            name="thumbnail"
            className="hidden"
            onChange={handleImageChange}
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default Page;
