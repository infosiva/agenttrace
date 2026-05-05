# Package Name Decision

## ✅ DECIDED: `agenttrace-sdk`

We've chosen **`agenttrace-sdk`** as our PyPI package name.

## Why This Name?

- ✅ Keeps "agenttrace" branding
- ✅ Clear it's the official SDK
- ✅ Professional and descriptive
- ✅ Easy to remember

## Original Problem

The package name **`agenttrace`** is **already taken on PyPI** by another project:

- **Owner**: TensorStax
- **GitHub**: https://github.com/tensorstax/agenttrace
- **Latest Version**: 0.1.2 (published April 2025)
- **Description**: "A lightweight and hackable tracing/evaluation framework for AI agents and language models"

This is a **different project** with similar functionality, so we cannot use this name.

## Alternative Names Considered

### Option 1: `agenttrace-io` (RECOMMENDED)
**Pros:**
- Aligns with your domain name (agenttrace.io)
- Clear ownership and branding
- Easy to remember: "same as the website"
- Still contains the core "agenttrace" branding

**Cons:**
- Slightly longer than ideal

**Installation:**
```bash
pip install agenttrace-io
```

### Option 2: `tracify-ai`
**Pros:**
- Mentioned in your business model doc as alternative domain
- Clean, modern name
- Easy to type and remember

**Cons:**
- Completely different from current branding
- Would require rebranding website/domain too

**Installation:**
```bash
pip install tracify-ai
```

### Option 3: `@agenttrace/sdk` (Scoped Package)
**Pros:**
- Uses npm-style scoped packages (supported by PyPI)
- Clear that it's YOUR official package
- Can publish multiple related packages under @agenttrace namespace

**Cons:**
- Less common pattern in Python ecosystem
- Requires PyPI organization setup

**Installation:**
```bash
pip install @agenttrace/sdk
```

### Option 4: `agent-trace`
**Pros:**
- Very similar to original name
- Clean, simple

**Cons:**
- Might still cause confusion with existing "agenttrace"
- Need to check if available

**Installation:**
```bash
pip install agent-trace
```

## Recommendation

**Go with `agenttrace-io`**

This is the best choice because:
1. ✅ Maintains your branding
2. ✅ Clearly yours (matches domain)
3. ✅ Professional and memorable
4. ✅ No confusion with existing package

## Files That Need Updating Once You Choose

1. **`packages/sdk-python/pyproject.toml`** - Line 6: `name = "agenttrace"`
2. **`packages/sdk-python/README.md`** - Installation instructions
3. **`apps/dashboard/src/app/page.tsx`** - Installation examples
4. **`apps/dashboard/src/app/docs/page.tsx`** - Documentation examples
5. **`README.md`** - Root installation instructions
6. **`GETTING_STARTED.md`** - If it has install instructions

## Current Status

All installation instructions have been updated to install from GitHub source:
```bash
pip install git+https://github.com/agenttrace/agenttrace.git#subdirectory=packages/sdk-python
```

This works for now, but once you choose a name and publish to PyPI, you can update to:
```bash
pip install agenttrace-io  # or whatever name you choose
```

## ✅ Completed Updates

All files have been updated with the new package name:
- ✅ `packages/sdk-python/pyproject.toml` - Package name changed to "agenttrace-sdk"
- ✅ `packages/sdk-python/README.md` - Installation instructions updated
- ✅ `apps/dashboard/src/app/page.tsx` - Website installation examples updated
- ✅ `apps/dashboard/src/app/docs/page.tsx` - Documentation examples updated
- ✅ `README.md` - Root installation instructions updated

## Next Steps: Publishing to PyPI

### 1. Verify Package Name Availability

```bash
pip search agenttrace-sdk
# Or check: https://pypi.org/project/agenttrace-sdk/
```

### 2. Build the Package

```bash
cd packages/sdk-python

# Install build tools
pip install build twine

# Build distribution files
python -m build
```

### 3. Test on TestPyPI (Recommended)

```bash
# Upload to TestPyPI first
python -m twine upload --repository testpypi dist/*

# Test installation
pip install --index-url https://test.pypi.org/simple/ agenttrace-sdk
```

### 4. Publish to PyPI

```bash
# Upload to production PyPI
python -m twine upload dist/*

# Verify
pip install agenttrace-sdk
```

### 5. Set Up PyPI API Token

1. Go to https://pypi.org/manage/account/token/
2. Create a new API token
3. Save it securely (you'll need it for publishing)
4. Use it when prompted by twine

### 6. Configure for GitHub Actions (Optional)

Create `.github/workflows/publish.yml` for automated publishing:

```yaml
name: Publish to PyPI

on:
  release:
    types: [created]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    - name: Install dependencies
      run: |
        pip install build twine
    - name: Build package
      run: python -m build
      working-directory: packages/sdk-python
    - name: Publish to PyPI
      env:
        TWINE_USERNAME: __token__
        TWINE_PASSWORD: ${{ secrets.PYPI_API_TOKEN }}
      run: python -m twine upload dist/*
      working-directory: packages/sdk-python
```

## Installation

Once published, users can install with:

```bash
pip install agenttrace-sdk
```
