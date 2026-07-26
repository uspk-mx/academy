import type { CombinedError } from "urql"

export interface NormalizedGraphQLError {
    message: string;
    code: string;
    statusCode?: number;
    field?: string;
    isAuthError: boolean;
    isNetworkError: boolean;
    isValidationError: boolean;
    raw?: unknown;
}

export function normalizeGraphQLError(error: CombinedError): NormalizedGraphQLError {
    const firstGraphQLError = error.graphQLErrors[0];
    const code = String(firstGraphQLError?.extensions?.code ?? "UNKNOWN_ERROR");

    const statusCode =
        typeof firstGraphQLError?.extensions?.statusCode === "number"
            ? firstGraphQLError.extensions.statusCode
            : undefined;

    const field =
        typeof firstGraphQLError?.extensions?.field === "string"
            ? firstGraphQLError.extensions.field
            : undefined;

    const isNetworkError = Boolean(error.networkError);
    const isAuthError =
        code === "UNAUTHENTICATED" ||
        code === "FORBIDDEN" ||
        statusCode === 401 ||
        statusCode === 403;

    const isValidationError =
        code === "BAD_USER_INPUT" ||
        code === "VALIDATION_ERROR" ||
        statusCode === 400;

    return {
        message: firstGraphQLError?.message || error.networkError?.message || "Something went wrong",
        code,
        statusCode,
        field,
        isAuthError,
        isNetworkError,
        isValidationError,
        raw: error,
    };
}   