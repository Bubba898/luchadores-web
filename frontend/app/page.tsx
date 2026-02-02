"use client";

import BackendHealthBadge from "./components/BackendHealthBadge";
import {Screens} from "@/app/components/screens/Screens";

export default function Home() {
  return (
    <div className="relative min-h-screen ">
      <Screens/>
      <BackendHealthBadge />
    </div>
  );
}
