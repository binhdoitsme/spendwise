import { UserId } from "@/modules/shared/domain/identifiers";
import {
  Email,
  IPasswordHasher,
  Password,
} from "@/modules/shared/domain/value-objects";
import { DateTime } from "luxon";
import { userErrors } from "../../domain/errors";
import { Gender } from "../../domain/profile";
import { UserRepository } from "../../domain/repositories";
import { User } from "../../domain/user";
import {
  mapToUserBasicDto,
  mapToUserDetailedDto,
  UserCreateDto,
  UserProfileDto,
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

  async updateUserProfile(
    userId: string,
    profile: UserProfileDto
  ): Promise<void> {
    const id = new UserId(userId);
    const user = await this.repository.findById(id);
    if (!user) {
      throw userErrors.userNotFound;
    }
    user.updateProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      dob: DateTime.fromISO(profile.dob),
      gender: profile.gender as Gender,
      nationality: profile.nationality,
      avatar: profile.avatarUrl
        ? { url: new URL(profile.avatarUrl) }
        : undefined,
    });
    await this.repository.save(user);
  }
}
