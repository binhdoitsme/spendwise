import { ApiClientWrapper } from "@/lib/api-client";
import { TransactionCreateDto } from "../../application/dto/dtos.types";

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

  async createJournal(data: { ownerId: string; ownerEmail: string; title: string; currency: string }) {
    const resp = await this.client.request({
      method: "POST",
      url: `/api/journals`,
      data,
    });
    return resp.data;
  }

  async editJournal(journalId: string, data: { title?: string; currency?: string }) {
    const resp = await this.client.request({
      method: "PATCH",
      url: `/api/journals/${journalId}`,
      data,
    });
    return resp.data;
  }
}
