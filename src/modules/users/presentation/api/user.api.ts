import { ApiClientWrapper } from "@/lib/api-client";
import {
  UserCreateDto,
  UserProfileDto,
} from "../../application/dto/dtos.types";

export class UserApi extends ApiClientWrapper {
  async registerUser(data: UserCreateDto) {
    return await this.client
      .post<{ userId: string }>("/api/registration", data)
      .then(({ data }) => data);
  }

  async updateUserProfile(data: UserProfileDto) {
    return await this.client
      .patch<{ userId: string }>("/api/me", data)
      .then(({ data }) => data);
  }
}
