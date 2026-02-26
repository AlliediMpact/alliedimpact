'use client';

import SupportComponent from "@/components/SupportComponent";
import { Shield } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Contact Support</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
      </div>

      <SupportComponent />
    </div>
  );
}
