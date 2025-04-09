# SignEase Architecture Overview

This document provides a high-level overview of the SignEase application architecture.

## System Architecture

SignEase follows a client-server architecture with a clear separation between the frontend and backend components:

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│                                 │      │                                 │
│          Frontend               │      │           Backend               │
│     (Next.js Application)       │◄────►│      (Python Flask API)         │
│                                 │      │                                 │
└─────────────────────────────────┘      └─────────────────────────────────┘
           │                                          │
           │                                          │
           ▼                                          ▼
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│                                 │      │                                 │
│      Client-side Processing     │      │     AI/ML Processing Pipeline   │
│   (React Components, Webcam)    │      │  (MediaPipe, TFLite Model)      │
│                                 │      │                                 │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

## Frontend Architecture

The frontend is built using Next.js with React and follows a component-based architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Application                       │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │                 │  │
│  │    Pages        │  │   Components    │  │     Hooks       │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │                 │  │
│  │     Styles      │  │     Utils       │  │     Lib         │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

The backend is built using Python with Flask and follows a service-oriented architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Flask Application                         │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │                 │  │
│  │   API Routes    │  │  Video Process  │  │  ML Prediction  │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │                 │  │
│  │  Visualization  │  │  Text-to-Speech │  │  Data Storage   │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

The following diagram illustrates the data flow in the SignEase application:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │     │          │
│  Webcam  │────►│  Video   │────►│ MediaPipe│────►│  TFLite  │────►│ Prediction│
│  Capture │     │ Processing│     │ Holistic │     │  Model   │     │  Result  │
│          │     │          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                                          │
                                                                          ▼
┌──────────┐     ┌──────────┐     ┌──────────┐                     ┌──────────┐
│          │     │          │     │          │                     │          │
│  Speech  │◄────│  Audio   │◄────│ Frontend │◄────────────────────│  API     │
│  Output  │     │ Playback │     │ Display  │                     │ Response │
│          │     │          │     │          │                     │          │
└──────────┘     └──────────┘     └──────────┘                     └──────────┘
```

## Key Components

### Frontend Components

1. **Pages**
   - Home Page (`app/page.tsx`)
   - Sign Detection Page (`pages/sign-detection.tsx`)
   - Dictionary Page (`pages/dictionary.tsx`)
   - Visualization Page (`pages/visualize.tsx`)

2. **UI Components**
   - Section Components (Hero, Impact, Technology, etc.)
   - UI Elements (Buttons, Cards, Sliders, etc.)
   - Webcam Component

### Backend Components

1. **API Endpoints**
   - `/predict` - Process video and return sign prediction
   - `/check_visualizations` - Check status of visualization generation
   - `/audio` - Serve generated audio files
   - `/visualizations/<filename>` - Serve visualization videos

2. **Processing Pipeline**
   - MediaPipe Holistic for pose, face, and hand landmark detection
   - TFLite model for sign language prediction
   - Video processing and visualization generation

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python, Flask, MediaPipe, TensorFlow Lite
- **Data Processing**: OpenCV, Pandas, NumPy
- **Visualization**: Custom visualization pipeline
- **Deployment**: (Not specified in the codebase)
