import toast from "react-hot-toast";
import apiClient from "./apiClient";

export const uploadFile = async (
  file: File,
  folderName?: string,
  name?: string,
  handleFormChange?: (name: string, value: string) => void,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  if (!file) return null;

  const cleanedFileName = encodeURIComponent(file.name)
    .replace(/-/g, "")
    .replace(/\s+/g, "")
    .replace(/%20/g, "");

  const fileName = folderName
    ? `${folderName}/${cleanedFileName}`
    : cleanedFileName;

  const fileType = file.type || "application/octet-stream";

  try {
    // 1️⃣ Get presigned upload URL
    const { body } = await apiClient.post(
      `${apiClient.URLS.s3bucket}/generate-upload-url`,
      { fileName, fileType },
      true
    );

    const uploadURL = body?.uploadURL;
    if (!uploadURL) {
      throw new Error("Upload URL not generated");
    }

    // 2️⃣ Upload using XHR (single upload, progress supported)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadURL);
      xhr.setRequestHeader("Content-Type", fileType);

      xhr.upload.onprogress = (event) => {
        if (onProgress && event.lengthComputable) {
          const percentCompleted = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentCompleted);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(`File upload failed to S3 (status ${xhr.status})`)
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Error during file upload"));
      };

      xhr.send(file);
    });

    const publicURL = uploadURL.split("?")[0];

    if (handleFormChange && name) {
      handleFormChange(name, publicURL);
    }

    toast.success("File uploaded successfully!");
    return publicURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.error("Failed to upload file.");
    return null;
  }
};

export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    const url = new URL(fileUrl);
    const fileName = url.pathname.substring(1);

    await apiClient.delete(`${apiClient.URLS.s3bucket}/delete`, {
      fileName,
    });

    toast.success("File deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    toast.error("Failed to delete the file");
    return false;
  }
};
export const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], fileName, { type: mime });
};
// uploadFile.ts (same file where uploadFile/deleteFile exist)
export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  type: string = "image/png",
  quality?: number
): Promise<File> => {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      type,
      quality
    );
  });

  return new File([blob], fileName, { type });
};

