export interface Product {
  id: string;
  name: string;
  regularPrice: number;
  wholesalePrice: number;
  stock: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  items: CartItem[];
  total: number;
  amountPaid: number;
  change: number;
}