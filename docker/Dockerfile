# Multi-stage build for Playwright tests
FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install browsers (already included in mcr.microsoft.com/playwright image)
# RUN npx playwright install --with-deps

# Set environment variables
ENV CI=true
ENV TEST_ENV=dev

# Create directories for reports
RUN mkdir -p allure-results allure-report playwright-report test-results logs

# Run tests by default
CMD ["npm", "test"]

# Development stage
FROM base AS development
ENV NODE_ENV=development
CMD ["sh"]

# CI stage for running tests
FROM base AS ci
ENV NODE_ENV=production
ENV HEADLESS=true
RUN npm run type-check
CMD ["npm", "run", "test"]

# Report generation stage
FROM base AS reports
RUN npm install -g allure-commandline --save-dev
CMD ["sh", "-c", "npm test && npm run report:allure-generate"]
