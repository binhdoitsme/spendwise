import { UserBasicDto } from "@/modules/users/application/dto/dtos.types";

export function convertToCurrentUser<
  T extends {
    firstName: string;
    lastName: string;
    email: string;
  }
>(user: T, currentUser: UserBasicDto): T {
  if (user.email !== currentUser.email) {
    return {
      ...user,
      firstName: "You",
      lastName: "",
    };
  }
  return user;
}
