import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const eventList = await req.json(); // Parse JSON body
    // console.log("🔔 Webhook received:", JSON.stringify(eventList, null, 2));

    // Loop through each event
    for (const event of eventList) {
      console.log("Processing event:");

      // Check if this looks like a swap event
      const tokenTransfers = event.tokenTransfers || [];
      if (tokenTransfers.length >= 2) {
        const uniqueMints = new Set(
          tokenTransfers.map((transfer: any) => transfer.mint)
        );

        if (uniqueMints.size > 1) {
          console.log("✅ Swap detected");
          // Here, you can update state or perform any necessary action
        }
      }
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
