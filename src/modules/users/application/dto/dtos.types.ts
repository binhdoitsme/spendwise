import { User } from "../../domain/user";

export interface UserCreateDto {
  email: string;
  password: string;
}

interface AvatarDto {
  url: string;
}

// Represents basic user information
export interface UserBasicDto {
  email: string;
  avatar?: AvatarDto;
}

export function mapToUserBasicDto(user: User): UserBasicDto {
  return {
    email: user.email.value,
    avatar: user.profile?.avatar
      ? { url: user.profile.avatar.url.toString() }
      : undefined,
  };
}

export interface UserDetailedDto {
  email: string;
  avatar?: AvatarDto;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
}

export function mapToUserDetailedDto(user: User): UserDetailedDto {
  const profile = user.profile;
  return {
    email: user.email.value,
    avatar: user.profile?.avatar
      ? { url: user.profile.avatar.url.toString() }
      : undefined,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    gender: profile?.gender,
    dob: profile?.dob?.toISO() ?? undefined,
    nationality: profile?.nationality,
  };
}
