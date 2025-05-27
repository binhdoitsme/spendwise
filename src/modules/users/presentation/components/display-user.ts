export function convertToCurrentUser<
  T extends {
    firstName: string;
    lastName: string;
    email: string;
  }
>(user: T, currentUserEmail?: string, youLabel?: string): T {
  if (user.email !== currentUserEmail) {
    return user;
  }
  return {
    ...user,
    firstName: youLabel,
    lastName: "",
  };
}
