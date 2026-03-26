import { type AxiosResponse } from "axios";
import { notify } from "./notify";
import type { UserInterface } from "../interface/user";

type ApiResponse<T = unknown> = {
  user: UserInterface;
  success: boolean;
  message?: string;
  data?: T;
};

type ApiError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

type HandleRequestParams<T> = {
  request: () => Promise<AxiosResponse<ApiResponse<T>>>;
  onSuccess?: (data: ApiResponse<T>) => void;
  onError?: (error: ApiError) => void;
  showToast?: boolean;
};

type HandleRequestResult<T> =
  | { success: true; data: ApiResponse<T> }
  | { success: false };

export const handleRequest = async <T = unknown>({
  request,
  onSuccess,
  onError,
  showToast = true,
}: HandleRequestParams<T>): Promise<HandleRequestResult<T>> => {
  try {
    const { data } = await request();

    if (!data?.success) {
      if (showToast) notify.error(data.message || "Request failed");
      onError?.(data);
      return { success: false };
    }

    if (showToast) notify.success(data.message || "Success");
    onSuccess?.(data);

    return { success: true, data };
  } catch (error: unknown) {
    const err = error as ApiError;
    const errMsg =
      err?.response?.data?.message ||
      "Network error. Please check your connection.";

    console.log(errMsg);
    if (showToast) notify.error(errMsg);

    onError?.(err);

    return { success: false };
  }
};
