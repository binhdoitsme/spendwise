import { ApiClientWrapper } from "@/lib/api-client";
import { UserCreateDto } from "../../application/dto/dtos.types";

export class UserApi extends ApiClientWrapper {
  async registerUser(data: UserCreateDto) {
    return await this.client
      .post<{ userId: string }>("/api/registration", data)
      .then(({ data }) => data);
  }
}
