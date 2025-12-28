# Contributing to QV Playwright Archetype

Thank you for your interest in contributing to this project! This document provides guidelines and best practices for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Run tests to verify setup
npm test
```

## Coding Standards

### TypeScript

- Use **strict mode** enabled
- Define explicit types, avoid `any`
- Use interfaces with `I` prefix (e.g., `IUser`)
- Use type aliases for unions and complex types

### Naming Conventions

- **Files**: PascalCase for classes (`LoginPage.ts`), camelCase for utilities (`file.utils.ts`)
- **Classes**: PascalCase (`LoginPage`, `AuthService`)
- **Methods**: camelCase (`clickLoginButton`, `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix (`IUser`, `ITestConfig`)

### Code Style

- Use Prettier for formatting (automated)
- Follow ESLint rules (automated)
- Maximum line length: 100 characters
- Use single quotes for strings
- Add trailing commas

### Comments

- Use JSDoc for public methods
- Explain **why**, not **what**
- Keep comments up-to-date

```typescript
/**
 * Authenticates user and saves session state
 * @param email - User email address
 * @param password - User password
 * @returns Promise<void>
 */
async login(email: string, password: string): Promise<void> {
  // Implementation
}
```

## Testing Guidelines

### Writing Tests

```typescript
test.describe('Feature Name', () => {
  test('should perform specific action', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password');

    // Assert
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Test Structure

- Use `test.describe` for grouping related tests
- Use `test.step` for multi-step tests
- Use `test.beforeEach` for setup
- Use `test.afterEach` for cleanup

### Test Naming

- Start with "should"
- Be descriptive and specific
- Use present tense

Examples:

- ✅ `should display error message with invalid credentials`
- ✅ `should successfully create a new user`
- ❌ `test login`
- ❌ `it works`

### Page Objects

```typescript
export class LoginPage extends BasePage {
  // Define selectors at the top
  private readonly selectors = {
    emailInput: '[data-testid="email"]',
    passwordInput: '[data-testid="password"]',
    loginButton: '[data-testid="login-button"]',
  };

  // Implement methods for user actions
  async login(email: string, password: string): Promise<void> {
    await this.fill(this.selectors.emailInput, email);
    await this.fill(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);
  }
}
```

### API Services

```typescript
export class UserService extends BaseAPI {
  async getUser(userId: string): Promise<IAPIResponse<IUser>> {
    const response = await this.get<IUser>(`/users/${userId}`);
    await this.expectStatusOk(response);
    return response;
  }
}
```

## Pull Request Process

### Before Submitting

```bash
# Run all checks locally
npm run type-check
npm run lint
npm run format
npm test
```

### PR Guidelines

1. **Branch Naming**
   - Feature: `feature/feature-name`
   - Bug fix: `bugfix/issue-description`
   - Hotfix: `hotfix/critical-fix`

2. **Commit Messages**
   - Use conventional commits format
   - Start with type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Examples:
     - `feat: add user registration page object`
     - `fix: resolve timeout issue in login test`
     - `docs: update README with Docker instructions`

3. **PR Description**
   - Describe what changed and why
   - Link related issues
   - Include screenshots for UI changes
   - List breaking changes

4. **Code Review**
   - Address all review comments
   - Keep discussions professional
   - Update PR based on feedback

## Project-Specific Guidelines

### Adding a New Page Object

1. Create file in `src/pages/[feature]/`
2. Extend `BasePage`
3. Define selectors using data-testid
4. Implement user action methods
5. Add corresponding test in `tests/ui/[feature]/`

### Adding a New API Service

1. Create file in `src/services/[domain]/`
2. Extend `BaseAPI`
3. Define methods for API endpoints
4. Add TypeScript interfaces in `src/types/api.types.ts`
5. Add corresponding test in `tests/api/[domain]/`

### Adding Test Data

1. For dynamic data: Create factory in `src/data/factories/`
2. For static data: Add JSON file in `src/data/fixtures/`
3. Use `UserFactory` as example

### Environment Variables

1. Add to `.env.example` with default value
2. Add to all environment files (`.env.dev`, `.env.staging`, `.env.prod`)
3. Update `environment.config.ts` if needed
4. Document in README.md

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

## Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update CONTRIBUTING.md for new processes
- Keep examples up-to-date

## Testing Checklist

Before submitting PR:

- [ ] All tests pass locally
- [ ] Type check passes (`npm run type-check`)
- [ ] Linter passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] No commented-out code
- [ ] Environment variables documented

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Contact maintainers for clarification

Thank you for contributing! 🎉
