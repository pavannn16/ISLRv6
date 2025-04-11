# SigneaseENV Setup Instructions

This document provides instructions for setting up the SigneaseENV environment on a Jetson Orin Nano developer kit.

## Prerequisites

- Jetson Orin Nano developer kit with Linux
- Internet connection
- Basic knowledge of terminal commands

## Setup Script

The `setup_signeaseenv.sh` script automates the following tasks:

1. Creates the MLProjects directory in your home folder
2. Creates a PythonVenv directory inside MLProjects
3. Checks for Python 3.10 installation
4. Installs the python3-venv package if needed
5. Creates a Python virtual environment named SigneaseENV
6. Clones the ISLRv6 repository from GitHub
7. Installs required dependencies from the requirements file

## Running the Setup Script

1. Make the script executable (if not already):
   ```bash
   chmod +x setup_signeaseenv.sh
   ```

2. Run the script:
   ```bash
   ./setup_signeaseenv.sh
   ```

3. Follow any prompts that appear during execution

## Manual Steps (if needed)

If you prefer to set up the environment manually, follow these steps:

1. Create the necessary directories:
   ```bash
   mkdir -p ~/MLProjects/PythonVenv
   ```

2. Install Python 3.10 and python3-venv:
   ```bash
   sudo apt-get update
   sudo apt-get install -y python3 python3-venv
   ```

3. Create the virtual environment:
   ```bash
   python3 -m venv ~/MLProjects/PythonVenv/SigneaseENV
   ```

4. Clone the ISLRv6 repository:
   ```bash
   git clone https://github.com/pavannn16/ISLRv6.git ~/MLProjects/ISLRv6
   ```

5. Install dependencies:
   ```bash
   source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate
   pip install --upgrade pip
   pip install -r ~/MLProjects/ISLRv6/jetson/jet_req.txt
   deactivate
   ```

## Using the Virtual Environment

After setup is complete, you can activate the virtual environment with:

```bash
source ~/MLProjects/PythonVenv/SigneaseENV/bin/activate
```

When you're done working, deactivate the environment with:

```bash
deactivate
```

## Troubleshooting

- **Permission Denied**: If you encounter permission issues, make sure the script is executable with `chmod +x setup_signeaseenv.sh`
- **Python Version**: The script checks for Python 3.10. If you have a different version, you'll be prompted to continue or abort
- **Repository Already Exists**: If the ISLRv6 repository already exists, you'll be prompted to update it or keep the existing version
- **Dependency Installation Failures**: If some dependencies fail to install, check the error messages and try installing them manually

## Project Structure

After running the script, your project structure will look like this:

```
~/MLProjects/
├── PythonVenv/
│   └── SigneaseENV/
│       ├── bin/
│       ├── include/
│       ├── lib/
│       └── ...
└── ISLRv6/
    ├── jetson/
    │   ├── jet_back.py
    │   ├── jet_req.txt
    │   └── ...
    └── ...
```
