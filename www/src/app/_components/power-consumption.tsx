"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Outlet {
  id: number;
  name: string;
  isOn: boolean;
  consumption: number;
}

interface PowerConsumptionProps {
  outlets: Outlet[];
  totalConsumption: number;
}

export default function PowerConsumption({
  outlets,
  totalConsumption,
}: PowerConsumptionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<number[]>([]);

  // Add current consumption to history every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setConsumptionHistory((prev) => {
        const newHistory = [...prev, totalConsumption];
        // Keep only the last 20 readings
        return newHistory.slice(-20);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [totalConsumption]);

  // Draw the power consumption chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(padding, padding, chartWidth, chartHeight);

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const maxValue = Math.max(
      50,
      Math.ceil(Math.max(...consumptionHistory, 1) / 10) * 10
    );
    const yStep = chartHeight / 5;

    for (let i = 0; i <= 5; i++) {
      const y = padding + i * yStep;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${Math.round(maxValue - (i * maxValue) / 5)}W`,
        padding - 10,
        y
      );
    }

    // If no data, show message
    if (consumptionHistory.length === 0) {
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Collecting power consumption data...",
        width / 2,
        height / 2
      );
      return;
    }

    // Draw line chart
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.beginPath();

    const xStep = chartWidth / (consumptionHistory.length - 1 || 1);

    consumptionHistory.forEach((value, index) => {
      const x = padding + index * xStep;
      const normalizedValue = value / maxValue;
      const y = padding + chartHeight - normalizedValue * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under the line
    ctx.lineTo(
      padding + (consumptionHistory.length - 1) * xStep,
      padding + chartHeight
    );
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fill();

    // Draw data points
    consumptionHistory.forEach((value, index) => {
      const x = padding + index * xStep;
      const normalizedValue = value / maxValue;
      const y = padding + chartHeight - normalizedValue * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw x-axis time labels
    const timeLabels =
      consumptionHistory.length > 1
        ? ["-40s", "-30s", "-20s", "-10s", "now"]
        : ["now"];

    timeLabels.forEach((label, index) => {
      const position = index / (timeLabels.length - 1);
      const x = padding + position * chartWidth;

      ctx.fillStyle = "#6b7280";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, x, padding + chartHeight + 10);
    });

    // Draw current consumption value
    ctx.fillStyle = "#111827";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${totalConsumption}W`, width / 2, padding / 2);
  }, [consumptionHistory, totalConsumption]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Power Consumption Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            Aggregate Power Consumption Over Time
          </div>
          <div className="w-full aspect-[2/1] h-[300px]">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full h-full"
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <div className="text-sm text-gray-500">Active Outlets</div>
              <div className="font-medium">
                {outlets.filter((outlet) => outlet.isOn).length} of{" "}
                {outlets.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Consumption</div>
              <div className="font-bold text-xl text-green-600">
                {totalConsumption}W
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
