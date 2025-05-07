"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Schedule {
  id: string;
  outlet: string;
  action: string;
  time: string;
  days: string;
}

// This is a mock implementation since we don't have a real API to fetch schedules
// In a real app, you would fetch this data from your backend
export default function ScheduleList({
  refreshTrigger,
}: {
  refreshTrigger: number;
}) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        const parsed: Schedule[] = data.map((s: any) => ({
          id: s.id,
          outlet: s.outlet,
          action: s.action,
          time: s.time,
          days: s.days,
          cron: s.cron,
        }));
        setSchedules(parsed);
      })
      .finally(() => setIsLoading(false));
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    await fetch("/api/schedule/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Active Schedules</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No schedules found. Add one above.
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      schedule.action === "ON"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{schedule.outlet}</p>
                    <p className="text-sm text-gray-500">
                      Turn {schedule.action} at {schedule.time} ({schedule.days}
                      )
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
