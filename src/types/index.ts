import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  postcode: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}

export interface CatchReport {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  photoUrl: string;
  species: string;
  weightLb?: number;
  weightOz?: number;
  lengthInches?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  notes: string;
  caughtAt: Timestamp;
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Timestamp;
}

export interface Like {
  id: string;
  reportId: string;
  userId: string;
  createdAt: Timestamp;
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
