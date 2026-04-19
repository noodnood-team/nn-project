# Product Requirements Document: Nutrition Estimation App

## 1. Product Overview
**Objective:** Provide a fast, simple, and efficient way for users to estimate the nutritional content of their meals using image recognition, available via web application and Telegram bot.

**Target Audience:** Individuals looking for quick, frictionless dietary awareness and meal tracking without manual data entry.

## 2. User Journey & Core Interactions
Based on the outlined steps, the system flow is as follows:

1. **Access & Authentication:** The user accesses the app via Web or Telegram. Accounts are authenticated and synced to ensure their estimation history is securely tied to their profile.
2. **Capture & Upload:** The user uploads a clear image of a single food plate.
3. **Automated Analysis:** The system processes the image asynchronously in the background so the user is not forced to wait on a loading screen.
4. **Results Delivery:** The system returns an estimated nutritional profile (Calories, Protein, Carbohydrates, Fat) in a highly readable format.
5. **Review:** The user quickly interprets their meal's profile to make educated dietary choices.
6. **Historical Tracking:** Users can access a log of their past analyses to monitor eating patterns and trends over time.

## 3. Functional Requirements

### 3.1 Platform Access & Authentication
- **Web Interface:** A responsive web application with standard user authentication (e.g., Email/Password, OAuth).
- **Telegram Bot Integration:** A bot that allows authenticated users to upload food images and receive results directly in chat.
- **Account Unification:** A mechanism to link a Telegram account to a web profile, unifying the historical log.

### 3.2 Image Upload & Validation
- **Upload Mechanism:** Support for standard image formats (JPEG, PNG, WebP) with a defined file size limit (e.g., 5-10MB).
- **Input Guidelines:** UI must prompt users to upload images containing a *single food plate* with good lighting for maximum accuracy.
- **Error Handling:** Validate inputs to reject non-images or corrupted files before starting expensive processing tasks.

### 3.3 Nutrition Estimation Engine (Analysis)
- **Background Processing:** Image processing must be decoupled from the immediate UI thread using background jobs (e.g., Webhooks/Queues).
- **Core Data Output:** The engine *must* successfully identify the food items and confidently report the macros.
- **Expected API Response:** The API will return a structured JSON payload containing the prediction data and a disclaimer message:
  ```json
  {
    "ok": true,
    "prediction": {
      "calories": 683.0,
      "protein": 68.0,
      "carbs": 19.0,
      "fat": 37.0
    },
    "message": "This result is an estimate based on the uploaded image and may not be 100% accurate."
  }
  ```
- **Fallback:** If the image does not clearly contain food, the system must recognize this and prompt the user to retake the photo.

### 3.4 Results Presentation
- **Data Visualization:** Present the nutritional breakdown clearly.
- **Format:** Mobile-friendly, glanceable summary (e.g., macro progress bars or a simple, standard nutritional label design).

### 3.5 Personal Usage Tracking (History)
- **Database Logging:** A persistent store of past estimations, containing the uploaded image thumbnail, timestamp, and macro breakdown.
- **User Dashboard:** A view where users can scroll through a chronological list of prior estimations.

## 4. Non-Functional Requirements
- **Performance:** Background processing should ideally deliver results fast enough to maintain the feeling of a real-time conversational chat in Telegram (e.g., under 10 seconds).
- **Usability:** The interface must require near-zero setup or learning curve to submit an image.
- **Scalability:** The background queue must be able to scale to handle sudden bursts of concurrent image uploads (e.g., dinner time spikes).
- **Data Privacy:** User food logs and images must be securely stored and isolated per user account.

## 5. Next Steps (PM Action Items)
To move into implementation, the following PM & Technical tasks are required:
1. **API Contract Definition:** Draft the webhook and polling/WebSocket contracts for the async image processing.
2. **Architecture & Stack Selection:** Decide on the specific AI/CV platform (OpenAI Vision, custom model vs existing food API) and message broker (Redis/SQS).
3. **Database Schema Design:** Structure the `Users`, `TelegramIntegrations`, and `NutritionLogs` tables.
4. **UX/UI Mockups:** Wireframe the file upload screens, Telegram bot dialogue flow, and the results dashboard.
