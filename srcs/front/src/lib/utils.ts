import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '/api'; 
  }
  
  return 'https://backend:3333'; 
};

export const API_URL = getBaseUrl();

export {
  cn
};