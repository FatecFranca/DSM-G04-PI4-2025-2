export type TableStatus = 'available' | 'called' | 'in-service';

export interface Table {
  id: number;
  _id?: string;
  number: string;
  position: {
    x: number;
    y: number;
  };
  status: TableStatus;
}

export interface Call {
  id: string;
  tableId: number;
  table_id?: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed';
  attendedBy?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}