"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductGrid() {
    const { products, addToCart } = useStore();
    const [search, setSearch] = useState("");

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products by name or category..."
                    className="pl-10 h-12 text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 pr-2 max-h-[calc(100vh-220px)]">
                {filteredProducts.map((product) => (
                    <Card
                        key={product.id}
                        className="cursor-pointer transition-all hover:bg-accent hover:border-primary/50 group relative overflow-hidden"
                        onClick={() => addToCart(product)}
                    >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" className="h-8 w-8 rounded-full bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="h-5 w-5 text-white" />
                            </Button>
                        </div>
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="font-semibold leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                <div className="text-sm text-muted-foreground mb-2">{product.category || 'General'}</div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-lg text-primary">₹{product.sellingPrice}</span>
                                <Badge variant={product.quantity < 10 ? "warning" : "secondary"} className="text-[10px] px-1.5 h-5">
                                    {product.quantity} left
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No products found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}
