# Quality Metrics & DORA Dashboard

This document explains the "System Quality" dashboard in the Slotify Admin Console. The dashboard provides real-world evidence of software quality, reliability, and delivery performance.

## Overview

The Quality Metrics dashboard collects data from GitHub Actions to visualize the health of the project's CI/CD pipeline and calculate DORA-style metrics.

### Key Metrics

1.  **CI Health & Reliability**:
    *   **Last CI Status**: Real-time status of the latest `ci.yml` run.
    *   **Success Rate**: Percentage of successful CI runs in the selected period (7, 30, or 90 days).
    *   **Verification Steps**: Status of individual steps like linting, typechecking, backend unit tests, frontend unit tests, integration tests, and E2E tests.

2.  **DORA-Style Approximations**:
    *   **Deployment Frequency**: Calculated as the number of successful CI runs on `main` or `dev` branches per day.
    *   **Lead Time**: Approximated as the average duration from CI run creation to completion for successful builds.
    *   **Change Failure Rate**: Percentage of CI runs that failed.
    *   **Recovery Time**: Average time from a failed build to the next successful build on the same branch.

## Data Source & Limitations

*   **Source**: GitHub REST API (Actions).
*   **Real Data**: All metrics are based on actual workflow runs. No fake or static data is used.
*   **Approximations**: Since this is a portfolio/prototype project, "Deployment" is approximated by successful CI runs on protected branches. In a full production environment, this would be tied to actual production deployments.
*   **Caching**: Results are cached for 5 minutes in the backend to stay within GitHub API rate limits and ensure high performance.

## Security

*   **GitHub Token**: The GitHub Personal Access Token is stored securely in the backend environment variables and never exposed to the frontend.
*   **Authorization**: Access to the Quality Metrics endpoint is restricted to users with `admin` or `owner` roles using NestJS guards.

## Why this matters

This dashboard serves as empirical evidence of:
*   **Operational Excellence**: Consistent successful builds and fast recovery times.
*   **Quality Culture**: High success rates across diverse test suites (unit, integration, E2E).
*   **Delivery Speed**: Metrics showing how quickly changes are validated and ready for deployment.
*   **Transparency**: Clear visibility into the system's current state and historical performance.

## Setup

To enable this dashboard, configure the following environment variables in the backend:
*   `GITHUB_TOKEN`: A Personal Access Token with `actions:read` and `metadata:read` permissions.
*   `GITHUB_OWNER`: The GitHub username or organization name.
*   `GITHUB_REPO`: The repository name.
*   `GITHUB_WORKFLOW_ID`: (Optional) The workflow filename, defaults to `ci.yml`.
