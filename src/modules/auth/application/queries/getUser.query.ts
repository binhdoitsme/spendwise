import { UserId } from "@/modules/shared/domain/identifiers";

export async function getUserBasic(id: UserId) {
  return {
    email: "me@test.com",
    avatar: {
      url: "https://github.com/shadcn.png",
    },
  };
}

export async function getUserDetailed(id: UserId) {
  return {
    email: "me@test.com",
    avatar: {
      url: "https://github.com/shadcn.png",
    },
  };
}
