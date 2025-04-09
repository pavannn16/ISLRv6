# Component Structure

This document outlines the component structure of the SignEase frontend application.

## Directory Structure

```
signease/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sidebar.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── tech-card.tsx
│   │   └── ...
│   ├── sections/         # Page sections
│   │   ├── HeroSection.tsx
│   │   ├── ImpactSection.tsx
│   │   ├── TechnologySection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── constants.tsx
│   │   └── ...
│   └── background.tsx    # Background component
├── pages/                # Next.js pages
│   ├── sign-detection.tsx # Sign detection feature
│   ├── dictionary.tsx    # Sign dictionary
│   └── visualize.tsx     # AI visualization
├── lib/                  # Utility functions
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
│   └── use-mobile.ts     # Mobile detection hook
└── public/               # Static assets
    ├── assets/           # Images and icons
    └── TechStackVideos/  # Technology demo videos
```

## Component Hierarchy

### Home Page

```
app/page.tsx
├── Background
├── AnimatePresence (Loading)
├── Navigation
├── HeroSection
├── ImpactSection
├── WhyUsSection
├── TechnologySection
│   └── TechCard (multiple)
├── FAQSection
├── TeamSection
└── ContactSection
```

### Sign Detection Page

```
pages/sign-detection.tsx
├── Background
├── Navigation
├── Main Content
│   ├── Webcam Component
│   ├── Control Panel
│   │   ├── Record Button
│   │   ├── Timer Display
│   │   └── Settings
│   ├── Results Panel
│   │   ├── Prediction Display
│   │   ├── Confidence Meter
│   │   └── Audio Playback
│   └── Navigation Cards
│       ├── Dictionary Link
│       └── Visualize Link
└── Footer
```

### Dictionary Page

```
pages/dictionary.tsx
├── Background
├── Navigation
├── Search Component
├── Sign Categories
└── Sign List
    └── Sign Card (multiple)
```

### Visualization Page

```
pages/visualize.tsx
├── Background
├── Navigation
├── Technology Showcase
│   ├── Video Player
│   └── Technology Description
└── Navigation Buttons
```

## Key Components

### UI Components

1. **Button**
   - Primary, secondary, outline, and ghost variants
   - Size variants: default, sm, lg
   - Icon support

2. **Card**
   - Standard card component with variants
   - TechCard - specialized for technology showcase

3. **Slider**
   - Range input component
   - Used for settings and controls

4. **Sonner**
   - Toast notification component
   - Used for system messages

### Section Components

1. **HeroSection**
   - Main landing section
   - Call-to-action buttons

2. **TechnologySection**
   - Showcases the technology stack
   - Uses TechCard components

3. **TeamSection**
   - Displays team information
   - Uses Card components

4. **FAQSection**
   - Frequently asked questions
   - Uses Accordion component

### Specialized Components

1. **Background**
   - Animated background effect
   - Used across all pages

2. **WebcamComponent**
   - Dynamically imported component
   - Handles camera access and video recording

## Component Props and State

### TechCard Component

```typescript
interface TechCardProps {
  id: string;
  Icon: IconType;
  name: string;
  description: string;
  longDescription: string;
  videoUrl: string;
  demoUrl?: string;
  hideTryButton?: boolean;
  expandedVideo?: boolean;
  onToggleExpand?: () => void;
}
```

### Section Components

```typescript
interface SectionProps {
  contentReady: boolean;
  // Additional props specific to each section
}
```

### WebcamComponent

```typescript
interface WebcamComponentProps {
  onCapture: (videoBlob: Blob) => void;
  isCapturing: boolean;
  onStopCapture: () => void;
  // Additional props for webcam configuration
}
```

## State Management

The application primarily uses React's built-in state management with `useState` and `useEffect` hooks. Key state elements include:

1. **Loading State**
   - Controls the initial loading animation
   - Managed in the root page component

2. **Capture State**
   - Tracks video recording status
   - Managed in the sign-detection page

3. **Prediction State**
   - Stores the prediction results
   - Managed in the sign-detection page

4. **Visualization State**
   - Tracks the status of visualization generation
   - Managed in the sign-detection page

## Component Communication

Components communicate primarily through props and callback functions. The application does not appear to use a global state management solution like Redux or Context API extensively, though the TechCardsProvider suggests some context usage for the technology cards.
