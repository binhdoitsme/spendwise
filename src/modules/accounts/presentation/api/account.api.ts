import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import {
  AccountBasicDto,
  AccountInput,
} from "../../application/dto/dtos.types";

export class AccountApi extends ApiClientWrapper {
  async createAccount(data: Omit<AccountInput, "userId">) {
    const response = await this.client.post<
      ResponseWithData<{ accountId: string }>
    >("/api/accounts", data);
    return response.data.data;
  }

  async deleteAccount(accountId: string) {
    await this.client.delete(`/api/accounts/${accountId}`);
  }

  async listAccounts() {
    const response = await this.client.get<
      ResponseWithData<{ accounts: AccountBasicDto[] }>
    >("/api/accounts");
    return response.data.data.accounts;
  }
}
