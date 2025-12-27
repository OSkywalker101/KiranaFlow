import { InventoryTable } from "@/components/inventory/InventoryTable";

export default function Home() {
  return (
    <div className="space-y-6 container mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Stock Manager</h1>
        <p className="text-muted-foreground">Monitor and manage your store inventory efficiently.</p>
      </div>
      <InventoryTable />
    </div>
  );
}
