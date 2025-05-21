"use client";

import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Outlet {
  id: number;
  name: string;
  isOn: boolean;
}

interface OutletButtonProps {
  outlet: Outlet;
  onToggle: () => void;
}

export default function OutletButton({ outlet, onToggle }: OutletButtonProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Power
          className={`h-5 w-5 ${
            outlet.isOn ? "text-green-500" : "text-gray-400"
          }`}
        />
        <div>
          <p className="font-medium">{outlet.name.replace(/_/g, " ")}</p>
          <p className="text-sm text-gray-500">
            {outlet.isOn ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
      <Button
        variant={outlet.isOn ? "default" : "outline"}
        className={`hover:cursor-pointer w-full sm:w-auto ${
          outlet.isOn ? "bg-green-500 hover:bg-green-600" : ""
        }`}
        onClick={onToggle}
      >
        {outlet.isOn ? "ON" : "OFF"}
      </Button>
    </div>
  );
}
