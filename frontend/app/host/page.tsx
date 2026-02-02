import {Suspense} from "react";
import HostClient from "./HostClient";

export default function HostPage() {
  return (
    <Suspense fallback={null}>
      <HostClient />
    </Suspense>
  );
}
