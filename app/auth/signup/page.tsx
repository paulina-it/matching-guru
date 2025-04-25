"use client";

import { Suspense } from "react";
import SignupInner from "./SignupInner";

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading signup...</div>}>
      <SignupInner />
    </Suspense>
  );
}
