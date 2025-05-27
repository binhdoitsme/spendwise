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
  profileCompleted: boolean;
  avatar?: AvatarDto;
}

export interface UserProfileDto {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  avatarUrl?: string;
}

export function mapToUserBasicDto(user: User): UserBasicDto {
  return {
    email: user.email.value,
    avatar: user.profile?.avatar
      ? { url: user.profile.avatar.url.toString() }
      : undefined,
    profileCompleted: !!user.profile,
  };
}

export interface UserDetailedDto {
  profileCompleted: boolean;
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
    profileCompleted: !!user.profile,
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
