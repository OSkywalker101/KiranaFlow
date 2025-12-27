from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    phone: str
    balance: float
    credit_score: int = 0
    debt_start_date: Optional[str] = None
    last_payment_date: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    balance: Optional[float] = None
    credit_score: Optional[int] = None
    debt_start_date: Optional[str] = None
    last_payment_date: Optional[str] = None

class Customer(CustomerBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

class DeductionRequest(BaseModel):
    name: str
    amount: float

class ProductBase(BaseModel):
    name: str
    quantity: int
    cost_price: float
    selling_price: float
    expiry_date: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    expiry_date: Optional[str] = None

class Product(ProductBase):
    id: str
    created_at: str
    
    class Config:
        from_attributes = True

class SaleItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class SaleCreate(BaseModel):
    items: List[SaleItem]
    total_amount: float
    payment_method: str

