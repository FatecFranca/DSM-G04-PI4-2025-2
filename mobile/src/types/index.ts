export type TableStatus = 'available' | 'called' | 'in-service';

export interface Table {
  id: number;  // ID local para UI (mock)
  _id?: string; // ID do MongoDB (quando vem do backend)
  number: string;
  position: {
    x: number;
    y: number;
  };
  status: TableStatus;
}

export interface Call {
  id: string;
  tableId: number;  // ID local para UI (mock)
  table_id?: string; // ID do MongoDB da mesa (quando vem do backend)
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