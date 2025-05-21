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

  const fetchSchedules = async () => {
    setIsLoading(true);
    const res = await fetch("/api/schedule");
    const data = await res.json();
    const parsed: Schedule[] = data.map((s: any) => ({
      id: s.id,
      outlet: s.outlet,
      action: s.action,
      time: s.time,
      cron: s.cron,
    }));
    setSchedules(parsed);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, [refreshTrigger]);

  // Add polling
  useEffect(() => {
    const interval = setInterval(fetchSchedules, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
            {(() => {
              // Filter out duplicates based on outlet, action, time, and days
              const seen = new Set();
              const uniqueSchedules = schedules.filter((schedule) => {
                const key = `${schedule.outlet}|${schedule.action}|${schedule.time}|${schedule.days}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              return uniqueSchedules.map((schedule) => (
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
                        Turn {schedule.action} at {schedule.time}
                      </p>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
