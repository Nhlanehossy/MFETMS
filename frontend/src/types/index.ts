export type ApiRelation = { id: number; name: string };

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  role: string;
  organization: string;
  allowed_portals: string[];
  default_path: string;
};

export type Session = {
  authenticated: boolean;
  user: SessionUser | null;
};

export type Organization = {
  id: number;
  name: string;
  short_name: string;
  organization_type: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: string;
};

export type Competition = {
  id: number;
  name: string;
  organizer: ApiRelation;
  season: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

export type Club = {
  id: number;
  organization: ApiRelation;
  short_name: string;
  city: string;
  founded_year: number;
  stadium: ApiRelation;
  coach: string;
  status: string;
};

export type Stadium = {
  id: number;
  name: string;
  city: string;
  district: string;
  capacity: number;
  number_of_gates: number;
  owner: ApiRelation | null;
};

export type MatchTicketPrice = TicketPrice & {
  match: ApiRelation;
};

export type TicketPrice = {
  id: number;
  ticket_category: ApiRelation;
  price: number;
  quantity: number;
  available_quantity: number;
};

export type Match = {
  id: number;
  label: string;
  competition: ApiRelation;
  home_team: ApiRelation;
  away_team: ApiRelation;
  home_team_name: string;
  away_team_name: string;
  stadium: ApiRelation;
  match_day: number;
  date: string;
  kickoff_time: string;
  status: string;
  ticket_prices: TicketPrice[];
};

export type TicketCategory = {
  id: number;
  name: string;
  description: string;
};

export type Ticket = {
  id: number;
  ticket_number: string;
  user: ApiRelation;
  match: ApiRelation;
  category: ApiRelation;
  seat_number: string;
  qr_code: string;
  purchase_price: number;
  status: string;
  purchase_date: string;
};

export type Payment = {
  id: number;
  ticket: ApiRelation;
  amount: number;
  provider: string;
  transaction_reference: string;
  payment_date: string;
  status: string;
};

export type RevenueDistribution = {
  id: number;
  match: ApiRelation;
  total_revenue: number;
  fam_share: number;
  sulom_share: number;
  home_team_share: number;
  away_team_share: number;
  stadium_share: number;
  security_share: number;
  distribution_date: string;
};

export type RevenueShareRule = {
  id: number;
  name: string;
  fam_percentage: number;
  sulom_percentage: number;
  home_team_percentage: number;
  away_team_percentage: number;
  stadium_percentage: number;
  security_percentage: number;
  active: boolean;
};

export type VerificationLog = {
  id: number;
  ticket: ApiRelation | null;
  verified_by: ApiRelation | null;
  gate_number: number;
  verification_time: string;
  status: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  organization?: string;
  organization_id?: number | null;
  phone?: string;
  status?: string;
  is_active?: boolean;
  allowed_portals?: string[];
  default_path?: string;
};

export type ReportSummary = {
  national: {
    matches: number;
    tickets_sold: number;
    total_revenue: number;
  };
  fam: Record<string, unknown>;
  sulom: Record<string, unknown>;
  clubs: Array<Record<string, unknown>>;
};
