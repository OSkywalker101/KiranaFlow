"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

export function RestockRecommendation() {
    const { products } = useStore();

    const lowStockItems = products.filter(p => p.quantity < 10);
    const expiringItems = products.filter(p => {
        const today = new Date();
        const expiryDate = new Date(p.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    });

    const recommendationList = [...lowStockItems];
    // Avoid duplicates if needed, but for now just showing low stock primarily as "Restock". 
    // Expiring items might be "Clearance" but user asked for "Recommended Restock".
    // Let's stick to low stock for Restock logic.

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recommended Restock</CardTitle>
                <CardDescription>
                    Items running low that need replenishment.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recommendationList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Inventory levels are healthy.</p>
                    ) : (
                        recommendationList.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">Current Stock: <span className="text-destructive font-bold">{item.quantity}</span></div>
                                </div>
                                <Button size="sm" variant="outline" className="h-8">
                                    <Truck className="mr-2 h-3 w-3" /> Order
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
