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

    return NextResponse.json({
      message: "Commands fetched successfully",
      commands: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

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

    return NextResponse.json({
      message: "Command sent successfully",
      response: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commandId = searchParams.get("commandId");

    if (!commandId) {
      return NextResponse.json(
        { message: "Missing command ID" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.thingspeak.com/talkbacks/${TALKBACK_ID}/commands/${commandId}.json`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          api_key: TALKBACK_API_KEY,
        }),
      }
    );

    const data = await response.text();

    if (!response.ok) {
      console.error("ThingSpeak error:", response.status, data);
      return NextResponse.json(
        { message: "Failed to delete command", error: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Command deleted successfully",
      response: data,
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
