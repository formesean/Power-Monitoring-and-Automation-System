import { NextRequest, NextResponse } from "next/server";
import cron from "node-cron";

const TALKBACK_ID = process.env.TALKBACK_ID!;
const TALKBACK_API_KEY = process.env.TALKBACK_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { time, command } = await req.json();

    if (!time || !command) {
      return NextResponse.json(
        { message: "Missing time or command" },
        { status: 400 }
      );
    }

    cron.schedule(time, async () => {
      console.log(`Scheduled command: ${command} at ${time}`);

      try {
        const res = await fetch(
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

        if (!res.ok) {
          const errorText = await res.text();
          console.error("ThingSpeak API Error:", errorText);
        } else {
          console.log("Command sent to ThingSpeak");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    });

    return NextResponse.json({ message: "Command scheduled successfully" });
  } catch (err) {
    console.error("Schedule error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
