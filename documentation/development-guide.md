# Development Guide

This guide provides instructions for setting up the development environment and working on the SignEase project.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- Python 3.8 or later
- Git

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd SignEase
```

### Frontend Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The frontend application will be available at `http://localhost:3000`.

### Backend Setup

1. Create a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r scripts/requirements.txt
```

3. Start the Flask server:

```bash
python backend.py
```

The backend API will be available at `http://localhost:5000`.

## Project Structure

### Frontend Structure

```
signease/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components
│   └── sections/         # Page sections
├── pages/                # Next.js pages
│   ├── sign-detection.tsx # Sign detection feature
│   ├── dictionary.tsx    # Sign dictionary
│   └── visualize.tsx     # AI visualization
├── public/               # Static assets
│   └── TechStackVideos/  # Technology demo videos
└── ...
```

### Backend Structure

```
signease/
├── backend.py            # Main Flask application
├── backend_data/         # Data and models
│   ├── data/             # CSV and Parquet files
│   └── models/           # TFLite models
├── saved_videos/         # Directory for uploaded videos
└── public/Visualiser/    # Output directory for visualizations
```

## Development Workflow

### Frontend Development

1. **Component Development**:
   - Create or modify components in the `components/` directory
   - Use Tailwind CSS for styling
   - Test components in isolation before integration

2. **Page Development**:
   - Create or modify pages in the `pages/` directory
   - Use components from the `components/` directory
   - Ensure responsive design for all screen sizes

3. **API Integration**:
   - Use fetch or axios to communicate with the backend API
   - Handle loading, success, and error states
   - Implement proper error handling and user feedback

### Backend Development

1. **API Endpoint Development**:
   - Define new routes in `backend.py`
   - Implement request validation and error handling
   - Return appropriate HTTP status codes and JSON responses

2. **Video Processing**:
   - Modify the `MediaPipeBatchProcessor` class for video processing
   - Ensure proper cleanup of temporary files
   - Optimize for performance where possible

3. **ML Model Integration**:
   - Update the TFLite model in `backend_data/models/`
   - Modify the prediction function to work with the new model
   - Test with various input videos

## Testing

### Frontend Testing

1. **Manual Testing**:
   - Test on different browsers (Chrome, Firefox, Safari)
   - Test on different devices (desktop, tablet, mobile)
   - Test with different input videos

2. **Automated Testing** (if implemented):
   - Run unit tests: `npm test`
   - Run end-to-end tests: `npm run e2e`

### Backend Testing

1. **API Testing**:
   - Use tools like Postman or curl to test API endpoints
   - Verify response format and status codes
   - Test with various input videos

2. **Performance Testing**:
   - Monitor CPU and memory usage during video processing
   - Test with videos of different lengths and resolutions
   - Identify and address bottlenecks

## Code Style and Guidelines

### Frontend Guidelines

1. **TypeScript**:
   - Use TypeScript for all new code
   - Define interfaces for component props
   - Use proper type annotations

2. **Component Structure**:
   - Use functional components with hooks
   - Keep components focused on a single responsibility
   - Extract reusable logic into custom hooks

3. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the existing design system
   - Ensure responsive design for all components

### Backend Guidelines

1. **Python Style**:
   - Follow PEP 8 style guidelines
   - Use type hints where appropriate
   - Document functions and classes with docstrings

2. **Error Handling**:
   - Use try-except blocks for error-prone operations
   - Log errors with appropriate severity levels
   - Return meaningful error messages to the client

3. **Performance**:
   - Optimize CPU-intensive operations
   - Use asynchronous processing where appropriate
   - Clean up temporary files and resources

## Deployment

### Frontend Deployment

1. Build the Next.js application:

```bash
npm run build
# or
yarn build
```

2. Start the production server:

```bash
npm start
# or
yarn start
```

### Backend Deployment

1. Set up a production server with Python and required dependencies.

2. Configure environment variables for production settings.

3. Use a production WSGI server like Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 backend:app
```

4. Set up a reverse proxy (e.g., Nginx) to handle HTTPS and serve static files.

## Troubleshooting

### Common Frontend Issues

1. **Dependency Issues**:
   - Clear npm/yarn cache and reinstall dependencies
   - Check for version conflicts in package.json

2. **Build Errors**:
   - Check TypeScript errors
   - Verify import paths
   - Check for missing dependencies

### Common Backend Issues

1. **MediaPipe Installation**:
   - Follow platform-specific installation instructions
   - Verify OpenCV compatibility

2. **Video Processing Errors**:
   - Check file permissions for video directories
   - Verify video codec compatibility
   - Check for sufficient disk space

3. **TFLite Model Issues**:
   - Verify model file path
   - Check input shape and data type
   - Ensure model compatibility with TFLite version

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
- [TensorFlow Lite Documentation](https://www.tensorflow.org/lite)
