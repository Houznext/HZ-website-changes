import toast from "react-hot-toast";
import apiClient from "./apiClient";

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

function s3UploadApiUrl(): string {
  const base = String(apiClient.URLS.s3bucket || "").replace(/\/$/, "");
  return `${base}/upload`;
}

/** Same resolution order as apiClient (store → next-auth session). */
async function getBearerTokenForUpload(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { useSessionStore } = require("@/src/stores/useSessionStore");
    const t = useSessionStore.getState().token;
    if (t) return String(t);
  } catch {
    /* optional store */
  }
  try {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    const t =
      (session as { accessToken?: string } | null)?.accessToken ||
      (session as { token?: string } | null)?.token ||
      (session as { user?: { token?: string } } | null)?.user?.token;
    return t ? String(t) : null;
  } catch {
    return null;
  }
}

export async function getSignedImageUrl(
  publicUrl: string | undefined | null,
): Promise<string> {
  if (!publicUrl) return "";

  const bucketHost = process.env.NEXT_PUBLIC_S3_BUCKET_HOST || "onecasa-dev-assets.s3";
  if (!publicUrl.includes(bucketHost)) return publicUrl;

  const cached = signedUrlCache.get(publicUrl);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  try {
    const res = await apiClient.get(
      `${apiClient.URLS.s3bucket}/signed-read-url?fileUrl=${encodeURIComponent(publicUrl)}&expiresIn=3600`,
      true,
    );
    const signedUrl = res?.body?.signedUrl;
    if (signedUrl) {
      signedUrlCache.set(publicUrl, {
        url: signedUrl,
        expiresAt: Date.now() + 50 * 60 * 1000, // cache 50 min (URL valid for 60)
      });
      return signedUrl;
    }
  } catch (err) {
    console.error("Failed to get signed read URL:", err);
  }
  return publicUrl;
}

export const uploadFile = async (
  file: File,
  folderName?: string,
  name?: string,
  handleFormChange?: (name: string, value: string) => void,
  onProgress?: (progress: number) => void,
): Promise<string | null> => {
  if (!file) return null;

  const cleanedFileName = encodeURIComponent(file.name)
    .replace(/-/g, "")
    .replace(/\s+/g, "")
    .replace(/%20/g, "");

  const fileName = folderName
    ? `${folderName}/${cleanedFileName}`
    : cleanedFileName;

  try {
    const token = await getBearerTokenForUpload();
    if (!token) {
      toast.error("Session expired — sign in again to upload files.");
      return null;
    }

    const publicURL = await new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", s3UploadApiUrl());
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (onProgress && event.lengthComputable) {
          const percentCompleted = Math.round(
            (event.loaded / event.total) * 100,
          );
          onProgress(percentCompleted);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as { publicUrl?: string };
            if (!data?.publicUrl) {
              reject(new Error("Upload response missing publicUrl"));
              return;
            }
            resolve(data.publicUrl);
          } catch {
            reject(new Error("Invalid upload response"));
          }
        } else {
          reject(
            new Error(
              `Upload failed (${xhr.status})`,
            ),
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error("Error during file upload"));
      };

      xhr.send(formData);
    });

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
    const fileName = decodeURIComponent(url.pathname.slice(1));

    await apiClient.delete(
      `${apiClient.URLS.s3bucket}/delete?fileName=${encodeURIComponent(fileName)}`,
      undefined,
      true,
    );

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
export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  type: string = "image/png",
  quality?: number,
): Promise<File> => {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      type,
      quality,
    );
  });

  return new File([blob], fileName, { type });
};
