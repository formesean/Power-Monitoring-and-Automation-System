import { NextRequest, NextResponse } from "next/server";

const TALKBACK_ID = process.env.TALKBACK_ID!;
const TALKBACK_API_KEY = process.env.TALKBACK_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(
      `https://api.thingspeak.com/talkbacks/${TALKBACK_ID}/commands.json?api_key=${TALKBACK_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ThingSpeak error:", response.status, data);
      return NextResponse.json(
        { message: "Failed to fetch commands", error: data },
        { status: response.status }
      );
    }

    console.log("Commands fetched from ThingSpeak:", data);
    return NextResponse.json({
      message: "Commands fetched successfully",
      commands: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
