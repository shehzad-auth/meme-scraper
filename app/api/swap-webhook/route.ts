import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("🔔 Received Webhook Event:", JSON.stringify(body, null, 2));

    if (body.event === "swap") {
      console.log(`🚀 Swap Event: ${body.amount} ${body.inputMint} → ${body.receivedAmount} ${body.outputMint}`);
      const io = (global as any).io; // Access globally stored Socket.IO instance
      if (io) {
        io.emit("input-change", { message: "Swap event detected", data: body });
      } else {
        console.error("❌ Socket.IO instance not found!");
      }
    
    
    }
    

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}
