import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `log_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith('.log')) {
      cb(null, true);
    } else {
      cb(new Error('Only .log files are allowed'));
    }
  }
});

// At the start of server setup
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, '../public/uploads'),
    path.join(__dirname, '../dist')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this once during server initialization
ensureDirectories();

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Start Python service with error handling
const startPythonService = () => {
  // Trying different Python commands
  const pythonCommands = ['python3', 'python', 'py'];
  let pythonService = null;

  for (const cmd of pythonCommands) {
    try {
      pythonService = spawn(cmd, [path.join(__dirname, 'geo_service.py')]);
      console.log(`Started Python service using ${cmd}`);
      
      pythonService.stdout.on('data', (data) => {
        console.log(`Python service: ${data.toString()}`);
      });

      pythonService.stderr.on('data', (data) => {
        console.error(`Python service error: ${data.toString()}`);
      });

      pythonService.on('error', (err) => {
        console.error(`Failed to start Python service with ${cmd}:`, err);
        pythonService = null;
      });

      if (pythonService) break;
    } catch (error) {
      console.error(`Error starting Python with ${cmd}:`, error);
    }
  }

  if (!pythonService) {
    console.error('Failed to start Python service with any command');
    process.exit(1);
  }

  return pythonService;
};

const pythonService = startPythonService();

// API Routes
app.post('/api/upload', upload.single('logFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.promises.readdir(path.join(__dirname, '../public/uploads'));
    res.json(files.filter(file => file.endsWith('.log')));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add delete endpoint
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(path.join(__dirname, '../public/uploads'), req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: `File ${req.params.filename} not found` 
      });
    }

    // Delete file
    await fs.promises.unlink(filePath);
    res.json({ 
      success: true, 
      message: `File ${req.params.filename} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: `Failed to delete file: ${error.message}` 
    });
  }
});

// Serving index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Starting server
app.listen(PORT, () => {
  console.log(`
    🚀 Server is running!
    
    • Application: http://localhost:${PORT}
    • API Endpoints: http://localhost:${PORT}/api
    • Python Service: http://localhost:5000 (internal)
    
    Serving static files from: ${path.join(__dirname, '../dist')}
    Uploads directory: ${path.join(__dirname, '../public/uploads')}
  `);
});

// Replace the separate handlers with a single one
const cleanup = () => {
  if (pythonService) {
    pythonService.kill();
  }
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup); 