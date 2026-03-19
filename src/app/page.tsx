import { OverlapApp } from "@/components/overlap-app";
import { loadCatalog } from "@/lib/catalog";

export const revalidate = 300;

export default async function Page() {
  const snapshot = await loadCatalog();

  return <OverlapApp snapshot={snapshot} />;
}
