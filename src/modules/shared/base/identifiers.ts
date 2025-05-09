import { Snowflake } from "@theinternetfolks/snowflake";
import { v4 as uuid4 } from "uuid";

export abstract class Identifier<T> {
  value: T;
  constructor(value?: T) {
    this.value = value ?? this.nextValue();
  }

  protected abstract nextValue(): T;

  equals(that: Identifier<T>): boolean {
    return this.value === that.value;
  }
}

export abstract class UUIDIdentifier extends Identifier<string> {
  protected nextValue(): string {
    return uuid4();
  }
}

export abstract class AutoIncrementIdentifier extends Identifier<number> {
  private static counter = 0;
  private static lock = false;

  protected nextValue(): number {
    while (AutoIncrementIdentifier.lock) {
      // Busy-wait until the lock is released
    }
    AutoIncrementIdentifier.lock = true;
    try {
      return ++AutoIncrementIdentifier.counter;
    } finally {
      AutoIncrementIdentifier.lock = false;
    }
  }
}

export abstract class SnowflakeIdentifier extends Identifier<string> {
  protected nextValue(): string {
    return Snowflake.generate();
  }
}
