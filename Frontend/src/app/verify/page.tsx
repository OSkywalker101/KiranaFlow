"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function VerifyForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !email) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });
            if (error) throw error;

            router.push("/");
        } catch (error: any) {
            alert(error.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Verify OTP</CardTitle>
                <CardDescription>Enter the code sent to {email}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">One-Time Password</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={isLoading}
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/20">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyForm />
            </Suspense>
        </div>
    );
}
