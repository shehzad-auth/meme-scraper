import { NextResponse } from "next/server";

export async function GET(request: any) {
  try {
    const metadata = {
      name: "My Token",
      symbol: "MTK",
      description: "A unique Solana token.",
      image: "https://static.vecteezy.com/system/resources/thumbnails/024/553/534/small_2x/lion-head-logo-mascot-wildlife-animal-illustration-generative-ai-png.png",
      decimals: 9,
      properties: {
        files: [
          {
            uri: "https://static.vecteezy.com/system/resources/thumbnails/024/553/534/small_2x/lion-head-logo-mascot-wildlife-animal-illustration-generative-ai-png.png",
            type: "image/png",
          }
        ]
      }
    };

    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json({ error: "Invalid encoded data" }, { status: 400 });
  }
}
