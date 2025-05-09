import { ApiClientWrapper } from "@/lib/api-client";

export type SignInPayload = {
  email: string;
  password: string;
};

export class AuthApi extends ApiClientWrapper {
  async signIn(payload: SignInPayload): Promise<void> {
    await this.client.request({
      method: "POST",
      url: "/api/sessions",
      data: payload,
    });
  }

  async refreshToken(): Promise<void> {
    await this.client.request({
      method: "PATCH",
      url: "/api/sessions",
    });
  }

  async signOut(): Promise<void> {
    await this.client.request({
      method: "DELETE",
      url: "/api/sessions",
    });
  }
}
