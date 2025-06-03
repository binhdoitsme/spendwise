import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import {
  AccountSummaryDto,
  AccountSummaryQueryInput,
  JournalSummaryDto,
  JournalSummaryQueryInput,
} from "../../application/dto/dtos.types";

export class ReportsApi extends ApiClientWrapper {
  async getPaymentSummary(
    input: AccountSummaryQueryInput
  ): Promise<AccountSummaryDto> {
    const resp = await this.client.post<ResponseWithData<AccountSummaryDto>>(
      "/api/reports/accounts",
      input
    );
    return resp.data.data;
  }

  async getJournalSummary(
    input: JournalSummaryQueryInput
  ): Promise<JournalSummaryDto> {
    const resp = await this.client.post<ResponseWithData<JournalSummaryDto>>(
      "/api/reports/journals",
      input
    );
    return resp.data.data;
  }
}
