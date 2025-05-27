import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import { UserBasicDto } from "@/modules/users/application/dto/dtos.types";

export class BasicUserApi extends ApiClientWrapper {
  async me() {
    return await this.client
      .get<ResponseWithData<UserBasicDto>>("/api/me")
      .then(({ data: { data } }) => data);
  }
}
