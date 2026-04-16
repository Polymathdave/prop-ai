import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getPropertyTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    detached_duplex: "Detached Duplex",
    semi_detached_duplex: "Semi-Detached Duplex",
    terrace: "Terrace",
    flat: "Flat",
    apartment: "Apartment",
    penthouse: "Penthouse",
    bungalow: "Bungalow",
    mansion: "Mansion",
    mini_flat: "Mini Flat",
    room_and_parlour: "Room & Parlour",
    single_room: "Single Room",
    shop: "Shop",
    office: "Office",
    warehouse: "Warehouse",
    land: "Land",
    event_center: "Event Center",
    hotel: "Hotel",
    guest_house: "Guest House",
  };
  
  return typeMap[type] || type.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}
