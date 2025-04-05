# API Documentation

This document provides detailed information about the backend API endpoints used in the SignEase application.

## API Overview

The SignEase backend is built using Python with Flask and provides several endpoints for video processing, sign language detection, and visualization generation.

Base URL: Determined by deployment environment (typically `http://localhost:5000` for local development)

## Endpoints

### 1. Predict Sign

Processes a video and returns the predicted sign.

**Endpoint:** `/predict`

**Method:** POST

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `video` (File, required): The video file containing the sign to be detected

**Response:**
```json
{
  "sign": "hello",
  "confidence": 0.95,
  "audio_url": "/audio",
  "visualization_status": "processing",
  "recording_duration": 3.5
}
```

**Response Fields:**
- `sign` (String): The predicted sign
- `confidence` (Number): Confidence score between 0 and 1
- `audio_url` (String): URL to the generated audio file
- `visualization_status` (String): Status of visualization generation ("processing" or "complete")
- `recording_duration` (Number): Duration of the recorded video in seconds

**Error Responses:**
- 400 Bad Request: No video uploaded or invalid video format
- 500 Internal Server Error: Error processing video or generating prediction

**Example Usage:**
```javascript
const formData = new FormData();
formData.append('video', videoBlob, 'captured_video.mp4');

const response = await fetch(`${BACKEND_API_URL}/predict`, {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

### 2. Check Visualizations

Checks if visualization videos are available and returns their URLs.

**Endpoint:** `/check_visualizations`

**Method:** GET

**Response (Processing):**
```json
{
  "status": "processing"
}
```

**Response (Complete):**
```json
{
  "status": "complete",
  "visualization_videos": {
    "original": "http://localhost:5000/visualizations/captured_video_original.mp4",
    "landmarks_overlay": "http://localhost:5000/visualizations/captured_video_landmarks_overlay.mp4",
    "landmarks_only": "http://localhost:5000/visualizations/captured_video_landmarks_only.mp4"
  }
}
```

**Response Fields:**
- `status` (String): Status of visualization generation ("processing" or "complete")
- `visualization_videos` (Object): URLs to the generated visualization videos (only when status is "complete")
  - `original` (String): URL to the original video
  - `landmarks_overlay` (String): URL to the video with landmarks overlaid
  - `landmarks_only` (String): URL to the video with only landmarks

**Example Usage:**
```javascript
const checkVisualizations = async () => {
  const response = await fetch(`${BACKEND_API_URL}/check_visualizations`);
  const result = await response.json();
  
  if (result.status === "complete") {
    // Display visualization videos
  } else {
    // Check again after a delay
    setTimeout(checkVisualizations, 1000);
  }
};
```

### 3. Get Audio

Serves the generated audio file for the predicted sign.

**Endpoint:** `/audio`

**Method:** GET

**Response:**
- Audio file (MP3 format)

**Error Responses:**
- 404 Not Found: Audio file not found

**Example Usage:**
```javascript
// Direct audio playback
const audio = new Audio(`${BACKEND_API_URL}/audio?t=${Date.now()}`);
audio.play();
```

### 4. Get Visualization Video

Serves a specific visualization video.

**Endpoint:** `/visualizations/<filename>`

**Method:** GET

**URL Parameters:**
- `filename` (String, required): Name of the visualization video file

**Response:**
- Video file (MP4 format)

**Error Responses:**
- 404 Not Found: Visualization file not found
- 403 Forbidden: Attempt to access file outside visualization directory

**Example Usage:**
```javascript
// Display video in video element
const videoElement = document.getElementById('visualization-video');
videoElement.src = `${BACKEND_API_URL}/visualizations/captured_video_landmarks_overlay.mp4`;
```

## Data Processing Flow

1. Client captures video using webcam
2. Video is sent to `/predict` endpoint
3. Backend processes video and extracts landmarks
4. TFLite model predicts the sign
5. Backend generates audio and starts visualization generation
6. Initial response is sent back to client with prediction results
7. Client periodically checks `/check_visualizations` endpoint
8. When visualizations are ready, client displays them

## Error Handling

The API includes error handling for various scenarios:

- Missing or invalid video files
- Processing errors during landmark extraction
- Prediction errors from the TFLite model
- File access errors for visualizations

Errors are returned with appropriate HTTP status codes and error messages in JSON format.

## Security Considerations

- The API validates file paths to prevent directory traversal attacks
- File types are validated to ensure only valid video files are processed
- Error messages are sanitized to avoid exposing sensitive information

## Performance Considerations

- Video processing is CPU-intensive and may take several seconds
- Visualization generation runs in a separate thread to avoid blocking the response
- Clients should implement appropriate timeout handling for long-running requests
