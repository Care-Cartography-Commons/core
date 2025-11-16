export interface Institution {
  id: string;
  name: string;
  created_at: string;
  rating_count: number;
  status: string;
  qr_url: string;
}

export interface InstitutionDetail extends Institution {
  ratings: Rating[];
}

export interface Rating {
  id: number;
  rating: number;
  created_at: string;
}

export interface InstitutionCreateInput {
  name: string;
}

export interface InstitutionUpdateInput {
  name: string;
}
