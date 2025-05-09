import { UserId } from "@/modules/shared/domain/identifiers";
import { Email, Password } from "@/modules/shared/domain/value-objects";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DateTime } from "luxon";
import { UserProfile } from "../../../domain/profile";
import { UserRepository } from "../../../domain/repositories";
import { User } from "../../../domain/user";
import * as schema from "../schemas";
import { profiles, users } from "../schemas";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly dbInstance: NodePgDatabase<typeof schema>) {}

  async save(user: User): Promise<void> {
    await this.dbInstance.transaction(async (tx) => {
      await tx
        .insert(users)
        .values({
          id: user.id.value,
          email: user.email.toString(),
          password: user.password.toString(),
          createdAt: user.createdAt.toJSDate(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.email.toString(),
            password: user.password.toString(),
          },
        });

      if (user.profile) {
        await tx
          .insert(profiles)
          .values({
            userId: user.id.value,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            gender: user.profile.gender,
            dob: user.profile.dob?.toJSDate(),
            nationality: user.profile.nationality,
            avatarUrl: user.profile.avatar?.url.toString(),
          })
          .onConflictDoUpdate({
            target: profiles.userId,
            set: {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              gender: user.profile.gender,
              dob: user.profile.dob?.toJSDate(),
              nationality: user.profile.nationality,
              avatarUrl: user.profile.avatar?.url.toString(),
            },
          });
      }
    });
  }

  async findById(id: UserId): Promise<User | undefined> {
    const userResult = await this.dbInstance
      .select()
      .from(users)
      .where(eq(users.id, id.value))
      .limit(1);

    if (!userResult[0]) return undefined;

    const profileResult = await this.dbInstance
      .select()
      .from(profiles)
      .where(eq(profiles.userId, id.value))
      .limit(1);

    return this.mapToDomain(userResult[0], profileResult[0]);
  }

  async findByEmail(email: Email): Promise<User | undefined> {
    const userResult = await this.dbInstance
      .select()
      .from(users)
      .where(eq(users.email, email.toString()))
      .limit(1);

    if (!userResult[0]) return undefined;

    const profileResult = await this.dbInstance
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userResult[0].id))
      .limit(1);

    return this.mapToDomain(userResult[0], profileResult[0]);
  }

  private mapToDomain(
    userSchema: typeof users.$inferSelect,
    profileSchema?: typeof profiles.$inferSelect
  ): User {
    const profile = profileSchema
      ? new UserProfile(
          profileSchema.firstName ?? "",
          profileSchema.lastName ?? "",
          profileSchema.gender as "MALE" | "FEMALE",
          DateTime.fromJSDate(profileSchema.dob),
          profileSchema.nationality ?? "",
          profileSchema.avatarUrl
            ? { url: new URL(profileSchema.avatarUrl) }
            : undefined
        )
      : undefined;

    return User.restore({
      id: new UserId(userSchema.id),
      email: Email.from(userSchema.email),
      password: new Password(userSchema.password),
      profile,
      createdAt: DateTime.fromJSDate(userSchema.createdAt),
    });
  }
}
