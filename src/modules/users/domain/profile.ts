import { DateTime } from "luxon";

export type Gender = "MALE" | "FEMALE";

interface INetAvatar {
  url: URL;
}

export class UserProfile {
  constructor(
    public firstName: string,
    public lastName: string,
    public gender: Gender,
    public dob: DateTime,
    public nationality: string,
    public avatar?: INetAvatar
  ) {}

  static restore(data: {
    firstName: string;
    lastName: string;
    gender: Gender;
    dob: string;
    nationality: string;
    avatar?: INetAvatar;
  }): UserProfile {
    return new UserProfile(
      data.firstName,
      data.lastName,
      data.gender,
      DateTime.fromISO(data.dob),
      data.nationality,
      data.avatar
    );
  }
}
