# 🌍 Log Analyzer
> A modern web application for analyzing log files with geographic visualization

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v22.14.0-green?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)

</div>

---

## 📋 Table of Contents
- [Installation Guide](#-installation-guide)
- [Development Mode](#-development-mode)
- [Production Mode](#-production-mode)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Installation Guide

### Prerequisites
Before you begin, ensure you have the following installed:

- **Node.js** (v22.14.0 or higher)
- **Python** (3.x)
- **Git**

## 🏭 Production Mode `#Recommended`

### Method 1: Using Start Script

1. **Clone the Repository**
   ```bash
   git clone {Repo Link}
   cd {Analyzer Folder}
   ```

2. **Prepare Start Script**
  ```bash
   chmod +x start.sh
   ```

3. **Launch Production Server**
   ```bash
   ./start.sh
   ```

   This script will:
   - 🔨 Build the application
   - 📦 Install dependencies
   - 📁 Create required directories
   - 🚀 Start the production server

   Access at: `http://localhost:3001`

## 💻 Development Mode

1. **Install Dependencies**
   ```bash
   # Install Node.js packages
   npm install

   # Install Python requirements
   pip install -r server/requirements.txt
   ```

2. **Start Development Servers**
   ```bash
   npm start
   ```

   This will launch:
   - 🌐 Frontend (Vite): `http://localhost:3000`
   - 🔌 API Server: `http://localhost:3001`
   - 🐍 Python Service: `http://localhost:5000`

## 📁 Project Structure

```
log_analyzer-assignment/
├── favicon.ico #App Logo
├── gen-log.sh  #This file will generate synthetic Access log dataset 
├── Get-logs.py #This file will get the dataset from kaggle(optional)
├── index.html  #This file will load the dashboard
├── package.json #This file holds the project dependencies
├── package-lock.json
├── postcss.config.js
├── README.md
├── start.sh #This file will configure and run the app
├── tailwind.config.js
├── vite.config.js
├── server
│   ├── geo_service.py #Python service that will extract the IP Geolocation
│   ├── index.js
│   ├── prod-server.js #Prod Server that will hand all the process
│   └── requirements.txt #Python Dependencies
└ src
   ├── App.jsx #This file will load the the app on browser
   ├── assets
   │   └── logo.png #University Logo
   ├── components
   │   ├── analysis
   │   │   └── ComparisonGraphs.jsx #Show different Matrix from logs 
   │   ├── analytics
   │   │   └── AnalyticsDashboard.jsx #Log Analysis Board 
   │   ├── common
   │   │   ├── CacheMonitor.jsx #Enabling caching for performance
   │   │   ├── DropZone.jsx #DropDown menu and zone
   │   │   ├── ErrorBoundary.jsx #Error Handling throughout the app
   │   │   ├── Header.jsx #APP Header with different tabs
   │   │   ├── MalformedLogsPopup.jsx #As name suggest
   │   │   ├── ProcessingIndicator.jsx #As name suggest
   │   │   ├── RefreshConfirmDialog.jsx #As name suggest
   │   │   ├── Sidebar.jsx #Sidebar for recent file handling
   │   │   ├── SplashScreen.jsx #As name suggest
   │   │   └── TablesDashboard.jsx #As name suggest
   │   ├── dashboard
   │   │   ├── Dashboard.jsx #As name suggest
   │   │   ├── SecurityMetricCard.jsx #As name suggest
   │   │   └── TrafficGraph.jsx #As name suggest
   │   ├── DeleteConfirmDialog.jsx #As name suggest
   │   ├── FileHistory.jsx #As name suggest
   │   ├── filters
   │   │   ├── FilterSection.jsx #As name suggest
   │   │   └── TimeRangeFilter.jsx #As name suggest
   │   └── security
   │       └── SecurityDashboard.jsx #As name suggest
   ├── constants.jsx
   ├── GeoLite2-Country.mmdb #MaxMinds Geolocation Database
   ├── index.css
   ├── index.jsx
   ├── LogAnalyzer.jsx #Analyze the Logs file
   ├── logWorker.js #Handle big files
   ├── main.jsx
   └── utils
       ├── analyticsProcessing.js #Processing analytics window stats
       ├── cache.js #Handle caching
       ├── errorHandler.js #Define error handling
       ├── errorHandler.jsx #Define error handling
       ├── logProcessing.js #Parsing utility
       ├── streamParser.js #Handling long file junks
       └── uaParser.js #Browser and OS utility parsing Utility

```

## 🔧 Troubleshooting

### Python Issues
- ✔️ Verify Python 3.x installation
- 🔄 Try using `python3` command
- 📦 Check pip installation

### Port Conflicts
- 🔍 Check ports 3000, 3001, 5000
- 🛑 Stop conflicting services
- 🔄 Try different ports

### Database Errors
- 📂 Verify GeoLite2 database location
- 🔑 Check file permissions
- 📋 Validate database format

### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall dependencies
./start.sh
```

---