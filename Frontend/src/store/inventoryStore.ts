import { create } from 'zustand';

export interface Product {
    id: string;
    name: string;
    quantity: number;
    costPrice?: number;
    sellingPrice?: number;
    expiryDate?: string;
    cost_price?: number;
    selling_price?: number;
    expiry_date?: string;
}

interface InventoryState {
    products: Product[];
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const useInventoryStore = create<InventoryState>((set) => ({
    products: [],

    fetchProducts: async () => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            set({ products: data });
        } catch (error) {
            console.error(error);
        }
    },

    addProduct: async (product) => {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            if (!response.ok) throw new Error('Failed to add product');
            const newProduct = await response.json();
            set((state) => ({ products: [...state.products, newProduct] }));
        } catch (error) {
            console.error(error);
        }
    },

    updateProduct: async (id, updates) => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update product');
            const updatedProduct = await response.json();
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
            }));
        } catch (error) {
            console.error(error);
        }
    },
}));
