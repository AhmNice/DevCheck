import type { UserInterface } from "../../interface/user";
import type { AuthState } from "../authstore";

export const createAuthHelpers = (
  set: (state: Partial<AuthState>) => void,
) => ({
  start: (isAuthCheck = false) =>
    set({
      loadingUser: true,
      isAuthenticated: false,
      userError: null,
      userSuccess: undefined,
      checkingAuth: isAuthCheck,
    }),

  success: ({ user }: { user?: UserInterface | null }) =>
    set({
      user: user,
      isAuthenticated: true,
      loadingUser: false,
      userError: null,
      userSuccess: true,
    }),

  error: (message: string) =>
    set({
      user: null,
      isAuthenticated: false,
      loadingUser: false,
      userError: message,
      userSuccess: undefined,
    }),

  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      loadingUser: false,
      userError: null,
      userSuccess: undefined,
      checkingAuth: false,
    }),

  stopLoading: () =>
    set({
      loadingUser: false,
      checkingAuth: false,
    }),
});
