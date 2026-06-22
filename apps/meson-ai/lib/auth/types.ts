export type PortalUser = {
  id: string;
  supabase_uid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  client_id: string | null;
  project_id: string[] | null;
};

export type PortalClient = {
  id: string;
  company_name: string;
  email: string;
  status: string;
  onboarding_stage: string | null;
  first_name: string | null;
  last_name: string | null;
  image: { url?: string } | null;
};

export type AppSession = {
  authUserId: string;
  user: PortalUser;
  client: PortalClient | null;
};

export type LoginEdgeResponse = {
  authToken: string;
  refreshToken: string;
  expiresAt: number;
  user: PortalUser;
  client: PortalClient | null;
  campaignIds?: string[];
  projectIds?: string[];
};
