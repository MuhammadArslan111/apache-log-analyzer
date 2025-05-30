#!/bin/bash

# Exit on error
set -e

# Check if Node.js is installed
echo "#---------------------------------------------------#"
echo "#         Checking if Node.js is installed          #"
echo "#---------------------------------------------------#"
echo ""
echo "Checking if Node.js is installed..."

REQUIRED_NODE_VERSION="22.15.0"
REQUIRED_NPM_VERSION="11.3.0"

if ! command -v node &> /dev/null; then
    echo "Node.js not found. Follow these steps:"
    echo "# Download and install nvm:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
    echo "# in lieu of restarting the shell"
    echo "\\. \"$HOME/.nvm/nvm.sh\""
    echo "# Download and install Node.js:"
    echo "nvm install 22"
    echo "# Verify the Node.js version:"
    echo "node -v # Should print \"v${REQUIRED_NODE_VERSION}\"."
    echo "nvm current # Should print \"v${REQUIRED_NODE_VERSION}\"."
    echo "# Verify npm version:"
    echo "npm -v # Should print \"${REQUIRED_NPM_VERSION}\"."
    exit 1
else
    # Checking Node.js version
    CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
    CURRENT_NPM_VERSION=$(npm -v)
    
    if [ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
        echo "Warning: Node.js version mismatch"
        echo "Required: v${REQUIRED_NODE_VERSION}"
        echo "Found: v${CURRENT_NODE_VERSION}"
        echo "Please install the correct version using nvm"
        exit 1
    fi
    
    if [ "$CURRENT_NPM_VERSION" != "$REQUIRED_NPM_VERSION" ]; then
        echo "Warning: npm version mismatch"
        echo "Required: ${REQUIRED_NPM_VERSION}"
        echo "Found: ${CURRENT_NPM_VERSION}"
        echo "Please update npm to the correct version"
        exit 1
    fi
    
    echo "✓ Node.js v${CURRENT_NODE_VERSION} is installed"
    echo "✓ npm ${CURRENT_NPM_VERSION} is installed"
fi


# Check and kill process on port 5000
tput reset
echo "#---------------------------------------------------#"
echo "#                Checking Port 5000                 #"
echo "#---------------------------------------------------#"
echo ""
if netstat -tuln | grep -q ":5000 "; then
    echo "Port 5000 is in use. Attempting to kill the process..."
    pid=$(lsof -t -i:5000)
    if [ ! -z "$pid" ]; then
        kill -15 $pid
        sleep 2
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid
            echo "Process forcefully terminated"
        else
            echo "Process terminated gracefully"
        fi
    else
        echo "No process found on port 5000"
    fi
    sleep 2
else
    echo "Port 5000 is available"
fi

# Check Python installation
tput reset
echo "#---------------------------------------------------#"
echo "#           Checking Python installation            #"
echo "#---------------------------------------------------#"
echo ""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Python not found. Please install Python 3.x"
    exit 1
fi

# adding check for python virtual environment
if [ ! -d "venv" ]; then
    tput reset
    echo "#---------------------------------------------------#"
    echo "#           Creating python virtual environment     #"
    echo "#---------------------------------------------------#"
    echo ""
    python3 -m venv venv
fi

# Activating virtual environment
tput reset
echo "#---------------------------------------------------#"
echo "#           Activating virtual environment          #"
echo "#---------------------------------------------------#"
echo ""
if [ echo $SHELL | grep -q "bash" ]; then
    source venv/bin/activate
elif [ echo $SHELL | grep -q "zsh" ]; then
    source venv/bin/activate
elif [ echo $SHELL | grep -q "fish" ]; then
    source venv/bin/activate.fish
else
    echo "Unsupported shell. Please activate the virtual environment manually"
fi

# Check Python dependencies
tput reset
echo "#---------------------------------------------------#"
echo "#           Installing Python dependencies          #"
echo "#---------------------------------------------------#"
echo ""
$PYTHON_CMD -m pip install -r server/requirements.txt

# Check node_modules and install dependencies
tput reset
echo "#---------------------------------------------------#"
echo "#           Checking Node.js dependencies           #"
echo "#---------------------------------------------------#"
echo ""
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "Node.js dependencies already installed"
fi

# Build the application
tput reset
echo "#---------------------------------------------------#"
echo "#           Building application                    #"
echo "#---------------------------------------------------#"
echo ""
npm run build

# Create necessary directories
# Build the application
tput reset
echo "#---------------------------------------------------#"
echo "#           Setting up directories                  #"
echo "#---------------------------------------------------#"
echo ""
mkdir -p public/uploads

# Wait for the geo service to start
sleep 2

# Start the production server
tput reset
echo "#---------------------------------------------------#"
echo "#                Starting server                    #"
echo "#---------------------------------------------------#"
echo ""
NODE_ENV=production node server/prod-server.js