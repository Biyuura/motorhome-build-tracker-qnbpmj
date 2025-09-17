
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptImage?: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  images: string[];
  createdAt: string;
}

export interface VehicleProfile {
  manufacturer: string;
  motorhomeManufacturer: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  profileImage?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type TabName = 'expenses' | 'diary' | 'profile' | 'export';
