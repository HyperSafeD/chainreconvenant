# Contributing to ChainReCovenant

Thank you for your interest in contributing to ChainReCovenant! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Git
- Basic understanding of Solidity and smart contracts
- Familiarity with Hardhat

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Click 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/chainreconvenant.git
   cd chainreconvenant
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Gbangbolaoluwagbemiga/chainreconvenant.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Create Environment File**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

6. **Compile Contracts**
   ```bash
   npm run compile
   ```

7. **Run Tests**
   ```bash
   npm test
   ```

## Development Process

### Branching Strategy

We follow the Git Flow branching model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
# Update your fork
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write Code**
   - Follow coding standards (see below)
   - Keep changes focused and atomic
   - Write meaningful commit messages

2. **Test Your Changes**
   ```bash
   npm test
   npm run test:coverage
   ```

3. **Format Code**
   ```bash
   npm run format
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(covenant): add multi-signature support
fix(terms): correct deadline validation logic
docs(readme): update deployment instructions
test(covenant): add breach detection tests
```

## Coding Standards

### Solidity Guidelines

1. **Contract Structure**
   ```solidity
   // SPDX-License-Identifier: MIT
   pragma solidity ^0.8.20;
   
   /**
    * @title ContractName
    * @dev Description
    */
   contract ContractName {
       // State variables
       // Events
       // Modifiers
       // Constructor
       // External functions
       // Public functions
       // Internal functions
       // Private functions
       // View/Pure functions
   }
   ```

2. **Naming Conventions**
   - Contracts: PascalCase (`ChainReCovenant`)
   - Functions: camelCase (`createAgreement`)
   - Variables: camelCase (`agreementId`)
   - Constants: UPPER_SNAKE_CASE (`MAX_PARTIES`)
   - Private variables: _leadingUnderscore (`_internalCounter`)

3. **Documentation**
   - Use NatSpec comments for all public/external functions
   - Document parameters and return values
   - Include examples where helpful

4. **Gas Optimization**
   - Use appropriate data types
   - Pack storage variables
   - Use events instead of storage when possible
   - Cache storage variables in memory

5. **Security**
   - Follow checks-effects-interactions pattern
   - Use SafeMath (or Solidity 0.8+ overflow protection)
   - Validate all inputs
   - Use appropriate access controls

### JavaScript/Testing Guidelines

1. **Test Structure**
   ```javascript
   describe("ContractName", function () {
     beforeEach(async function () {
       // Setup
     });
     
     describe("functionName", function () {
       it("should do expected behavior", async function () {
         // Test implementation
       });
     });
   });
   ```

2. **Naming**
   - Use descriptive test names
   - Start with "should"
   - Be specific about expected behavior

3. **Coverage**
   - Aim for >90% coverage
   - Test happy paths and edge cases
   - Test error conditions
   - Test access control

## Testing Requirements

### Before Submitting

1. **All Tests Must Pass**
   ```bash
   npm test
   ```

2. **Coverage Requirements**
   ```bash
   npm run test:coverage
   # Check coverage report
   ```

3. **Gas Reporting**
   ```bash
   npm run test:gas
   # Ensure gas usage is reasonable
   ```

4. **Linting**
   ```bash
   npm run lint
   ```

### Writing Tests

1. **Unit Tests**
   - Test individual functions
   - Mock external dependencies
   - Test all code paths

2. **Integration Tests**
   - Test contract interactions
   - Test complete workflows
   - Test on local network

3. **Security Tests**
   - Test access control
   - Test for reentrancy
   - Test overflow/underflow
   - Test edge cases

## Submitting Changes

### Pull Request Process

1. **Update Your Branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Coverage maintained/improved

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
```

### Review Process

1. **Automated Checks**
   - Tests must pass
   - Coverage must be maintained
   - Linting must pass

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Keep discussion focused

3. **Merge**
   - Squash commits if needed
   - Update CHANGELOG.md
   - Delete feature branch after merge

## Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify on latest version
3. Reproduce consistently

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Solidity version:
- Hardhat version:
- Network:
- Node version:

**Additional Context**
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
What other solutions were considered?

**Additional Context**
Any other relevant information
```

## Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: security@chainrecovenant.com (if applicable)
2. Or open a private security advisory on GitHub

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Questions?

- Open a discussion on GitHub
- Join our Discord (if applicable)
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ChainReCovenant! 🎉

