import { OverlapApp } from "@/components/overlap-app";
import { loadCatalog } from "@/lib/catalog";

export default async function Page() {
  const catalog = await loadCatalog();

  return <OverlapApp catalog={catalog} />;
}
