import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("🔔 Received Webhook Event:", JSON.stringify(body, null, 2));

    if (body.event === "swap") {
      console.log(`🚀 Swap Event: ${body.amount} ${body.inputMint} → ${body.receivedAmount} ${body.outputMint}`);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}
