// src/types/database.ts

export type UserRole = 'admin' | 'staff';
export type UserStatus = 'active' | 'inactive';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  position?: string;
  role: UserRole;
  avatar_url?: string;
  status: UserStatus;
  created_at: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  status: VehicleStatus;
  current_mileage: number;
  image_url?: string;
  // เพิ่มใหม่ ---
  brand?: string;
  model?: string;
  vehicle_type?: string;
  seat_capacity?: number;
  fuel_type?: string;
  // -----------
  last_serviced_at?: string;
}

export interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  vehicle_id?: string;
  vehicle?: Vehicle; // Joined data
  participants?: Profile[]; // Joined data
}

export type EventType = 'inspection' | 'delivery' | 'maintenance' | 'other';

export interface Event {
  id: string;
  title: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  description?: string;
  vehicle_id?: string;
  is_line_notify_enabled: boolean;
  created_by: string;
  created_at: string;
  
  // Join Fields (ข้อมูลที่ Join มา)
  vehicle?: Vehicle;
  participants?: {
    user: Profile; // ใน Supabase มันจะ return มาแบบ participants: { user: Profile }[]
  }[];
}