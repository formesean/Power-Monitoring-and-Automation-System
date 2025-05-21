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
  const [isLoading, setIsLoading] = useState(true);
  const [outlets, setOutlets] = useState([
    { id: 1, name: "Outlet_1", isOn: false },
    { id: 2, name: "Outlet_2", isOn: false },
    { id: 3, name: "Outlet_3", isOn: false },
    { id: 4, name: "Outlet_4", isOn: false },
  ]);

  const [masterOn, setMasterOn] = useState<boolean>(false);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] =
    useState<number>(0);
  const [relayState, setRelayState] = useState<number>(15);
  const [powerConsumption, setPowerConsumption] = useState<number>(0);
  const [isAllFlagToggled, setIsAllFlagToggled] = useState<boolean>(false);

  // Update outlet states based on relayState
  useEffect(() => {
    const updateOutletsFromRelayState = () => {
      const newOutlets = outlets.map((outlet) => {
        let shouldBeOn = false;
        switch (relayState) {
          case 15: // ALL OFF
            shouldBeOn = false;
            break;
          case 14: // 1 ON
            shouldBeOn = outlet.id === 1;
            break;
          case 13: // 2 ON
            shouldBeOn = outlet.id === 2;
            break;
          case 12: // 1,2 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 2;
            break;
          case 11: // 3 ON
            shouldBeOn = outlet.id === 3;
            break;
          case 10: // 1,3 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 3;
            break;
          case 9: // 2,3 ON
            shouldBeOn = outlet.id === 2 || outlet.id === 3;
            break;
          case 8: // 1,2,3 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 2 || outlet.id === 3;
            break;
          case 7: // 4 ON
            shouldBeOn = outlet.id === 4;
            break;
          case 6: // 1,4 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 4;
            break;
          case 5: // 2,4 ON
            shouldBeOn = outlet.id === 2 || outlet.id === 4;
            break;
          case 4: // 1,2,4 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 2 || outlet.id === 4;
            break;
          case 3: // 3,4 ON
            shouldBeOn = outlet.id === 3 || outlet.id === 4;
            break;
          case 2: // 1,3,4 ON
            shouldBeOn = outlet.id === 1 || outlet.id === 3 || outlet.id === 4;
            break;
          case 1: // 2,3,4 ON
            shouldBeOn = outlet.id === 2 || outlet.id === 3 || outlet.id === 4;
            break;
          case 0: // ALL ON
            shouldBeOn = true;
            break;
        }
        return { ...outlet, isOn: shouldBeOn };
      });
      setOutlets(newOutlets);

      if (relayState == 0) setMasterOn(true);
      else setMasterOn(false);
    };

    updateOutletsFromRelayState();
  }, [relayState]);

  // Toggle individual outlet
  const toggleOutlet = (id: number) => {
    const updatedOutlets = outlets.map((outlet) =>
      outlet.id === id ? { ...outlet, isOn: !outlet.isOn } : outlet
    );
    setOutlets(updatedOutlets);

    // If any outlet is turned OFF, masterOn should be false
    if (updatedOutlets.some((outlet) => !outlet.isOn)) {
      setMasterOn(false);
    }

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

  // Update isAllFlagToggled when masterOn or outlets change
  useEffect(() => {
    const allOn = outlets.every((outlet) => outlet.isOn);
    if (masterOn || allOn) {
      setIsAllFlagToggled(true);
    } else {
      setIsAllFlagToggled(false);
    }
  }, [masterOn, outlets]);
  console.log(isAllFlagToggled);

  // Trigger schedule list refresh
  const handleScheduleAdded = () => {
    setScheduleRefreshTrigger((prev) => prev + 1);
  };

  const sendCommand = async (command: string) => {
    try {
      const res = await fetch("/api/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send command");
    } catch (err) {
      console.error("Error sending command:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/state", { method: "POST" });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 2500));

        const fetchCommands = async (retryCount = 0) => {
          try {
            const res = await fetch("/api/state", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (res.status === 409 && retryCount < 3) {
              await new Promise((resolve) => setTimeout(resolve, 2500));
              return fetchCommands(retryCount + 1);
            }

            if (!res.ok)
              throw new Error(data.error || "Failed to fetch commands");

            const deletePromises = data.commands.map(async (cmd: any) => {
              const { command_string } = cmd;

              if (command_string.startsWith("POWER:")) {
                const powerValue = parseFloat(command_string.split(":")[1]);
                // console.log("Parsed power value:", powerValue);
                if (!isNaN(powerValue)) {
                  setPowerConsumption(powerValue);
                }
              }

              if (command_string.startsWith("RELAY_STATE:")) {
                const hexValue = command_string.split(":")[1];
                const relayValue = parseInt(hexValue, 16) >> 4;
                // console.log("Parsed relay value:", relayValue);
                if (!isNaN(relayValue)) {
                  setRelayState(relayValue);
                }
              }

              const deleteRes = await fetch(`/api/direct?commandId=${cmd.id}`, {
                method: "DELETE",
              });

              if (!deleteRes.ok) {
                const deleteErr = await deleteRes.text();
                if (!deleteRes.status.toString().startsWith("404")) {
                  console.error("Failed to delete command:", deleteErr);
                }
              }
            });

            await Promise.all(deletePromises);
          } catch (error) {
            if (retryCount < 3) {
              await new Promise((resolve) => setTimeout(resolve, 2500));
              return fetchCommands(retryCount + 1);
            }
            throw error;
          }
        };

        await fetchCommands();
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching relay state:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">
            Initializing your smart outlet controller
          </p>
        </div>
      </main>
    );
  }

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
              isAllFlagToggled={isAllFlagToggled}
            />
          </div>

          {/* Right Column - Visualization and Schedules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Power Consumption */}
            <PowerConsumption
              outlets={outlets}
              totalConsumption={powerConsumption}
            />

            {/* Schedule List */}
            <ScheduleList refreshTrigger={scheduleRefreshTrigger} />
          </div>
        </div>
      </div>
    </main>
  );
}
