"use client";

import type React from "react";

import { useState } from "react";
import { Clock, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ScheduleFormProps {
  outlets: Array<{ id: number; name: string }>;
  onScheduleAdded: () => void;
}

export default function ScheduleForm({
  outlets,
  onScheduleAdded,
}: ScheduleFormProps) {
  const [outlet, setOutlet] = useState<string>("all");
  const [action, setAction] = useState<string>("on");
  const [time, setTime] = useState<string>("08:00");
  const [days, setDays] = useState<string>("everyday");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert time and days to cron expression
      const [hours, minutes] = time.split(":");
      let cronExpression = "";

      if (days === "everyday") {
        cronExpression = `${minutes} ${hours} * * *`;
      } else if (days === "weekdays") {
        cronExpression = `${minutes} ${hours} * * 1-5`;
      } else if (days === "weekends") {
        cronExpression = `${minutes} ${hours} * * 0,6`;
      }

      // Create command string
      let commandString = "";
      if (outlet === "all") {
        commandString = `ALL_${action.toUpperCase()}`;
      } else {
        commandString = `OUTLET${outlet}_${action.toUpperCase()}`;
      }

      // Send to API
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: cronExpression,
          command: commandString,
          outlet: outlet === "all" ? "All Outlets" : `Outlet ${outlet}`,
          action: action.toUpperCase(),
          rawTime: time,
          days,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule command");
      }

      toast("Schedule created", {
        description: `${
          outlet === "all" ? "All outlets" : `Outlet ${outlet}`
        } will turn ${action} at ${time} ${
          days === "everyday"
            ? "every day"
            : days === "weekdays"
            ? "on weekdays"
            : "on weekends"
        }`,
      });

      // Notify parent component
      onScheduleAdded();
    } catch (error) {
      console.error("Error scheduling command:", error);
      toast("Error scheduling", {
        description: "Failed to create schedule. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>Schedule Outlets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outlet">Outlet</Label>
              <Select value={outlet} onValueChange={setOutlet}>
                <SelectTrigger id="outlet">
                  <SelectValue placeholder="Select outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id.toString()}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">Turn ON</SelectItem>
                  <SelectItem value="off">Turn OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger id="days">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyday">Every Day</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating Schedule..." : "Add Schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
