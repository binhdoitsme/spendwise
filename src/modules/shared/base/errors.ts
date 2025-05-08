export interface DomainError {
  code: string;
  message: string;
}

export function formatError(
  error: DomainError,
  options?: Record<string, any>
): DomainError {
  let newMessage = error.message;
  if (options) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        newMessage = newMessage.replace(`{${key}}`, options[key]);
      }
    }
  }
  return { ...error, message: newMessage };
}
