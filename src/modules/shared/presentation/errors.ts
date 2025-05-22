import { ResponseWithData } from "@/app/api/api-responses";
import { AxiosError } from "axios";

export function extractErrorMessage(err: unknown) {
  let message = "";
  if (err instanceof AxiosError) {
    const errMessage = (err as AxiosError).response?.data as ResponseWithData<{
      message: string;
    }>;
    message = errMessage.data.message;
  } else if (err instanceof Error) {
    message = (err as Error).message;
  }
  return message;
}
