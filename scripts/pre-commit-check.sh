#!/bin/bash
# Pre-commit check script for LigaMaster SaaS
# Run this before creating a PR

echo "🔍 Running pre-commit checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# 1. Check for merge conflict markers
echo "📋 Checking for merge conflict markers..."
if grep -r "<<<<<<< HEAD" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null; then
    echo -e "${RED}❌ Found merge conflict markers!${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ No conflict markers found${NC}"
fi

# 2. Run lint
echo "📋 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Linting failed!${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ Linting passed${NC}"
fi

# 3. Run type check
echo "📋 Running TypeScript check..."
npm run typecheck 2>/dev/null || npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript check failed!${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ TypeScript check passed${NC}"
fi

# 4. Run build
echo "📋 Running build..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    FAILED=1
else
    echo -e "${GREEN}✓ Build passed${NC}"
fi

# 5. Check for console.logs (warn only)
echo "📋 Checking for console.log statements..."
LOGS=$(grep -r "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ $LOGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $LOGS console.log statements (remove before production)${NC}"
    grep -r "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
fi

# 6. Check branch naming convention
echo "📋 Checking branch name..."
BRANCH=$(git branch --show-current)
if [[ ! $BRANCH =~ ^(feature|fix|hotfix|release)/[a-z0-9-]+$ ]] && [[ ! $BRANCH =~ ^(main|develop)$ ]]; then
    echo -e "${YELLOW}⚠️  Branch name '$BRANCH' doesn't follow convention:${NC}"
    echo "   Expected: feature/{dominio}/{descripcion} or fix/{dominio}/{descripcion}"
else
    echo -e "${GREEN}✓ Branch name follows convention${NC}"
fi

# Final result
echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to create PR.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix them before creating PR.${NC}"
    exit 1
fi
