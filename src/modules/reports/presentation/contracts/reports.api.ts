import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import {
  AccountSummary,
  AccountSummaryQueryInput,
} from "../../application/dto/dtos.types";

export class ReportsApi extends ApiClientWrapper {
  async getPaymentSummary(
    input: AccountSummaryQueryInput
  ): Promise<AccountSummary> {
    const resp = await this.client.post<ResponseWithData<AccountSummary>>(
      "/api/reports/accounts",
      input
    );
    return resp.data.data;
  }
}
