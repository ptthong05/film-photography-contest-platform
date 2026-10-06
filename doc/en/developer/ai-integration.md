# AI INTEGRATION GUIDE

## 1. Introduction
This document provides instructions for Backend/Frontend Developers on how to interact with the internal AI Module when a Participant uploads a submission.

## 2. AI Module API Endpoint (Internal)
The Backend should call this endpoint asynchronously after the image is successfully saved to Cloud Storage.

- **Endpoint:** `POST http://ai-module:8000/analyze`
- **Headers:** `Authorization: Bearer <Internal_Service_Token>`

### Request Payload
```json
{
  "submissionId": "65b4c1a2d3e4f50012abc",
  "imageUrl": "https://storage.provider.com/images/film_scan_01.jpg",
  "metadata": {
    "filmStock": "Kodak Portra 400",
    "camera": "Canon AE-1"
  }
}
```

### Response Payload
```json
{
  "submissionId": "65b4c1a2d3e4f50012abc",
  "aiFlags": {
    "isDuplicate": false,
    "duplicateOf": null,
    "isAiGenerated": true,
    "aiConfidenceScore": 0.95
  },
  "autoTags": ["Portrait", "Color", "Outdoor"]
}
```

## 3. Backend Handling Flow
1. The AI request must be executed asynchronously (via Message Queue or Async Thread) to prevent upload timeouts on the Participant's side.
2. Upon receiving the response, the Backend updates the `aiVerification` field in the `Submissions` table.
3. If `isDuplicate == true` or `isAiGenerated == true`: The system automatically changes the submission status to `PENDING_MANUAL_REVIEW` and triggers an urgent notification to the Contest Organizer.
