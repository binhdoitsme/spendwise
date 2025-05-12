import { ApiClientWrapper } from "@/lib/api-client";
import {
  JournalBasicDto,
  TransactionCreateDto,
} from "../../application/dto/dtos.types";
import { JournalFormSchema } from "../components/forms";
import { ResponseWithData } from "@/app/api/api-responses";

export class JournalApi extends ApiClientWrapper {
  async createTransaction(
    journalId: string,
    tx: Omit<TransactionCreateDto, "journalId">
  ) {
    const resp = await this.client.request({
      method: "POST",
      url: `/api/journals/${journalId}/transactions`,
      data: tx,
    });
    console.log({ resp });
  }

  async createJournal(data: JournalFormSchema) {
    const resp = await this.client.request<ResponseWithData<JournalBasicDto>>({
      method: "POST",
      url: `/api/journals`,
      data,
    });
    return resp.data;
  }

  async editJournal(
    journalId: string,
    data: { title?: string; currency?: string }
  ) {
    const resp = await this.client.request({
      method: "PATCH",
      url: `/api/journals/${journalId}`,
      data,
    });
    return resp.data;
  }
}
