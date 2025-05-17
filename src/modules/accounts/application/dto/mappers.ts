import { Account } from "../../domain/account";
import { AccountUserBasic } from "../contracts/user-resolver";
import { AccountBasicDto } from "./dtos.types";

export function mapAccountToBasicDto(
  account: Account,
  user: AccountUserBasic
): AccountBasicDto {
  return {
    id: account.id.value,
    type: account.type,
    owner: {
      userId: user.id.value,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.value,
    },
    displayName: account.getDisplayName(),
  };
}
