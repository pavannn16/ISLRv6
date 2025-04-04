# SignEase - Indian Sign Language Recognition

<div align="center">
  <img src="public/assets/SignEaseLogo.png" alt="SignEase Logo" width="120" />
  <h3>Bridging communication gaps through AI-powered sign language recognition</h3>
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
git clone https://github.com/your-username/signease.git
cd signease
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

### 3. Start the Backend Server

```bash
python backend.py
```

The backend server will start on port 5000.

### 4. Start the Frontend Development Server

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

**For Chrome users**, you can enable insecure localhost by:

1. Navigate to `chrome://flags/#allow-insecure-localhost`
2. Enable the "Allow invalid certificates for resources loaded from localhost" flag
3. Restart Chrome

**For mobile testing**, you can use Chrome's command-line flag:

```bash
# macOS
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-running-insecure-content
```

## 🔄 Maintenance Mode

The application includes a maintenance mode feature that can be toggled by changing the `NEXT_PUBLIC_MAINTENANCE_MODE` environment variable:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true  # Enable maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=false # Disable maintenance mode
```

When maintenance mode is enabled, users will see a maintenance page instead of the application.

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

### Video Processing Errors

If sign detection isn't working:
- Ensure good lighting conditions
- Position yourself clearly in the camera frame
- Try increasing the recording duration for complex signs

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

Project Link: [https://github.com/your-username/signease](https://github.com/your-username/signease)

---

<div align="center">
  <p>Made with ❤️ by the SignEase Team</p>
</div>
