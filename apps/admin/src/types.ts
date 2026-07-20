export interface Institution {
  id: string;
  name: string;
  created_at: string;
  activation_date: string;
  deactivation_date: string;
  rating_count: number;
  status: string;
  paused: boolean;
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

export interface InstitutionInput {
  name: string;
  activation_date: string;
  deactivation_date: string;
  paused: boolean;
}
