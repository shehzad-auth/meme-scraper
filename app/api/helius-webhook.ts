import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const event = req.body;
        console.log("🔔 Webhook received:", event);

        // Check if the event is a deposit (investment in the pool)
        if (event.type === "DEPOSIT") {
            console.log("✅ Investment detected in pool:", event);
            // You can update state or trigger a client-side function here
        }

        res.status(200).json({ message: "Webhook received" });
    } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
