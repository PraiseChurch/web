import React from "react";
import { ConfigForm } from "../_components/ConfigForm";
import { getConfig } from "@/app/(site)/bulletin/_data/config";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const config = await getConfig();
  return <ConfigForm initialConfig={config} />;
}
