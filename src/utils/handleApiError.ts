// src/utils/handleApiError.ts
export function getErrorMessage(err: any): string {
  if (!err) return "❌ Something went wrong. Please try again.";

  // Case 1: if backend gave a more detailed error
  if (err?.data?.error) {
    return err.data.error;
  }

  // Case 2: if backend only gave a message
  if (err?.data?.message) {
    return err.data.message;
  }

  // Case 3: handle status codes
  switch (err?.status) {
    case 400:
      return "⚠️ Invalid request. Please check your input.";
    case 401:
      return "🔒 Unauthorized. Please log in.";
    case 403:
      return "🚫 Access denied.";
    case 404:
      return "❌ Resource not found.";
    case 409:
      return "⚠️ This record already exists.";
    case 422:
      return "⚠️ Some fields are invalid. Please review your input.";
    case 500:
      return "❌ Oops! Something went wrong on the server. Please try again later.";
    case "FETCH_ERROR":
      return "⚠️ Network error. Please check your internet connection.";
    default:
      return "❌ Something went wrong. Please try again.";
  }
}
