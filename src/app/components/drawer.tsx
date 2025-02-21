"use client";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { acccessImages, deleteImage } from "../actions/action";
import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "../actions/uploadaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
type Image = {
  url: string;
  id: string;
};
type ImageDetails = {
  id: string;
  type: string;
  name: string;
  imageUrl: string | null;
  height?: number;
  width?: number;
  size: number;
  sizeFormatted: string;
};

export function Drawers() {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(50);
  const [details, setDetails] = useState<ImageDetails | null>(null);
  const [chooseImage, setChooseImage] = useState<Image | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [defaultTab, setDefaultTab] = useState("Upload");
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const bytes = file.size;
      const kb = bytes / 1024;
      const mb = kb / 1024;

      if (mb >= 1) {
        setFileSize(`${mb.toFixed(2)} MB`);
      } else if (kb >= 1) {
        setFileSize(`${kb.toFixed(2)} KB`);
      } else {
        setFileSize(`${bytes} bytes`);
      }
      setDetails({
        id: "",
        type: file.type,
        name: file.name,
        imageUrl: preview,
        size: file.size,
        sizeFormatted: fileSize || "",
      });
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["links"],
    queryFn: acccessImages,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (e) => {
      console.log("TCL: e", e);
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const result = await deleteImage(id, url);
      return typeof result === "boolean" ? { message: "Deleted" } : result;
    },
    onSuccess: (e: { message: string }) => {
      if (e.message) {
        toast({
          title: "Image deleted",
          description: "Image deleted succussfully",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate(formData, {
      onSuccess: () => {
        setProgress(100);
        setPreview(null);
        setDetails(null);
        setDefaultTab("Uploaded");
        (e.target as HTMLFormElement).reset();
      },
    });
  }

  return (
    <>
      <Drawer>
        <DrawerTrigger>
          <div className="flex justify-end w-full p-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
            </svg>
          </div>
        </DrawerTrigger>
        <div className="w-full flex justify-center">
          {preview && (
            <Image
              src={preview}
              height={500}
              width={500}
              className="w-1/2 h-1/2 border-2"
              alt={`Image`}
            />
          )}
        </div>
        <DrawerContent className="pb-10">
          <SheetHeader className="p-5">
            <SheetTitle>Select Image</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when done.
            </SheetDescription>
          </SheetHeader>
          <div className="w-full justify-center flex  gap-5">
            <Tabs
              value={defaultTab}
              className="w-[60%] "
              onValueChange={setDefaultTab}
            >
              <TabsList className="w-full flex justify-around">
                <TabsTrigger value="Uploaded">Uploaded</TabsTrigger>
                <TabsTrigger value="Upload">Upload</TabsTrigger>
              </TabsList>
              {mutation.isPending ? (
                <div className="bg-indigo-600 h-2 rounded-md overflow-hidden">
                  {" "}
                  {/* Overflow hidden here */}
                  <div
                    className={`bg-indigo-600 h-full rounded-md transition-all duration-500 ease-in-out`} // Animation classes
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              ) : null}
              <TabsContent value="Uploaded">
                <div>
                  <div className="overflow-y-scroll h-[450px] relative">
                    {isLoading ? (
                      "Loading...."
                    ) : (
                      <div className="flex w-full  flex-wrap justify-start flex-row items-center gap-5 ">
                        {data?.reverse.map((image, index) => {
                          console.log("TCL: image", image);
                          const pick =
                            chooseImage && image.id === chooseImage.id ? 2 : 1;
                          const isLast = index == 0;

                          return (
                            <div key={index} className="relative p-3">
                              <Image
                                className={`relative hover:scale-105 transition-transform duration-[3000ms]  w-[175px] h-[130px]  ${
                                  isLast
                                    ? "scale-100 transition-transform duration-[3000ms] ease-in-out animate-pulse hover:scale-105"
                                    : ""
                                }`}
                                src={image.imageUrl || ""}
                                height={110}
                                onClick={() => {
                                  if (chooseImage?.url) {
                                    setPreview(chooseImage?.url || null);
                                  }
                                  setChooseImage({
                                    id: image.id,
                                    url: image.imageUrl as string,
                                  });
                                  setDetails(image);
                                  setFileSize(image.sizeFormatted);
                                }}
                                width={110}
                                alt={`Image ${index + 1}`}
                                style={{
                                  marginTop: 20,
                                  borderWidth: pick,
                                  borderColor:
                                    chooseImage && image.id === chooseImage.id
                                      ? "black"
                                      : isLast
                                      ? "red"
                                      : "transparent",
                                  scale: 1,
                                  borderRadius: 10,
                                }}
                              />
                              <div className="absolute right-3 top-8  rounded-tr-xl rounded-bl-lg ">
                                <Menubar>
                                  <MenubarMenu>
                                    <MenubarTrigger>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="red"
                                        className="size-6"
                                      >
                                        <path d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                      </svg>
                                    </MenubarTrigger>
                                    <MenubarContent>
                                      <MenubarItem
                                        onClick={() => {
                                          if (image.imageUrl) {
                                            deleteMutation.mutate({
                                              id: image.id,
                                              url: image.imageUrl,
                                            });
                                          }
                                        }}
                                      >
                                        delete
                                        <MenubarShortcut>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                            className="size-4"
                                          >
                                            <path d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" />
                                          </svg>
                                        </MenubarShortcut>
                                      </MenubarItem>

                                      <MenubarSeparator />
                                    </MenubarContent>
                                  </MenubarMenu>
                                </Menubar>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <SheetClose asChild>
                    <div className="flex justify-center w-full">
                      <button className="w-[15.2rem] mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 active:scale-95 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Select
                      </button>
                    </div>
                  </SheetClose>
                </div>
              </TabsContent>
              <TabsContent value="Upload">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4  bg-white w-full  rounded-lg "
                >
                  <div>
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center min-h-[434px]  border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="text-sm text-gray-600 ">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="size-20"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                          />
                        </svg>
                      </span>

                      <input
                        type="file"
                        id="image"
                        name="thumbnail"
                        className="hidden"
                        onChange={handleImageChange}
                        required
                      />
                      <p>Click here</p>
                    </label>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-[15.2rem] mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 active:scale-95 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {mutation.isPending ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* <DrawerClose>
              <Button
                variant="outline"
                className="w-[15.2rem] mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 active:scale-95 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Button>
            </DrawerClose> */}
            <div className="w-[25%]  h-[300px]">
              <div className=" bg-gray-100 rounded-2xl h-[300px] flex justify-center items-center">
                {preview ? (
                  <Image
                    src={preview}
                    height={500}
                    width={500}
                    className="w-full h-full border-2 rounded-2xl"
                    alt={`Image`}
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="gray"
                    className="size-10"
                  >
                    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </div>
              {details && (
                <div className="font-bold text-lg p-4">
                  <h1>Filename : {details?.name}</h1>
                  <h1>Size : {fileSize}</h1>
                  <h1>Type : {details?.type}</h1>
                  <h1>Height : {details?.height || ""}</h1>
                  <h1>Width : {details?.width || ""}</h1>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
