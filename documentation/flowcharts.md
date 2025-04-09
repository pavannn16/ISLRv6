# System Flowcharts

This document provides detailed flowcharts for key processes in the SignEase application.

## Sign Detection Process

```mermaid
flowchart TD
    A[User Initiates Sign Detection] --> B[Webcam Capture]
    B --> C[Record Video for N seconds]
    C --> D[Send Video to Backend API]
    D --> E[Backend Processes Video]
    
    subgraph Backend Processing
    E --> F[Extract Frames]
    F --> G[Process with MediaPipe]
    G --> H[Extract Landmarks]
    H --> I[Save to Parquet File]
    I --> J[Run TFLite Model Prediction]
    J --> K[Generate Speech Audio]
    K --> L[Start Visualization Generation]
    end
    
    L --> M[Return Prediction Response]
    M --> N[Frontend Displays Result]
    N --> O[Play Audio of Detected Sign]
    
    subgraph Async Visualization
    L --> P[Generate Original Video]
    L --> Q[Generate Landmarks Overlay]
    L --> R[Generate Landmarks Only]
    end
    
    P --> S[Check Visualization Status]
    Q --> S
    R --> S
    S --> T{Visualizations Ready?}
    T -- Yes --> U[Display Visualization Videos]
    T -- No --> V[Wait and Check Again]
    V --> S
```

## User Interaction Flow

```mermaid
flowchart TD
    A[User Visits Website] --> B[Landing Page]
    B --> C{User Action}
    
    C -- Try SignEase --> D[Sign Detection Page]
    C -- Learn Signs --> E[Dictionary Page]
    C -- See Technology --> F[Visualization Page]
    C -- Explore Sections --> G[Scroll Through Landing Page]
    
    D --> H[Capture Sign]
    H --> I[View Prediction]
    I --> J{Next Action}
    J -- Try Again --> H
    J -- Explore Dictionary --> E
    J -- View Visualizations --> F
    
    E --> K[Browse Sign Dictionary]
    K --> L[Select Sign]
    L --> M[View Sign Details]
    
    F --> N[View Technology Demos]
    N --> O[Explore AI Visualization]
```

## Backend Processing Pipeline

```mermaid
flowchart TD
    A[Receive Video] --> B[Save Video to Disk]
    B --> C[Extract Video Metadata]
    C --> D[Initialize MediaPipe Processor]
    
    D --> E[Load Video Frames]
    E --> F[Process Frames with MediaPipe]
    F --> G[Extract Landmarks]
    G --> H[Create Landmarks DataFrame]
    H --> I[Save to Parquet File]
    
    I --> J[Load TFLite Model]
    J --> K[Preprocess Input Data]
    K --> L[Run Inference]
    L --> M[Process Prediction Results]
    
    M --> N[Generate Speech]
    M --> O[Start Visualization Thread]
    
    subgraph Visualization Thread
    O --> P[Generate Original Video]
    O --> Q[Generate Landmarks Overlay]
    O --> R[Generate Landmarks Only]
    end
    
    N --> S[Return API Response]
    S --> T[Client Receives Prediction]
```

## Data Processing Flow

```mermaid
flowchart TD
    A[Raw Video Input] --> B[Frame Extraction]
    B --> C[MediaPipe Holistic Model]
    
    C --> D[Face Landmarks]
    C --> E[Pose Landmarks]
    C --> F[Left Hand Landmarks]
    C --> G[Right Hand Landmarks]
    
    D --> H[Feature Extraction]
    E --> H
    F --> H
    G --> H
    
    H --> I[Feature Normalization]
    I --> J[Feature Selection]
    J --> K[Create Feature Vector]
    
    K --> L[TFLite Model Input]
    L --> M[Model Inference]
    M --> N[Prediction Probabilities]
    N --> O[Select Highest Probability]
    O --> P[Map to Sign Label]
```

## Visualization Generation Process

```mermaid
flowchart TD
    A[Start Visualization] --> B[Load Original Video]
    
    B --> C[Create Original Video Copy]
    B --> D[Create Landmarks Overlay Video]
    B --> E[Create Landmarks Only Video]
    
    C --> F[Write Original Video]
    
    D --> G[Process Each Frame]
    G --> H[Draw Landmarks on Frame]
    H --> I[Write Overlay Frame]
    
    E --> J[Create Black Background]
    J --> K[Draw Landmarks on Background]
    K --> L[Write Landmarks Only Frame]
    
    F --> M[Save Original Video]
    I --> N[Save Overlay Video]
    L --> O[Save Landmarks Only Video]
    
    M --> P[Notify Completion]
    N --> P
    O --> P
```

## Frontend Component Interaction

```mermaid
flowchart TD
    A[App Entry] --> B[Layout Component]
    B --> C[Page Component]
    
    C --> D[Section Components]
    D --> E[UI Components]
    
    subgraph Sign Detection Page
    F[Webcam Component] --> G[Capture Controls]
    G --> H[Processing State]
    H --> I[Results Display]
    I --> J[Visualization Display]
    end
    
    subgraph Dictionary Page
    K[Search Component] --> L[Sign List]
    L --> M[Sign Detail]
    end
    
    subgraph Visualization Page
    N[Tech Demo Selection] --> O[Video Player]
    O --> P[Technology Explanation]
    end
    
    C -- Home --> D
    C -- Sign Detection --> F
    C -- Dictionary --> K
    C -- Visualization --> N
```
