import { UserId } from "@/modules/shared/domain/identifiers";
import {
  Email,
  IPasswordHasher,
  Password,
} from "@/modules/shared/domain/value-objects";
import { userErrors } from "../../domain/errors";
import { UserRepository } from "../../domain/repositories";
import { User } from "../../domain/user";
import {
  mapToUserBasicDto,
  mapToUserDetailedDto,
  UserCreateDto,
} from "../dto/dtos.types";

export class UserServices {
  constructor(
    private readonly repository: UserRepository,
    private readonly hasher: IPasswordHasher
  ) {}

  async getUserById(userId: string, extras: boolean = false) {
    const id = new UserId(userId);
    const user = await this.repository.findById(id);
    if (!user) {
      return undefined;
    }
    if (extras) {
      return mapToUserDetailedDto(user);
    }
    return mapToUserBasicDto(user);
  }

  async registerUser({
    email,
    password,
  }: UserCreateDto): Promise<{ userId: string }> {
    const existing = await this.repository!.findByEmail(Email.from(email));
    if (existing) {
      throw userErrors.existingUser;
    }
    try {
      const user = new User(
        Email.from(email),
        Password.fromPlainText(password, this.hasher!)
      );
      await this.repository.save(user);
      return { userId: user.id.value };
    } catch (err) {
      console.error(err);
      throw userErrors.unknownError;
    }
  }
}
