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
}

export interface Vehicle {
  id: string;
  plate_number: string;
  status: VehicleStatus;
  current_mileage: number;
  image_url?: string;
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