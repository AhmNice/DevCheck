import type { UserInterface } from "../../interface/user";
import type { AuthState } from "../authstore";

export const createAuthHelpers = (
  set: (state: Partial<AuthState>) => void,
) => ({
  start: (isAuthCheck = false) =>
    set({
      loadingUser: true,
      userError: null,
      userSuccess: undefined,
      checkingAuth: isAuthCheck,
    }),

  success: (user?: UserInterface | null) =>
    set({
      user,
      loadingUser: false,
      userError: null,
      userSuccess: true,
    }),

  error: (message: string) =>
    set({
      user: null,
      loadingUser: false,
      userError: message,
      userSuccess: undefined,
    }),

  reset: () =>
    set({
      user: null,
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
