from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import CustomerCreate, CustomerUpdate, Customer, DeductionRequest, ProductCreate, ProductUpdate, SaleCreate
from typing import List

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "*", # Allow all origins for production (Vercel)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/customers", response_model=List[dict])
def get_customers():
    response = supabase.table("customers").select("*").execute()
    return response.data

@app.post("/customers", response_model=dict)
def create_customer(customer: CustomerCreate):
    response = supabase.table("customers").insert(customer.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create customer")
    return response.data[0]

@app.get("/customers/{customer_id}", response_model=dict)
def get_customer(customer_id: str):
    response = supabase.table("customers").select("*").eq("id", customer_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return response.data[0]

@app.put("/customers/{customer_id}", response_model=dict)
def update_customer(customer_id: str, customer: CustomerUpdate):
    # Filter out None values
    update_data = {k: v for k, v in customer.dict().items() if v is not None}
    response = supabase.table("customers").update(update_data).eq("id", customer_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return response.data[0]

@app.post("/deduct")
def deduct_balance(transaction: DeductionRequest):
    # Find customer by name (case insensitive)
    # Note: In a real app we might want to handle duplicate names or use phone
    response = supabase.table("customers").select("*").ilike("name", transaction.name).execute()
    
    if not response.data:
         raise HTTPException(status_code=404, detail=f"Customer '{transaction.name}' not found")
    
    customer = response.data[0]
    new_balance = float(customer["balance"]) - transaction.amount
    
    # Update balance
    update_response = supabase.table("customers").update({"balance": new_balance}).eq("id", customer["id"]).execute()
    
    # Optional: Record transaction in a separate table (logic can be added here)
    
    return {"message": "Balance deducted", "new_balance": new_balance, "customer": customer["name"]}

# --- Inventory Endpoints ---

@app.get("/products", response_model=List[dict])
def get_products():
    response = supabase.table("products").select("*").execute()
    return response.data

@app.post("/products", response_model=dict)
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create product")
    return response.data[0]

@app.put("/products/{product_id}", response_model=dict)
def update_product(product_id: str, product: ProductUpdate):
    # Filter out None values
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    response = supabase.table("products").update(update_data).eq("id", product_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return response.data[0]

# --- Sales Endpoints ---

@app.post("/sales")
def create_sale(sale: SaleCreate):
    # 1. Record the sale (assuming a 'sales' table exists, or just reduce stock for now)
    # Ideally: Insert into 'sales' table, then insert into 'sale_items'
    
    # For this simplified version, we'll just update stock levels
    for item in sale.items:
        # Get current stock
        prod_res = supabase.table("products").select("quantity").eq("id", item.product_id).execute()
        if prod_res.data:
            current_qty = prod_res.data[0]["quantity"]
            new_qty = current_qty - item.quantity
            
            # Update stock
            supabase.table("products").update({"quantity": new_qty}).eq("id", item.product_id).execute()
        
    return {"message": "Sale recorded and inventory updated", "total": sale.total_amount}
