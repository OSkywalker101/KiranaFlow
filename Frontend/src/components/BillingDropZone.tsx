import { useState, useCallback } from 'react';
import { useCustomerStore } from '../store/customerStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function BillingDropZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const deductBalance = useCustomerStore((state) => state.deductBalance);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setMessage(null);

        try {
            // Call the server-side API instead of using Gemini directly
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/parse-invoice', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process invoice');
            }

            const data = await response.json();

            // Extract the first item's data (assuming bill format)
            if (data.items && data.items.length > 0) {
                const firstItem = data.items[0];
                const name = firstItem.name || 'Unknown';
                const amount = firstItem.price || 0;

                if (name && amount > 0) {
                    await deductBalance(name, amount);
                    setMessage({
                        type: 'success',
                        text: `Processed bill for ${name}. Deducted ₹${amount}.`
                    });
                } else {
                    setMessage({ type: 'error', text: 'Could not extract valid name and amount from the image.' });
                }
            } else {
                setMessage({ type: 'error', text: 'Could not extract valid data from the image.' });
            }
        } catch (error: any) {
            console.error("Processing Error", error);
            setMessage({ type: 'error', text: error.message || 'Error processing image.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                processFile(file);
            } else {
                setMessage({ type: 'error', text: 'Please drop an image file.' });
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <Card className="border-2 border-dashed border-gray-300 overflow-hidden">
            <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg">Bill Processor</CardTitle>
                <CardDescription>Drop a bill image to auto-deduct balance.</CardDescription>
            </CardHeader>
            <CardContent
                className={`
            p-8 flex flex-col items-center justify-center transition-colors min-h-[200px]
            ${isDragging ? 'bg-primary/10 border-primary' : 'hover:bg-muted/20'}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-primary">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p>Analyzing bill with AI...</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center mb-2">
                            Drag and drop a bill image here, or
                        </p>
                        <label htmlFor="file-upload">
                            <Button variant="secondary" size="sm" className="cursor-pointer" asChild>
                                <span>Browse Files</span>
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </>
                )}

                {message && (
                    <div className={`mt-4 flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
