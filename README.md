# AI-powered Film Photography Contest Management Platform

## 1. Introduction
**Vietnamese:** Nền tảng tổ chức và quản lý cuộc thi nhiếp ảnh phim tích hợp trí tuệ nhân tạo

### Context
Film photography has experienced a remarkable revival in recent years, attracting a growing community of photographers, photography clubs, educational institutions, and independent film laboratories. Along with this trend, film photography contests have become an important platform for promoting creativity, preserving analog photography culture, and connecting photographers who appreciate traditional photographic techniques.

Unlike digital photography competitions, film photography contests require organizers to manage not only digital image files but also technical information associated with each photograph, such as film stock, camera, lens, film format, development laboratory, scanning process, and, in some cases, negative references or contact sheets. These additional requirements make contest organization significantly more complex.

Currently, many film photography contests are still managed using separate tools such as online forms, spreadsheets, email, cloud storage, and social media. This fragmented approach increases administrative workload, makes submission verification difficult, complicates the judging process, and limits long-term management of contest data. In addition, participants often lack a centralized platform to manage their contest history and film photography portfolios.

Therefore, developing a dedicated management platform for film photography contests is necessary to digitalize contest operations, improve management efficiency, standardize evaluation activities, and establish a centralized archive of film photography works for future exhibitions, education, and community development.

### Proposed Solutions
This project proposes the development of a web and mobile platform that supports the complete management of film photography contests, from contest planning and participant registration to submission verification, judging, result publication, and digital archiving.

Unlike conventional photography contest systems, the platform focuses on the characteristics of analog photography. Every submission is accompanied by detailed photographic information, including film stock, camera body, lens, ISO, film format, frame number, developing laboratory, scanning specifications, and optional negative or contact sheet references. These records improve traceability and help organizers verify the authenticity of submitted works.

The platform also provides a dedicated judging environment where judges evaluate photographs using configurable criteria specifically designed for film photography. After each competition, award-winning photographs and their technical information are preserved in a digital archive, creating a valuable resource for future contests, exhibitions, and educational activities.

Artificial Intelligence is incorporated to assist organizers by detecting duplicate submissions, identifying AI-generated images, automatically categorizing photographs, and generating analytical reports that support contest management.

## 2. System Roles

* **Administrator**
  * Manage users and access permissions.
  * Configure system settings.
  * Manage master data.
  * Monitor platform activities.
  * Maintain contest configurations.

* **Contest Organizer**
  * Create and configure photography contests.
  * Define contest categories and judging criteria.
  * Manage participant registrations.
  * Verify contest submissions.
  * Assign judges.
  * Publish contest results.
  * Manage awards and online exhibitions.

* **Judge**
  * Review assigned submissions.
  * Evaluate photographs based on contest criteria.
  * Provide comments and scores.
  * Participate in multiple judging rounds.
  * Confirm final evaluation results.

* **Participant (Film Photographer)**
  * Manage personal profiles.
  * Register for contests.
  * Submit photographs.
  * Maintain film roll and frame information.
  * Track submission status.
  * Receive contest results and feedback.

## 3. AI Integration
Apply Artificial Intelligence to support submission verification and improve contest management efficiency. AI Applications such as:
* Detect duplicate or highly similar photographs.
* Identify AI-generated images.
* Automatically generate keywords and categorize photographs.
* Produce statistical reports and contest analytics.

### Research-Based Learning (RBL) - Research Topics
* Digital Asset Management
* Computer Vision
* AI-generated Image Detection
* Image Similarity Detection
* Online Contest Management Systems

## 4. Functional Requirements

### Business Core Flows
* **Core Flow 1. Contest Planning and Configuration**
  Contest organizers create new competitions by defining contest themes, categories, submission periods, judging schedules, evaluation criteria, award structures, and competition regulations. The platform supports reusable templates that simplify the organization of recurring contests while allowing different rules for each event.
* **Core Flow 2. Film Submission and Metadata Management**
  Participants submit photographs together with complete technical information describing how each image was created. Besides uploading scanned photographs, users record details such as film brand, film stock, ISO, camera, lens, frame number, shooting location, developing laboratory, and scanning specifications. The platform maintains the relationship between film rolls, individual frames, and contest submissions, providing comprehensive documentation for every photographic work.
* **Core Flow 3. Submission Verification**
  Before judging begins, the platform verifies whether each submission satisfies contest requirements. The system checks file formats, image quality, submission deadlines, and completeness of technical information. AI-assisted verification helps identify duplicate images, detect AI-generated content, and flag suspicious submissions for manual review by contest organizers.
* **Core Flow 4. Judging and Evaluation Management**
  Contest organizers assign judges according to competition categories or judging rounds. Judges evaluate photographs using configurable scoring criteria, including artistic creativity, composition, storytelling, technical execution, film grain, tonal range, color rendering, and scan quality. The platform automatically aggregates scores, ranks submissions, and preserves detailed evaluation records for transparency.
* **Core Flow 5. Result Publication and Digital Archive**
  After judging is completed, the platform calculates final rankings and publishes official contest results. Award-winning photographs are preserved in a digital archive together with technical metadata, judging comments, contest information, and historical records. This archive serves as a long-term resource for exhibitions, educational activities, and future competitions.

## 5. Non-Functional Requirements
* Authentication and authorization shall be implemented using JWT with role-based access control.
* Images and digital assets shall be securely stored using cloud storage services.
* The software architecture shall follow a modular design to facilitate scalability and maintenance.
* The platform shall support multiple simultaneous contests and concurrent judging activities.

## 6. Technology Stack
* **Web Application:** ReactJS / Next.js
* **Mobile Application:** Flutter
* **Backend:** Java Spring Boot
* **Database:** PostgreSQL or MySQL
* **AI Integration:** Computer Vision, OpenAI API, Image Similarity Detection
* **Cloud Storage:** Firebase Storage or Azure Blob Storage
* **Cloud Deployment:** Microsoft Azure / Firebase
* **Version Control:** GitHub

*The project integrates Software Engineering, Digital Asset Management, Computer Vision, Artificial Intelligence, and Cloud Computing to develop a specialized platform for organizing and managing film photography contests in real-world environments.*

## 7. Products (Expected Deliverables)
* A web-based management portal for contest organizers and judges.
* A web/mobile application for participants to register and submit film photographs.
* An administration system for platform management.
* An AI module supporting submission verification and contest analytics.
* A digital archive containing award-winning photographs and historical contest records.

## 8. Proposed Tasks
| No. | Task |
| :--- | :--- |
| 1 | Requirement analysis, system architecture design, database design, and backend API development |
| 2 | Develop the participant web/mobile application, including profile management, contest registration, film submission, and submission tracking |
| 3 | Develop the organizer and judge portal, including contest configuration, submission management, judging workflows, reporting, and digital archive management |
| 4 | Research and integrate AI models for duplicate image detection, AI-generated image detection, automatic image categorization, and contest analytics |
| 5 | System integration, testing, deployment, technical documentation, and final Capstone report |
