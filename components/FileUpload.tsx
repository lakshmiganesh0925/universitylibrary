"use client";

import { IKImage, ImageKitProvider, IKUpload, IKVideo } from "imagekitio-next";
import config from "@/lib/config";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define config structure
interface Config {
  env: {
    apiEndpoint?: string; // Optional, defaults to local if not set
    imagekit: {
      publicKey: string;
      urlEndpoint: string;
    };
  };
}

// Extract config with type assertion
const {
  env: {
    apiEndpoint = "", // Default to empty string if undefined
    imagekit: { publicKey, urlEndpoint },
  },
} = config as Config;

// Authenticator function with typed response
interface AuthResponse {
  signature: string;
  expire: number;
  token: string;
}

const authenticator = async (): Promise<AuthResponse> => {
  try {
    // Use /api/imagekit-auth to match your API route; adjust if apiEndpoint is external
    const response = await fetch(`${apiEndpoint}/api/imagekit-auth`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }

    const data: AuthResponse = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error: unknown) {
    console.error("Authentication request failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Authentication request failed: ${message}`);
  }
};

// Props interface
interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
  path?: string | null;
}

// ImageKit upload response type (simplified)
interface UploadResponse {
  filePath: string;
  [key: string]: any; // Allow additional fields from ImageKit
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
  path,
}: Props) => {
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string | null>(value ?? null);
  const [progress, setProgress] = useState<number>(0);

  const styles = {
    button: variant === "dark" ? "bg-dark-300" : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const onError = (error: any) => {
    console.error(error);
    toast({
      title: `${type} upload failed`,
      description: `Your ${type} could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  };

  const onSuccess = (res: UploadResponse) => {
    setFile(res.filePath);
    onFileChange(res.filePath);
    toast({
      title: `${type} uploaded successfully`,
      description: `${res.filePath} uploaded successfully!`,
    });
  };

  const onValidate = (file: File): boolean => {
    if (type === "image" && file.size > 20 * 1024 * 1024) {
      toast({
        title: "File size too large",
        description: "Please upload a file that is less than 20MB in size",
        variant: "destructive",
      });
      return false;
    } else if (type === "video" && file.size > 50 * 1024 * 1024) {
      toast({
        title: "File size too large",
        description: "Please upload a file that is less than 50MB in size",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }: ProgressEvent) => {
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
        className="hidden"
      />

      <button
        className={cn("upload-btn", styles.button)}
        onClick={(e) => {
          e.preventDefault();
          ikUploadRef.current?.click();
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
        {file && <p className={cn("upload-filename", styles.text)}>{file}</p>}
      </button>

      {progress > 0 && progress < 100 && (
        <div className="w-full rounded-full bg-green-200">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {file || path ? (
        type === "image" ? (
          <IKImage
            alt={file ?? path ?? ""}
            path={file ?? path ?? undefined}
            width={500}
            height={300}
          />
        ) : type === "video" ? (
          <IKVideo
            path={file ?? path ?? undefined}
            controls={true}
            className="h-96 w-full rounded-xl"
          />
        ) : null
      ) : null}
    </ImageKitProvider>
  );
};

export default FileUpload;