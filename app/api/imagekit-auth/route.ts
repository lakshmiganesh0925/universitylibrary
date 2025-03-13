// app/api/imagekit-auth/route.ts
import ImageKit from "imagekit";
import config from "@/lib/config";
import { NextResponse } from "next/server";

interface Config {
  env: {
    imagekit: {
      publicKey: string;
      privateKey: string;
      urlEndpoint: string;
    };
  };
}

const {
  env: {
    imagekit: { publicKey, privateKey, urlEndpoint },
  },
} = config as Config;

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

interface AuthParams {
  token: string;
  expire: number;
  signature: string;
}

export async function GET(): Promise<NextResponse<AuthParams | { error: string }>> {
  try {
    const authParams: AuthParams = imagekit.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error("Error in imagekit auth:", error);
    return NextResponse.json(
      { error: "Failed to get authentication parameters" },
      { status: 500 }
    );
  }
}