# ANALYTICS_ARCHITECTURE.md

# Artist Analytics Dashboard — Analytics Architecture

## Project Overview

This project is a production-grade Artist Analytics Dashboard developed for Digitalabs.

The platform provides:
- Artist analytics
- Concert analytics
- Revenue tracking
- Audience insights
- Profitability predictions
- Artist comparison
- Growth analytics
- City-wise performance analysis

Tech Stack:
- React
- Node.js / Express
- Prisma ORM
- PostgreSQL

---

# 1. SYSTEM ARCHITECTURE

The analytics system is divided into 3 layers:

## 1.1 Raw Data Layer
Stores actual source data from:
- APIs
- Admin uploads
- CSV ingestion
- Manual entries

These fields are stored permanently in the database.

---

## 1.2 Calculation Layer
Contains all derived metrics and business logic.

Examples:
- Total followers
- Avg ROG
- ROI
- Popularity score
- Sell-through rate

These values are calculated dynamically in backend services.

Location:
```txt
backend/src/services/calculations/