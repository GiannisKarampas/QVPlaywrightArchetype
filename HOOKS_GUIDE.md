# Pre-commit Hooks Guide

## Overview

This project uses **Husky** to enforce code quality standards before commits and pushes, preventing broken code from entering the repository.

## Why Pre-commit Hooks?

### Benefits

- **Prevent Broken Code** - Catches errors before they reach the repository
- **Enforce Standards** - Ensures all code meets quality standards
- **Save CI Time** - Catches issues locally, not in CI pipeline
- **Team Consistency** - All developers follow same quality checks
- **Faster Feedback** - Immediate feedback vs waiting for CI

### Time Savings

- **Without hooks**: Commit → Push → Wait 5-10 min for CI → Fix → Repeat
- **With hooks**: Fix locally in seconds → Commit → Push → CI passes

---

## Installation

Hooks are **automatically installed** when you run:

```bash
npm install
```

This runs the `prepare` script defined in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

---

## Hook Configuration

### Pre-commit Hook (`.husky/pre-commit`)

Runs on every `git commit` and checks:

1. **TypeScript Type Checking** - Ensures no type errors
2. **ESLint** - Validates code quality and style
3. **Prettier** - Checks code formatting

**When it runs:**

```bash
git add .
git commit -m "Your message"
# ↓ Hook executes automatically
# 🔍 Running pre-commit checks...
# 📘 Type checking...
# 🔧 Linting...
# 💅 Checking code formatting...
# ✅ Pre-commit checks passed!
```

**What happens on failure:**

```bash
# ❌ Type check failed. Please fix TypeScript errors.
# Commit is blocked - you must fix errors first
```

### Pre-push Hook (`.husky/pre-push`)

Runs on every `git push` and checks:

1. **Smoke Tests** - Runs critical path tests (~2 minutes)

**When it runs:**

```bash
git push origin main
# ↓ Hook executes automatically
# 🚀 Running pre-push checks...
# 🧪 Running smoke tests...
# ✅ Pre-push checks passed!
```

**What happens on failure:**

```bash
# ❌ Smoke tests failed. Please fix tests before pushing.
# Push is blocked - you must fix tests first
```

---

## Hook Scripts Breakdown

### Pre-commit Script

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run TypeScript type checking
echo "📘 Type checking..."
npm run type-check || {
  echo "❌ Type check failed. Please fix TypeScript errors."
  exit 1
}

# Run ESLint
echo "🔧 Linting..."
npm run lint || {
  echo "❌ Linting failed. Please fix ESLint errors."
  exit 1
}

# Run Prettier check
echo "💅 Checking code formatting..."
npm run format:check || {
  echo "❌ Code formatting check failed. Run 'npm run format' to fix."
  exit 1
}

echo "✅ Pre-commit checks passed!"
```

### Pre-push Script

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Run smoke tests before push
echo "🧪 Running smoke tests..."
npm run test:smoke || {
  echo "❌ Smoke tests failed. Please fix tests before pushing."
  exit 1
}

echo "✅ Pre-push checks passed!"
```

---

## Fixing Common Hook Failures

### 1. Type Check Failures

**Error:**

```bash
❌ Type check failed. Please fix TypeScript errors.
src/pages/LoginPage.ts:15:20 - error TS2339: Property 'foobar' does not exist
```

**Fix:**

```bash
# See detailed errors
npm run type-check

# Fix the TypeScript errors in your code
# Then try committing again
git commit -m "fix: corrected type errors"
```

### 2. Linting Failures

**Error:**

```bash
❌ Linting failed. Please fix ESLint errors.
/path/to/file.ts
  15:20  error  'foo' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Fix (Auto-fix):**

```bash
# Automatically fix linting issues
npm run lint:fix

# Stage the fixed files
git add .

# Commit again
git commit -m "fix: lint issues"
```

**Fix (Manual):**

```bash
# See all linting errors
npm run lint

# Manually fix the issues in your editor
# Then commit
```

### 3. Formatting Failures

**Error:**

```bash
❌ Code formatting check failed. Run 'npm run format' to fix.
```

**Fix:**

```bash
# Auto-format all files
npm run format

# Stage the formatted files
git add .

# Commit again
git commit -m "style: format code"
```

### 4. Smoke Tests Failures

**Error:**

```bash
❌ Smoke tests failed. Please fix tests before pushing.

  1) [chromium] › ui/auth/login.spec.ts:19:3 › should login @smoke @critical
     Timeout of 30000ms exceeded
```

**Fix:**

```bash
# Run smoke tests locally to see failures
npm run test:smoke

# Debug specific test
npm run test:debug -- tests/ui/auth/login.spec.ts

# Fix the failing tests
# Then try pushing again
git push
```

---

## Bypassing Hooks (Emergency Only)

### Skip Pre-commit Hook

```bash
git commit --no-verify -m "WIP: emergency fix"
```

### Skip Pre-push Hook

```bash
git push --no-verify
```

### When to Bypass (RARE):

1. **Emergency hotfix** - Production is down, need immediate fix
2. **WIP commits** - Saving work in progress (but prefer git stash)
3. **Hook is broken** - The hook script itself has an issue

### When NOT to Bypass:

- "I don't have time to fix errors" ❌
- "Tests are flaky" ❌ (fix the tests!)
- "I'll fix it later" ❌
- "CI will catch it" ❌

---

## Manual Hook Execution

Test hooks without committing/pushing:

```bash
# Test pre-commit hook
./.husky/pre-commit

# Test pre-push hook
./.husky/pre-push
```

---

## Customizing Hooks

### Add More Checks to Pre-commit

Edit `.husky/pre-commit`:

```bash
# Example: Add security audit
echo "🔒 Running security audit..."
npm audit --audit-level=moderate || {
  echo "❌ Security vulnerabilities found."
  exit 1
}
```

### Speed Up Pre-commit (Lint Staged Files Only)

Install `lint-staged`:

```bash
npm install --save-dev lint-staged
```

Update `.husky/pre-commit`:

```bash
# Replace full lint with staged files only
npx lint-staged
```

Create `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

### Change Pre-push to Run Critical Tests

Edit `.husky/pre-push`:

```bash
# Run critical tests instead of smoke
npm run test:critical
```

---

## Troubleshooting

### Hook Not Running

**Problem:** Hook doesn't execute on commit/push

**Solutions:**

1. **Reinstall Husky:**

   ```bash
   npm run prepare
   ```

2. **Check hook permissions:**

   ```bash
   chmod +x .husky/pre-commit .husky/pre-push
   ```

3. **Verify Git hooks directory:**

   ```bash
   git config core.hooksPath
   # Should output: .husky
   ```

4. **Re-install hooks:**
   ```bash
   rm -rf .husky
   npm run prepare
   ```

### Hook Fails on CI

**Problem:** Hook works locally but fails in CI

**Solution:** Ensure CI has same Node version and dependencies

### Hook Too Slow

**Problem:** Pre-commit takes > 30 seconds

**Solutions:**

1. **Use lint-staged** (only check changed files)
2. **Remove slow checks** from pre-commit
3. **Move tests to pre-push** instead of pre-commit

---

## Best Practices

### DO:

1. **Run checks before committing**

   ```bash
   npm run type-check
   npm run lint
   npm run format:check
   # Then commit
   ```

2. **Fix issues immediately** - Don't let them accumulate

3. **Keep hooks fast** - Pre-commit should be < 10 seconds

4. **Run smoke tests locally** before pushing
   ```bash
   npm run test:smoke
   ```

### DON'T:

1. **Don't bypass hooks regularly** - If you're bypassing often, the hook is wrong

2. **Don't add slow checks** to pre-commit - Tests belong in pre-push

3. **Don't ignore hook failures** - They're there for a reason

4. **Don't commit broken code** - Even with --no-verify

---

## Hook Performance

### Pre-commit Hook (~5-10 seconds)

| Check      | Time | Can Skip?                    |
| ---------- | ---- | ---------------------------- |
| Type Check | 3-5s | No - catches critical errors |
| ESLint     | 2-4s | No - code quality essential  |
| Prettier   | 1-2s | No - formatting consistency  |

### Pre-push Hook (~2-5 minutes)

| Check       | Time   | Can Skip?                     |
| ----------- | ------ | ----------------------------- |
| Smoke Tests | 2-5min | No - critical path validation |

**Optimization:**

- Pre-commit: Runs on every commit (fast checks only)
- Pre-push: Runs once before push (can include slower tests)

---

## Integration with CI/CD

### Hook Failures vs CI Failures

**Hooks catch:**

- Type errors
- Linting issues
- Formatting issues
- Critical test failures

**CI also runs:**

- Full regression tests
- Cross-browser tests
- Visual regression
- Performance tests
- Security scans
- Code coverage

**Relationship:**

- Hooks = First line of defense (fast, local)
- CI = Comprehensive validation (slow, remote)

### Example Workflow

```
Developer → Pre-commit (10s) → Commit
         → Pre-push (2min) → Push
         → CI Pipeline (20min) → Merge
```

---

## FAQ

### Q: Can I disable hooks permanently?

**A:** Not recommended. If checks are too slow, optimize them instead.

### Q: What if I need to commit WIP code?

**A:** Use git stash or a WIP branch:

```bash
# Option 1: Stash
git stash push -m "WIP: feature"

# Option 2: WIP branch (no push)
git checkout -b wip/my-feature
git commit -m "WIP"
# Don't push
```

### Q: How do I skip just one check?

**A:** You can't selectively skip. Either pass all checks or use --no-verify.

### Q: Are hooks enforced on the server?

**A:** No, hooks are client-side. Server-side enforcement requires GitHub branch protection or GitLab merge request rules.

### Q: Can I have different hooks per branch?

**A:** Not natively. Use branch name detection in hook scripts.

---

## Summary

**Pre-commit Hooks = Code Quality Gatekeeper**

- ✅ Automatic enforcement
- ✅ Fast feedback
- ✅ Consistent standards
- ✅ Save CI time
- ✅ Catch errors early

**Golden Rule:** Fix locally, commit clean code, push with confidence!

---

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
