# LogReg - An Auth Proxy Client

A flexible, reusable authentication client for React applications that integrates with my centralized Multi-Platform Authentication Service. This package provides authentication context, hooks, and form components for managing user authentication across multiple projects.

## Purpose

This package handles the client-side authentication flow by:
- Capturing user credentials through Login/Register forms
- Sending credentials to my centralized Multi-Platform Authentication Service
- Managing JWT tokens and authentication state
- Providing a consistent auth interface across all your projects

The actual authentication logic, OAuth2 integration, and user management happen in your separate Multi-Platform Authentication Service backend.

## Features

- Ready-to-use LoginForm and RegisterForm components with built-in validation
- Customizable field rendering and validation rules
- Authentication context for global auth state management
- TypeScript support with full type definitions
- Token management and automatic refresh handling
- Works with any backend implementing the expected API contract

