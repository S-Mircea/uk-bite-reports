export interface User {
  id: string;
  email: string;
  display_name: string;
  postcode: string;
  avatar_url?: string;
  created_at: string;
}

export interface CatchReport {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  photo_url: string;
  species: string;
  weight_lb?: number;
  weight_oz?: number;
  length_inches?: number;
  location_name: string;
  latitude: number;
  longitude: number;
  notes: string;
  caught_at: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  text: string;
  created_at: string;
}

export interface Like {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  ReportDetail: { reportId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  PostReport: undefined;
  Profile: undefined;
};

export const UK_FISH_SPECIES = [
  "Carp (Common)",
  "Carp (Mirror)",
  "Carp (Ghost)",
  "Pike",
  "Perch",
  "Roach",
  "Rudd",
  "Tench",
  "Bream",
  "Barbel",
  "Chub",
  "Dace",
  "Gudgeon",
  "Zander",
  "Brown Trout",
  "Rainbow Trout",
  "Salmon (Atlantic)",
  "Grayling",
  "Eel",
  "Catfish (Wels)",
  "Ruffe",
  "Bleak",
  "Crucian Carp",
  "Ide",
  "Other",
] as const;

export type FishSpecies = (typeof UK_FISH_SPECIES)[number];
