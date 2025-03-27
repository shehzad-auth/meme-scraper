import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const event = await req.json(); // Parse JSON body
        console.log("🔔 Webhook received:", JSON.stringify(event, null, 2));

        // Check if the event is a deposit (investment in the pool)
        if (event.type === "DEPOSIT") {
            console.log("✅ Investment detected in pool:", event);
            // Here, you can update state or perform any necessary action
        }

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error handling webhook:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
