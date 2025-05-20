import { ResponseWithData } from "@/app/api/api-responses";
import { LinkJournalAccountRequest } from "@/app/api/journals/[id]/accounts/route";
import { ApiClientWrapper } from "@/lib/api-client";
import {
  JournalBasicDto,
  JournalDetailedDto,
  TransactionCreateDto,
} from "../../application/dto/dtos.types";
import { JournalFormSchema } from "../components/forms";

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

  async getJournalById(journalId: string) {
    const resp = await this.client.request<
      ResponseWithData<JournalDetailedDto>
    >({
      method: "GET",
      url: `/api/journals/${journalId}`,
    });
    return resp.data.data;
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

  async linkAccount(journalId: string, data: LinkJournalAccountRequest) {
    const resp = await this.client.request({
      method: "POST",
      url: `/api/journals/${journalId}/accounts`,
      data,
    });
    console.log({ resp });
  }

  async unlinkAccount(journalId: string, accountId: string) {
    const resp = await this.client.request({
      method: "DELETE",
      url: `/api/journals/${journalId}/accounts`,
      data: { accountId },
    });
    console.log({ resp });
  }

  async addTags(journalId: string, tags: string[]) {
    const resp = await this.client.request({
      method: "POST",
      url: `/api/journals/${journalId}/tags`,
      data: { tags },
    });
    console.log({ resp });
  }

  async inviteCollaborator({
    journalId,
    email,
    permission,
  }: {
    journalId: string;
    email: string;
    permission: string;
  }) {
    const resp = await this.client.request({
      method: "POST",
      url: `/api/journals/${journalId}/collaborators`,
      data: { email, permission },
    });
    console.log({ resp });
  }

  async removeCollaborator({
    journalId,
    userId,
  }: {
    journalId: string;
    userId: string;
  }) {
    const resp = await this.client.request({
      method: "DELETE",
      url: `/api/journals/${journalId}/collaborators`,
      data: { userId },
    });
    console.log({ resp });
  }

  async editTransaction(
    journalId: string,
    transactionId: string,
    data: Omit<TransactionCreateDto, "journalId">
  ) {
    const resp = await this.client.request({
      method: "PATCH",
      url: `/api/journals/${journalId}/transactions/${transactionId}`,
      data,
    });
    console.log({ resp });
  }
  async deleteTransaction(journalId: string, transactionId: string) {
    const resp = await this.client.request({
      method: "DELETE",
      url: `/api/journals/${journalId}/transactions/${transactionId}`,
    });
    console.log({ resp });
  }
}
