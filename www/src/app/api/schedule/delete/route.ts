import { NextRequest, NextResponse } from "next/server";
import { deleteSchedule } from "@/lib/scheduleStore";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Missing schedule ID" },
        { status: 400 }
      );
    }

    deleteSchedule(id);
    return NextResponse.json({ message: "Schedule deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
