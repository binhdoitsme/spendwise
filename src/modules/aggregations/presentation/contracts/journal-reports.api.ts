import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import { JournalDetailedDto } from "@/modules/journals/application/dto/dtos.types";
import {
  AccountSummaryDto,
  JournalSummaryDto,
} from "@/modules/reports/application/dto/dtos.types";
import axios from "axios";
import { AggregatedJournalQueryInput } from "../../application/journal-reports.service";

export class JournalAggregateApi extends ApiClientWrapper {
  async getAggregatedJournal({
    journalId,
    month,
    query,
    creditOnly,
    today,
  }: AggregatedJournalQueryInput) {
    const res = await axios.post<
      ResponseWithData<{
        journal: JournalDetailedDto;
        accountSummary: AccountSummaryDto;
        journalSummary: JournalSummaryDto;
      }>
    >(`/api/journals/${journalId}/aggregate`, {
      journalId,
      month,
      query,
      creditOnly,
      today,
    });
    return res.data.data;
  }
}
