import { NextRequest, NextResponse } from "next/server";
import cron from "node-cron";
import { addSchedule, deleteSchedule, getSchedules } from "@/lib/scheduleStore";
import { v4 as uuidv4 } from "uuid";

const TALKBACK_ID = process.env.TALKBACK_ID!;
const TALKBACK_API_KEY = process.env.TALKBACK_API_KEY!;

// Handle GET request to fetch schedules
export async function GET() {
  return NextResponse.json(getSchedules());
}

// Handle POST request to schedule new command
export async function POST(req: NextRequest) {
  try {
    const { time, command, outlet, action, rawTime, days } = await req.json();

    if (!time || !command) {
      return NextResponse.json(
        { message: "Missing time or command" },
        { status: 400 }
      );
    }

    const id = uuidv4();

    addSchedule({
      id,
      outlet,
      action,
      time: rawTime,
      days,
      cron: time,
    });

    cron.schedule(time, async () => {
      console.log(`🕒 Scheduled command: ${command} at ${time}`);
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

        const resText = await res.text();
        if (!res.ok) {
          console.error("ThingSpeak Error:", res.status, resText);
        } else {
          console.log("Command sent to ThingSpeak:", resText);

          // Auto-delete from schedule store after executing
          deleteSchedule(id);
          console.log(`Schedule with ID ${id} auto-deleted.`);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    });

    return NextResponse.json({ message: "Command scheduled", id });
  } catch (err) {
    console.error("Schedule error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
