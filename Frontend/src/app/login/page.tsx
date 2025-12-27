"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                }
            });
            if (error) throw error;

            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            alert(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipLogin = () => {
        // Set a cookie to bypass auth check in middleware
        document.cookie = 'devMode=true; path=/; max-age=' + (60 * 60 * 24 * 7); // 7 days
        router.push('/');
    };

    return (
        <div className="flex h-screen items-center justify-center bg-muted/20">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your email to receive a one-time password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Send OTP
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-muted-foreground"
                            onClick={handleSkipLogin}
                        >
                            Skip Login (Dev Mode)
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
