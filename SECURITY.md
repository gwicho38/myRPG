# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of Neverquest seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:

- Open a public GitHub issue for security vulnerabilities
- Discuss the vulnerability in public forums, chat rooms, or mailing lists

### Please DO:

1. **Email**: Send details to the repository maintainers via GitHub
2. **Include**:
    - Description of the vulnerability
    - Steps to reproduce the issue
    - Potential impact
    - Suggested fix (if available)

### What to Expect:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Depends on severity
    - Critical: 1-7 days
    - High: 7-14 days
    - Medium: 14-30 days
    - Low: 30-90 days

### Disclosure Policy:

- Security vulnerabilities will be disclosed after a fix is available
- We will credit security researchers (unless they prefer to remain anonymous)
- We follow responsible disclosure practices

## Security Best Practices

When using this template:

1. **Dependencies**: Regularly update dependencies

    ```bash
    npm audit
    npm update
    ```

2. **Environment Variables**: Never commit `.env` files with sensitive data

3. **API Keys**: Store API keys securely, not in source code

4. **User Input**: Always validate and sanitize user input

5. **Build Artifacts**: Don't commit `node_modules/`, `dist/`, or build artifacts

## Automated Security

This repository uses:

- **Dependabot**: Automatic dependency updates
- **CodeQL**: Static analysis for code vulnerabilities
- **npm audit**: Checks for known vulnerabilities in dependencies
- **Trivy**: Container and filesystem vulnerability scanning

## Security Contacts

For security issues, please contact the maintainers through:

- GitHub Issues (for non-security bugs)
- GitHub Security Advisories (for security vulnerabilities)
- Repository discussions (for general questions)

## Acknowledgments

We appreciate the security research community's efforts in keeping this project safe. Thank you to all researchers who responsibly disclose vulnerabilities.
