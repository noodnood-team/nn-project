# Technical Design Document: Nutrition Estimation Web App (Mobile UI)

## 1. Intent & Scope
Build a streamlined, single-purpose Next.js application that estimates the nutritional content of a food image. 
- **Scope Restrictions:** No authentication required. The UI is exclusively a mobile-aspect-ratio interface (renders fullscreen on mobile devices, and as a centralized phone-dimension container on desktop screens).
- **Core interaction:** A large dropzone/tap-to-upload area. Once uploaded, the image fills the background, and the server calculates the results which animate in smoothly.

## 2. Architecture Overview
We will implement "Approach 1: The Bottom Sheet App Style". 

### Application Shell
- `<MobileFrame>`: A layout wrapper forcing `max-w-md mx-auto h-screen aspect-[9/16]` to maintain a native app feel regardless of the user's device.

### Component Flow
1. **`ImageUploader` (State: IDLE):** Fullscreen drag-and-drop / tap-to-upload zone. 
2. **`AnalyzingOverlay` (State: ANALYZING):** After an image is selected, it displays as the background. An animated loading skeleton or scanning pulse overlays the image while the network request runs.
3. **`ResultsBottomSheet` (State: SUCCESS or ERROR):** Slides up from the bottom of the frame using `framer-motion`. Displays either the macro cards or the backend validation/rejection message.

## 3. Key Interfaces and Contracts

### API Contract (External target: `/api/v1/predict`)
The Request is sent as `multipart/form-data` with a single file parameter `file`.

**Success Payload:**
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

**Non-Food / AI Rejection Payload:**
```json
{
  "ok": false,
  "prediction": null,
  "message": "This doesn't look like a food image. Please upload a photo of a meal."
}
```

### React State Machine
```typescript
type AppState = 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR';

interface NutritionAppState {
  status: AppState;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  results: AnalyzeResponse | null;
}
```

## 4. Edge Cases & Error Handling Strategy
1. **Invalid Uploads:** The backend recognizes non-food items (e.g., uploading a photo of a bicycle) and returns `ok: false, prediction: null`. The UI catches this state, slides up the Bottom Sheet rendering the error `message` gracefully, and provides a "Try Again" button to return to `IDLE`.
2. **Client Validation:** Restrict file inputs to images only and cap the file size prior to `fetch`.
3. **Network Failures:** Hard catch blocks on the `fetch` function to manually drop the state to `ERROR` if the server is unreachable or times out, allowing for retry.
