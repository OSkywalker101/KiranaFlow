"use client";

import { Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Calendar, Clock, PlusCircle, MinusCircle, Loader2, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useStore } from "@/store/useStore";

interface CustomerDetailProps {
    customer: Customer;
    onBack: () => void;
    onPayment: (amount: number) => void;
}

function calculateDaysOutstanding(dateStr?: string) {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
}

export function CustomerDetail({ customer, onBack, onPayment }: CustomerDetailProps) {
    const { updateCustomer, updateCustomerBalance } = useStore();
    const [isCalculating, setIsCalculating] = useState(false);

    // Derived state
    const daysOutstanding = calculateDaysOutstanding(customer.debtStartDate);

    const calculateScore = async () => {
        setIsCalculating(true);
        try {
            const res = await fetch('/api/credit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Sending complete data for accurate AI analysis
                    history: customer.history || [],
                    balance: customer.balance,
                    lastPaymentDate: customer.lastPaymentDate,
                    debtStartDate: customer.debtStartDate
                })
            });

            const data = await res.json();

            if (res.ok && data.creditScore !== undefined) {
                // Update the store
                updateCustomer(customer.id, { creditScore: data.creditScore });

                // Optional: Show the reason if the backend sent one
                if (data.reason) {
                    alert(`Score Updated: ${data.creditScore}\nReason: ${data.reason}`);
                }
            } else {
                alert("Failed to calculate score: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            alert("Error connecting to server");
            console.error(error);
        } finally {
            setIsCalculating(false);
        }
    };

    // Gauge Data
    const score = customer.creditScore || 0; // Default to 0 if undefined
    const data = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ];

    // Color based on score
    let color = "#ef4444"; // Red (Bad)
    if (score > 50) color = "#eab308"; // Yellow (Average)
    if (score > 75) color = "#22c55e"; // Green (Good)

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <Button variant="ghost" onClick={onBack} className="mb-2 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Card: Financial Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{customer.name}</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                            <span>Phone: {customer.phone}</span>
                            <span className="text-xs text-muted-foreground">
                                Last Paid: {customer.lastPaymentDate || "Never"}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-6 border-b">
                            <div className="text-4xl font-bold mb-2">₹{customer.balance}</div>
                            <div className="text-muted-foreground uppercase text-xs tracking-wider">Outstanding Balance</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-b text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <div>
                                    <p className="text-muted-foreground">Days Due</p>
                                    <p className="font-semibold">{customer.balance > 0 ? daysOutstanding : 0} days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <div>
                                    <p className="text-muted-foreground">Debt Started</p>
                                    <div className="flex items-center gap-1">
                                        <p className="font-semibold">{customer.debtStartDate || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <Button
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                    const amount = prompt("Enter debt amount to add (₹):");
                                    if (amount) {
                                        const val = parseFloat(amount);
                                        if (!isNaN(val)) {
                                            updateCustomerBalance(customer.id, val);
                                            // Initialize start date if starting from 0 balance
                                            if (customer.balance === 0) {
                                                updateCustomer(customer.id, { debtStartDate: new Date().toISOString().split('T')[0] });
                                            }
                                        }
                                    }
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Debt
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                    const amount = prompt("Enter payment amount (₹):");
                                    if (amount) {
                                        const val = parseFloat(amount);
                                        if (!isNaN(val)) {
                                            onPayment(val);
                                            updateCustomer(customer.id, { lastPaymentDate: new Date().toISOString().split('T')[0] });
                                        }
                                    }
                                }}
                            >
                                <MinusCircle className="mr-2 h-4 w-4" /> Record Payment
                            </Button>
                        </div>
                        <Button className="w-full mt-2" variant="outline" onClick={() => alert(`Reminder sent to ${customer.phone}`)}>
                            <Send className="mr-2 h-4 w-4" /> Send Reminder
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Card: Credit Score Visualization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Credit Score
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={calculateScore}
                                disabled={isCalculating}
                            >
                                {isCalculating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-purple-500" />}
                                <span className="text-xs">{isCalculating ? "AI Analyzing..." : "AI Recalculate"}</span>
                            </Button>
                        </CardTitle>
                        <CardDescription>Customer trustworthiness rating (0-100)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex flex-col items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="70%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="cell-0" fill={color} />
                                    <Cell key="cell-1" fill="#e2e8f0" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <div className="text-4xl font-bold" style={{ color }}>{score}</div>
                            <div className="text-xs text-muted-foreground">Credit Score</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}