# Project Report — Cloud-Based Student Assignment Submission & Feedback Portal

## Abstract
The system provides a secure cloud-oriented workflow for assignment creation, submission, grading and feedback. Metadata is stored in a relational database while assignment files are stored in object storage.

## Problem Statement
Paper/email-based submission makes tracking deadlines, versions, feedback and files difficult.

## Objectives
- Centralize assignment workflows.
- Demonstrate cloud authentication, database and object storage.
- Enforce role-based authorization.
- Provide secure file submission and retrieval.
- Demonstrate scalable architecture.

## Existing System
Manual email, local folders and spreadsheets can lead to duplication and inconsistent tracking.

## Proposed System
A React client communicates with a FastAPI REST API. Authentication, relational metadata and object storage are separated into dedicated cloud services.

## Cloud Computing Concepts
SaaS: the portal is consumed through a browser.
PaaS: managed database, authentication, storage and managed application hosting.
IaaS: optional AWS/Azure/GCP VM/container deployment.
Object storage: assignment binaries.
Managed database: structured metadata.
Serverless: an advanced deployment variant can replace FastAPI endpoints with functions.
Scalability: stateless API instances can be replicated while object storage and managed database scale independently.

## Security
Authentication, RBAC, private storage, server-side validation, HTTPS in deployment, environment variables and secure download authorization.

## Testing
Use pytest smoke tests plus manual workflow tests listed in the main project documentation.

## Limitations
No production email service, plagiarism detection or malware scanning in the educational reference.

## Future Scope
Notifications, plagiarism detection, OCR, analytics, audit logs, background queues, antivirus scanning, CDN delivery and serverless processing.
