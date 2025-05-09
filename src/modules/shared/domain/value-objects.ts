export class Email {
  private static readonly emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

  private constructor(public readonly value: string) {}

  public static from(email: string): Email {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty.");
    }

    if (!this.emailRegex.test(email)) {
      throw new Error("Invalid email format.");
    }

    return new Email(email);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export abstract class IPasswordHasher {
  abstract verify(hashedPassword: string, providedPassword: string): boolean;
  abstract hash(password: string): string;
}

export class Password {
  constructor(readonly value: string) {}

  public verify(password: string, hasher: IPasswordHasher): boolean {
    return hasher.verify(this.value, password);
  }

  public static fromPlainText(
    plainText: string,
    hasher: IPasswordHasher
  ): Password {
    return new Password(hasher.hash(plainText));
  }

  toString(): string {
    return this.value;
  }
}
