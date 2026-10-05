export interface Company {
  id: string;
  name: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  tax_number?: string;
  logo_url?: string;
  website?: string;
  working_hours?: {
    monday?: { start: string; end: string; closed?: boolean };
    tuesday?: { start: string; end: string; closed?: boolean };
    wednesday?: { start: string; end: string; closed?: boolean };
    thursday?: { start: string; end: string; closed?: boolean };
    friday?: { start: string; end: string; closed?: boolean };
    saturday?: { start: string; end: string; closed?: boolean };
    sunday?: { start: string; end: string; closed?: boolean };
  };
  created_at: string;
  updated_at: string;
  user_id: string; // Şirketi oluşturan kullanıcı
}

export interface CompanyCreate {
  name: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  tax_number?: string;
  website?: string;
  working_hours?: Company['working_hours'];
}

export interface CompanyUpdate extends Partial<CompanyCreate> {
  logo_url?: string | null;
}

export interface CompanyFilters {
  name?: string;
  city?: string;
  country?: string;
  sortBy?: 'name' | 'created_at' | 'city';
  sortOrder?: 'asc' | 'desc';
} 