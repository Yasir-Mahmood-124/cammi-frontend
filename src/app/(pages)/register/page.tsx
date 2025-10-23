"use client";

import { Suspense } from "react";
import { Register } from "@/components";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Register />
    </Suspense>
  );
}
