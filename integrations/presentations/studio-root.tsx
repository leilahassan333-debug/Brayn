"use client";
import { useMemo } from "react";
import { BrowserPresentationGateway } from "@/infrastructure/presentations/browser-gateway";
import { useStudio } from "@/application/presentations/use-studio";
import { PresentationStudio } from "@/features/presentations/presentation-studio";
export default function StudioRoot() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const gateway = useMemo(
    () => (url && key ? new BrowserPresentationGateway(url, key) : undefined),
    [url, key],
  );
  return <PresentationStudio {...useStudio(gateway)} />;
}
