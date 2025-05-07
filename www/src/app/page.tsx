"use client";

import { useState, useEffect } from "react";
import { Activity, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OutletButton from "./_components/outlet-button";
import PowerConsumption from "./_components/power-consumption";
import ScheduleList from "./_components/schedule-list";
import ScheduleForm from "./_components/schedule-form";

export default function Home() {
  const [outlets, setOutlets] = useState([
    { id: 1, name: "Outlet_1", isOn: false, consumption: 5 },
    { id: 2, name: "Outlet_2", isOn: false, consumption: 8 },
    { id: 3, name: "Outlet_3", isOn: false, consumption: 12 },
    { id: 4, name: "Outlet_4", isOn: false, consumption: 7 },
  ]);

  const [masterOn, setMasterOn] = useState(false);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);

  // Calculate total power consumption whenever outlet states change
  useEffect(() => {
    const total = outlets.reduce((sum, outlet) => {
      return sum + (outlet.isOn ? outlet.consumption : 0);
    }, 0);
    setTotalConsumption(total);

    // Update master button state based on all outlets
    const allOn = outlets.every((outlet) => outlet.isOn);
    const allOff = outlets.every((outlet) => !outlet.isOn);

    if (allOn && !masterOn) {
      setMasterOn(true);
    } else if (allOff && masterOn) {
      setMasterOn(false);
    }
  }, [outlets, masterOn]);

  // Toggle individual outlet
  const toggleOutlet = (id: number) => {
    const updatedOutlets = outlets.map((outlet) =>
      outlet.id === id ? { ...outlet, isOn: !outlet.isOn } : outlet
    );
    setOutlets(updatedOutlets);

    const toggled = updatedOutlets.find((o) => o.id === id);
    sendCommand(`${toggled?.name}_${toggled?.isOn ? "ON" : "OFF"}`);
  };

  // Toggle all outlets
  const toggleAllOutlets = () => {
    const newState = !masterOn;
    setMasterOn(newState);
    const updated = outlets.map((outlet) => ({ ...outlet, isOn: newState }));
    setOutlets(updated);
    sendCommand(`ALL_${newState ? "ON" : "OFF"}`);
  };

  // Trigger schedule list refresh
  const handleScheduleAdded = () => {
    setScheduleRefreshTrigger((prev) => prev + 1);
  };

  const sendCommand = async (command: string) => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send command");

      console.log("Command sent:", data);
    } catch (err) {
      console.error("Error sending command:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Smart Outlet Controller
          </h1>
          <p className="text-gray-500 mt-1">
            Control and monitor your smart outlets
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Outlet Controls</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span>Power Monitoring</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Master Control */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Power
                      className={`h-6 w-6 ${
                        masterOn ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-lg font-medium">Master Control</span>
                  </div>
                  <Button
                    variant={masterOn ? "default" : "outline"}
                    className={`w-full sm:w-auto ${
                      masterOn ? "bg-green-500 hover:bg-green-600" : ""
                    }`}
                    onClick={toggleAllOutlets}
                  >
                    {masterOn ? "ON" : "OFF"}
                  </Button>
                </div>

                {/* Individual Outlets */}
                <div className="grid grid-cols-1 gap-4">
                  {outlets.map((outlet) => (
                    <OutletButton
                      key={outlet.id}
                      outlet={outlet}
                      onToggle={() => toggleOutlet(outlet.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Form */}
            <ScheduleForm
              outlets={outlets}
              onScheduleAdded={handleScheduleAdded}
            />
          </div>

          {/* Right Column - Visualization and Schedules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Power Consumption */}
            <PowerConsumption
              outlets={outlets}
              totalConsumption={totalConsumption}
            />

            {/* Schedule List */}
            <ScheduleList refreshTrigger={scheduleRefreshTrigger} />
          </div>
        </div>
      </div>
    </main>
  );
}
