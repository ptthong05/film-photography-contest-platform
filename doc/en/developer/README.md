# Developer Guide

## 1. Overview
This document provides technical guidelines for the development team of the "AI-powered Film Photography Contest Management Platform".

## 2. Overall Architecture
The system consists of the following components:
- **Frontend (Web):** ReactJS / Vite / TailwindCSS.
- **Frontend (Mobile):** Flutter.
- **Backend:** Spring Boot (Java) or Node.js / ASP.NET.
- **Database:** MongoDB / PostgreSQL.
- **AI Module:** Python (FastAPI/Flask) for Computer Vision.
- **Cloud Storage:** Firebase Storage or Azure Blob.

## 3. Core Business Flows for Implementation
Based on the functional flowchart, Developers must handle the following workflows:
1. **Upload Flow (Participant -> Storage):** Handle large image uploads, extract basic Exif if available, and save metadata to the DB.
2. **AI Verification Flow (Backend <-> AI Module):** Upon upload, Backend calls a webhook to the AI Module to perform `Image Similarity Detection` and `AI-generated Detection`. Results are stored in `aiFlags` within the DB.
3. **Aggregation Flow (Scoring):** Implement cronjobs or triggers to aggregate the `totalScore` once all Judges complete their evaluations.
4. **Archiving Flow:** Automatically migrate or clone winning submissions into the read-optimized Digital Archive structure upon result publication.

## 4. Security & Standards
- Use **JWT** for all API endpoints. Implement Middleware/Filters for Role-Based Access Control (RBAC).
- Strictly adhere to the layered folder structure (Controller -> Service -> Repository). All complex business logic MUST reside in the `service` layer.
