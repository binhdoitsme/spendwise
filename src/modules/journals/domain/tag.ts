export class Tag {
  constructor(private _name: string) {}
  
  get name(): string {
    // Capitalize each word
    return this._name
      .normalize()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  get id() {
    return this.name.toLowerCase().replace(" ", "-");
  }

  equals(other: Tag): boolean {
    return this.id === other.id;
  }
}
