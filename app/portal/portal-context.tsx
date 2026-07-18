"use client";

import { createContext, useContext } from "react";

export interface UserProfileData {
  authenticated: boolean;
  authUserId: string;
  email: string;
  fullName: string;
  role: string;
  profileId: string;
  profilePhotoUrl?: string;
}

export interface PortalContextType {
  profile: UserProfileData | null;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

export const PortalContext = createContext<PortalContextType>({
  profile: null,
  refreshProfile: async () => {},
  loading: true
});

export const usePortal = () => useContext(PortalContext);
