# SignEase - Sign Language Recognition

<div align="center">
  <img src="public/assets/SignEaseLogo.png" alt="SignEase Logo" width="120" />
  <h3>Bridging communication gaps through AI-powered sign language recognition</h3>
  <p>
    <a href="https://pavanchauhan.tech" target="_blank">Live Demo</a> • 
    <a href="https://github.com/pavannn16/ISLRv6" target="_blank">GitHub Repository</a>
  </p>
</div>

## 📖 Overview

SignEase is an AI-powered Indian Sign Language Recognition system that utilizes advanced computer vision and machine learning to provide real-time sign language interpretation. The platform employs frame capture, MediaPipe landmark detection, and neural network analysis to accurately recognize and translate sign language gestures.

## ✨ Features

- **Real-time Sign Recognition**: Capture and interpret sign language gestures with 87% accuracy
- **Interactive User Interface**: Clean, responsive design with intuitive controls
- **Visualization Tools**: See how our AI processes and analyzes your signs
- **Sign Language Dictionary**: Access an extensive library of signs with video examples
- **Cross-Platform Compatibility**: Works on desktop and mobile devices
- **Offline Processing**: Core recognition runs locally in your browser

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python 3.8+ with pip
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/pavannn16/ISLRv6.git
cd ISLRv6
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Install backend dependencies**

```bash
pip install -r scripts/requirements.txt
```

4. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_VERCEL_HOSTED=false
```

## 🛠️ Running the Application

### 1. Find Your IP Address

To allow devices on your local network to connect to your development server, you'll need your local IP address.

**On macOS**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows**:
```bash
ipconfig | findstr IPv4
```

**On Linux**:
```bash
hostname -I
```

Take note of the IP address (e.g., `192.168.0.101`).

### 2. Update Environment Variables

Edit your `.env.local` file to use your IP address:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_API_URL=http://192.168.0.101:5000
NEXT_PUBLIC_VERCEL_HOSTED=false
```

### 3. Configure Model Paths

Before starting the backend server, you might need to adjust the paths to model data in `backend.py`:

Open `backend.py` in your editor and locate the model path constants (usually near the top of the file):

```python
# Model and data paths
# Model and Data Paths (Ensure these are correct)
DUMMY_PARQUET_SKEL_FILE = Path('.../ISLRv6/backend_data/data/239181.parquet')
TFLITE_MODEL_PATH = Path('.../ISLRversions/ISLRv6/backend_data/models/asl_model.tflite')
CSV_FILE_PATH = Path('.../ISLRv6/backend_data/data/train.csv')
CAPTURED_PARQUET_FILE = Path('.../ISLRv6/backend_data/shammers.parquet')

```

Adjust these paths according to your directory structure if needed. Make sure:
- The TensorFlow model file (`.tflite`) is in the specified MODEL_DIR
- The training data and reference files are in DATA_DIR
- The TEMP_DIR exists and is writable for temporary files

### 4. Start the Backend Server

```bash
python backend.py
```

The backend server will start on port 5000.

### 5. Start the Frontend Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📱 Accessing on Other Devices

To access the application from another device on your network:

1. Make sure both devices are on the same network
2. On the other device, open a web browser and navigate to `http://<YOUR_IP_ADDRESS>:3000` (e.g., `http://192.168.0.101:3000`)

### Addressing HTTPS Issues

When accessing the application on other devices, you may encounter security warnings about the connection not being secure. This is because the development server uses HTTP instead of HTTPS.

**For Chrome users**, you have two options:

1. **Enable insecure localhost** (less secure, but easier):
   - Navigate to `chrome://flags/#allow-insecure-localhost`
   - Enable the "Allow invalid certificates for resources loaded from localhost" flag
   - Restart Chrome

2. **Mark specific IP as safe** (recommended for better security):
   - Launch Chrome with a special flag that marks your specific IP address as safe:
   ```bash
   # For macOS
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.0.101:3000" --user-data-dir=/tmp/unsafe-chrome-profile
   
   # For Windows
   start chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.0.101:3000" --user-data-dir=C:\unsafe-chrome-profile
   
   # For Linux
   google-chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.0.101:3000" --user-data-dir=/tmp/unsafe-chrome-profile
   ```
   Replace `192.168.0.101:3000` with your actual IP address and port.

## 🔄 Maintenance Mode

The application includes a maintenance mode feature that can be toggled by changing the `NEXT_PUBLIC_MAINTENANCE_MODE` environment variable:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true  # Enable maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=false # Disable maintenance mode
```

When maintenance mode is enabled, users will see a maintenance page instead of the application.

## 👐 Using the Sign Detection System

### Performance Modes

SignEase can be run in different configurations that affect performance:

1. **Fully Local Mode** (Recommended): 
   - Run both frontend and backend on the same device
   - Provides the fastest response with minimal inference time
   - Ideal for optimal recognition accuracy and user experience

2. **Network Distributed Mode**:
   - Run frontend on one device and backend on another device on the same network
   - Good performance if devices are physically close to the router
   - May introduce slight latency in recognition (100-300ms) depending on network conditions

3. **Remote Mode**:
   - Access the application from a different network
   - Subject to internet speed and latency
   - Use when local installation isn't possible

### Performing Signs Correctly

To get the best results from SignEase:

1. **Position yourself properly**:
   - Ensure your hands are clearly visible in the camera frame
   - Maintain adequate distance (2-3 feet) from the camera
   - Center your body in the frame

2. **Lighting conditions**:
   - Use uniform lighting without strong shadows
   - Avoid backlighting (don't sit with a window behind you)
   - If possible, use diffused natural light or multiple light sources

3. **Sign execution tips**:
   - Perform signs at a moderate pace (not too fast or slow)
   - Exaggerate signs slightly for better detection
   - Hold the final position of each sign for a moment
   - Practice signs using the Dictionary module to learn proper form

4. **Adapting to recognition**:
   - While our model has 87% accuracy, expect a learning curve
   - It may take 2-3 attempts to find the right angle and position
   - Use the Visualize module to see how the AI processes your signs
   - Adjust your signing based on feedback from the system

### Learning and Improving

1. **Use the Dictionary Module**: 
   - Access via the "Learn" button on the sign detection page
   - Browse a comprehensive library of sign language gestures
   - Watch example videos to learn proper form and execution

2. **Explore the Visualize Module**:
   - Access via the "Visualize" button after performing a sign
   - See how your video is transformed into landmarks
   - Understand how the AI processes your movements
   - Use these insights to improve your signing technique

3. **Progressive Learning**:
   - Start with simple signs and gradually progress to more complex ones
   - Practice consistently to improve recognition accuracy
   - Pay attention to hand shape, orientation, and movement patterns

## 🧪 Tech Stack

- **Frontend**: Next.js, React, Framer Motion, Tailwind CSS
- **Backend**: Python, Flask
- **Computer Vision**: MediaPipe, OpenCV
- **Machine Learning**: TensorFlow/PyTorch
- **Media Processing**: WebRTC

## 📋 Project Structure

```
signease/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── backend.py            # Python backend server
├── components/           # React components
│   ├── ui/               # UI components
│   └── sections/         # Page sections
├── pages/                # Next.js pages
│   ├── sign-detection.tsx # Sign detection feature
│   ├── dictionary.tsx    # Sign dictionary
│   └── visualize.tsx     # AI visualization
├── public/               # Static assets
│   └── TechStackVideos/  # Technology demo videos
├── scripts/              # Utility scripts
│   └── requirements.txt  # Python dependencies
└── styles/               # Additional styles
```

## 🛡️ Security Considerations

- **Camera Access**: SignEase requires camera access to function. All video processing happens on your local device.
- **Data Privacy**: No videos are permanently stored unless explicitly saved by the user.
- **Network Security**: When running in network distributed mode, ensure you're on a secure private network.
- **API Exposure**: The backend API should not be exposed to the public internet without proper security measures.

## 🐛 Troubleshooting

### Camera Access Issues

If the camera doesn't work properly:
- Ensure your browser has permission to access the camera
- Try using Google Chrome for the best compatibility
- Check that no other application is using the camera

### Backend Connection Problems

If the frontend can't connect to the backend:
- Verify that the backend server is running
- Check that the `NEXT_PUBLIC_API_URL` in `.env.local` is correct
- Ensure your firewall isn't blocking the connection
- Try restarting both servers

### Video Processing Errors

If sign detection isn't working properly:
- Ensure good lighting conditions
- Position yourself clearly in the camera frame
- Try increasing the recording duration for complex signs
- Check the browser console for error messages

### Recognition Accuracy Issues

If signs aren't being recognized correctly:
- Review the sign execution in the Dictionary module
- Adjust your position, lighting, and hand movements
- Try performing the sign slightly slower and more deliberately
- Use the Visualize module to see if landmarks are being detected correctly

## 🚀 Performance Optimization

- Use a modern browser (Chrome or Firefox recommended)
- Close unnecessary browser tabs and applications
- Consider lowering your camera resolution if experiencing lag
- For best results on mobile devices, use landscape orientation

## 🤝 Contributing

We welcome contributions to SignEase! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

- **Website**: [https://pavanchauhan.tech](https://pavanchauhan.tech)
- **Project Repository**: [https://github.com/pavannn16/ISLRv6](https://github.com/pavannn16/ISLRv6)

---

<div align="center">
  <p>Made with ❤️ by the SignEase Team</p>
</div>
