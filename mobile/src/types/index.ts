export type TableStatus = 'available' | 'called' | 'in-service';

export interface Table {
  id: number;
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
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed';
  attendedBy?: string;
}