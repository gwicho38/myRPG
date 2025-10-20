# Contributing to NeverQuest RPG

Thank you for your interest in contributing to NeverQuest RPG! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/neverquest.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start the development server: `npm start`

## Development Guidelines

### Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` to check for linting errors
- Run `npm run format` to automatically format your code
- Follow the existing code patterns in the codebase

### Testing

- Write tests for new features and bug fixes
- Run `npm test` to execute all tests
- Run `npm run test:watch` for test-driven development
- Aim for high test coverage

### Component System

The template follows an ECS (Entity-Component-System) pattern:

- Components are located in `src/plugins`
- Components should be modular and removable without breaking the game
- Follow the existing component patterns

## Making Changes

1. **Create a Feature Branch**: Always work on a new branch
2. **Write Clean Code**: Follow the coding guidelines
3. **Add Tests**: Include tests for your changes
4. **Update Documentation**: Update JSDoc comments and README if needed
5. **Commit Messages**: Write clear, descriptive commit messages

### Commit Message Format

```
type(scope): brief description

Longer explanation if needed

Fixes #issue-number
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Update your branch with the latest main branch
2. Ensure all tests pass: `npm test`
3. Ensure no linting errors: `npm run lint`
4. Build the project: `npm run build`
5. Create a pull request with a clear description
6. Wait for code review

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots for UI changes
```

## Reporting Issues

- Use the [GitHub Issues](https://github.com/gwicho38/neverquest/issues) page
- Check if the issue already exists
- Provide detailed reproduction steps
- Include error messages and screenshots if applicable

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Check existing documentation
- Review closed issues and PRs

Thank you for contributing to NeverQuest RPG!
