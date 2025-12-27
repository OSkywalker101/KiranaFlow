import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  credit_score: number;
  debtStartDate?: string; // Optional: ISO string date
  lastPaymentDate?: string;
}

interface CustomerState {
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
  addCustomer: (name: string, phone: string, balance: number, debtStartDate?: string) => Promise<void>;
  deductBalance: (name: string, amount: number) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
}

// src/store/customerStore.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
//const API_URL = 'http://127.0.0.1:8000';
export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],

  fetchCustomers: async () => {
    try {
      const response = await fetch(`${API_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      set({ customers: data });
    } catch (error) {
      console.error(error);
    }
  },

  addCustomer: async (name, phone, balance, debtStartDate) => {
    try {
      const body: any = { name, phone, balance, credit_score: 0 };
      if (debtStartDate) body.debt_start_date = debtStartDate;

      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to add customer');

      const newCustomer = await response.json();
      set((state) => ({ customers: [...state.customers, newCustomer] }));
    } catch (error) {
      console.error(error);
    }
  },

  deductBalance: async (name, amount) => {
    try {
      const response = await fetch(`${API_URL}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount }),
      });

      if (!response.ok) throw new Error('Failed to deduct balance');

      const result = await response.json();

      // Refresh customers or update local state
      set((state) => ({
        customers: state.customers.map((customer) => {
          // Approximate matching logic or just refetch
          if (customer.name.toLowerCase() === name.toLowerCase()) {
            return { ...customer, balance: result.new_balance };
          }
          return customer;
        })
      }));

    } catch (error) {
      console.error(error);
      alert("Failed to process deduction. Check if customer exists.");
    }
  },

  updateCustomer: async (id, updates) => {
    try {
      // Map frontend camelCase to backend snake_case if needed
      const body: any = { ...updates };
      if (updates.debtStartDate) {
        body.debt_start_date = updates.debtStartDate;
        delete body.debtStartDate;
      }
      // Note: credit_score check
      if (updates.credit_score !== undefined) body.credit_score = updates.credit_score;

      const response = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update customer');
      const updated = await response.json();

      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (error) {
      console.error(error);
    }
  },
}));
