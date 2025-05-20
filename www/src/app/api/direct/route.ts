import { NextRequest, NextResponse } from "next/server";

const TALKBACK_ID = process.env.TALKBACK_ID!;
const TALKBACK_API_KEY = process.env.TALKBACK_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();

    if (!command) {
      return NextResponse.json({ message: "Missing command" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.thingspeak.com/talkbacks/${TALKBACK_ID}/commands.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          api_key: TALKBACK_API_KEY,
          command_string: command,
        }),
      }
    );

    const data = await response.text();

    if (!response.ok) {
      console.error("ThingSpeak error:", response.status, data);
      return NextResponse.json(
        { message: "Failed to send command", error: data },
        { status: response.status }
      );
    }

    console.log("Command sent to ThingSpeak:", data);
    return NextResponse.json({
      message: "Command sent successfully",
      response: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
