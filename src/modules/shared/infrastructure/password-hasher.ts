import { IPasswordHasher } from "@/modules/shared/domain/value-objects";
import bcrypt from "bcrypt";

export class BcryptPasswordHasher implements IPasswordHasher {
  verify(hashedPassword: string, providedPassword: string): boolean {
    return bcrypt.compareSync(providedPassword, hashedPassword);
  }

  hash(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }
}
