#!/bin/bash

# Setup script for Signeaseenv on Jetson Orin Nano
# This script creates the MLProjects directory, sets up a Python 3.10 virtual environment,
# and clones the ISLRv6 repository

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if script is run as root
if [ "$EUID" -eq 0 ]; then
    print_warning "This script is running as root. It's recommended to run as a regular user."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Set the base directory
BASE_DIR="$HOME/MLProjects"
VENV_DIR="$BASE_DIR/PythonVenv"
VENV_NAME="SigneaseENV"
REPO_URL="https://github.com/pavannn16/ISLRv6.git"
REPO_DIR="$BASE_DIR/ISLRv6"

# Step 1: Create the MLProjects directory if it doesn't exist
print_status "Setting up MLProjects directory..."
if [ -d "$BASE_DIR" ]; then
    print_warning "Directory $BASE_DIR already exists."
else
    mkdir -p "$BASE_DIR"
    print_status "Created directory: $BASE_DIR"
fi

# Step 2: Create the PythonVenv directory if it doesn't exist
print_status "Setting up PythonVenv directory..."
if [ -d "$VENV_DIR" ]; then
    print_warning "Directory $VENV_DIR already exists."
else
    mkdir -p "$VENV_DIR"
    print_status "Created directory: $VENV_DIR"
fi

# Step 3: Check if Python 3.10 is installed
print_status "Checking Python installation..."
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Found $PYTHON_VERSION"
    
    # Check if version is 3.10.x
    if [[ $PYTHON_VERSION != *"3.10"* ]]; then
        print_warning "Python 3.10 is recommended. You have $PYTHON_VERSION"
        read -p "Continue with $PYTHON_VERSION? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please install Python 3.10 and run this script again."
            exit 1
        fi
    fi
else
    print_error "Python 3 not found. Please install Python 3.10 and run this script again."
    exit 1
fi

# Step 4: Install python3-venv if not already installed
print_status "Checking if python3-venv is installed..."
if ! dpkg -l | grep -q python3-venv; then
    print_status "Installing python3-venv..."
    sudo apt-get update
    sudo apt-get install -y python3-venv
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install python3-venv. Please install it manually and run this script again."
        exit 1
    fi
else
    print_status "python3-venv is already installed."
fi

# Step 5: Create the virtual environment
print_status "Creating Python virtual environment: $VENV_NAME..."
VENV_PATH="$VENV_DIR/$VENV_NAME"

if [ -d "$VENV_PATH" ]; then
    print_warning "Virtual environment $VENV_PATH already exists."
    read -p "Do you want to recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$VENV_PATH"
        python3 -m venv "$VENV_PATH"
        print_status "Recreated virtual environment: $VENV_PATH"
    fi
else
    python3 -m venv "$VENV_PATH"
    print_status "Created virtual environment: $VENV_PATH"
fi

# Step 6: Clone the ISLRv6 repository
print_status "Checking for git installation..."
if ! command -v git &>/dev/null; then
    print_status "Installing git..."
    sudo apt-get update
    sudo apt-get install -y git
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install git. Please install it manually and run this script again."
        exit 1
    fi
fi

print_status "Cloning ISLRv6 repository..."
if [ -d "$REPO_DIR" ]; then
    print_warning "Repository directory $REPO_DIR already exists."
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$REPO_DIR"
        git pull
        print_status "Updated repository at $REPO_DIR"
    fi
else
    git clone "$REPO_URL" "$REPO_DIR"
    if [ $? -ne 0 ]; then
        print_error "Failed to clone repository. Please check your internet connection and the repository URL."
        exit 1
    fi
    print_status "Cloned repository to $REPO_DIR"
fi

# Step 7: Install dependencies from requirements file if it exists
if [ -f "$REPO_DIR/jetson/jet_req.txt" ]; then
    print_status "Installing dependencies from jet_req.txt..."
    source "$VENV_PATH/bin/activate"
    pip install --upgrade pip
    pip install -r "$REPO_DIR/jetson/jet_req.txt"
    
    if [ $? -ne 0 ]; then
        print_warning "Some dependencies may have failed to install. Check the output above for details."
    else
        print_status "Dependencies installed successfully."
    fi
    deactivate
else
    print_warning "Requirements file not found at $REPO_DIR/jetson/jet_req.txt"
    print_warning "Skipping dependency installation."
fi

# Final message
print_status "Setup completed successfully!"
print_status "To activate the virtual environment, run:"
echo -e "    ${GREEN}source $VENV_PATH/bin/activate${NC}"
print_status "To deactivate the virtual environment, run:"
echo -e "    ${GREEN}deactivate${NC}"

# Make the script executable
chmod +x "$0"
