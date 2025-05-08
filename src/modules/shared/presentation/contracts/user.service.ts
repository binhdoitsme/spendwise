import { ApiClientWrapper } from "@/lib/api-client";

export class BasicUserApi extends ApiClientWrapper {
  async me() {
    return await this.client.get("/api/me").then(({ data }) => data);
  }
}
