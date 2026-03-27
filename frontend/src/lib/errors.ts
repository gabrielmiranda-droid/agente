export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente.") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
