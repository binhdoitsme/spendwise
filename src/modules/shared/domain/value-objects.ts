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
