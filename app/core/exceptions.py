class ApplicationError(Exception):
    """Base exception for expected application failures."""


class AuthenticationError(ApplicationError):
    """Raised when authentication fails."""


class AuthorizationError(ApplicationError):
    """Raised when authorization fails."""


class ExternalServiceError(ApplicationError):
    """Raised when an external integration fails."""


class IntegrationConfigurationError(ApplicationError):
    """Raised when an integration is not configured."""


class NotFoundError(ApplicationError):
    """Raised when a requested resource is not found."""


class ValidationError(ApplicationError):
    """Raised for domain validation failures."""
