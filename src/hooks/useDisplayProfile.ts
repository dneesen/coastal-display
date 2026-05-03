import { useLocalStorageProfile } from "./useLocalStorageProfile";

export function useDisplayProfile() {
  return useLocalStorageProfile();
}
