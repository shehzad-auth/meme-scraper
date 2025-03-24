import { NextResponse } from "next/server";

export async function GET(request: any, { params }: any) {
  try {
    const { data } = await params; // Get encoded data from URL

    // Decode Base64 to string
    const decodedString = Buffer.from(data, "base64").toString("utf-8");

    // Parse into an object
    const tokenData = JSON.parse(decodedString);

    // Construct JSON response
    const metadata = {
      name: tokenData.name || "Unknown Token",
      symbol: tokenData.symbol || "UNK",
      description: tokenData.description || "No description available.",
      image: tokenData.image || "https://arweave.net/default_image_hash",
      decimals: 9,
      properties: {
        files: [
          {
            uri: tokenData.image,
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
