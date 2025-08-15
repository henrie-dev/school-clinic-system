import express from 'express';
import path from 'path';
import serveIndex from 'serve-index';
import registerRoute from './routes/register.js';
import clinicSearchInfoRoute from './routes/clinicSearchInfo.js';
import clinicEditMedicalHistory from './routes/clinicEditMedicalHistory.js';
import clinicEditPersonalDataRouter from './routes/clinicEditPersonalData.js';
import studentRoutes from './routes/students.js';
import clinicCensusRoutes from './routes/clinicCensusForm.js';
import clinicMedicalListRouter from "./routes/clinicMedicalList.js";
import clinicMedicalCreateRouter from "./routes/clinicMedicalAnnualCreate.js"; 

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-role');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// API Routes
app.use('/api/register', registerRoute);
app.use('/api/clinicSearchInfo', clinicSearchInfoRoute);
app.use('/api/clinicEditMedicalHistory', clinicEditMedicalHistory); 
app.use('/api/clinicEditPersonalData', clinicEditPersonalDataRouter);

// Correctly add the studentRoutes.
app.use('/api/students', studentRoutes);

// Correctly add the clinicCensusRoutes.
app.use('/api/clinicCensus', clinicCensusRoutes);

// Corrected: This single line now handles all sub-routes for medical records.
// This is the key fix to resolve the 405 error.
app.use("/api/medical_records", clinicMedicalListRouter);
app.use("/api/medical_records", clinicMedicalCreateRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'School Clinic API is running', timestamp: new Date().toISOString() });
});

// This new test route should be defined BEFORE the catch-all
// to confirm the server is working and the path is correct.
app.get("/api/test-route", (req, res) => {
    res.json({ success: true, message: "Test route is working!" });
});


// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Directory listing for frontend folder (for development)
app.use('/', serveIndex(path.join(__dirname, '../frontend'), { icons: true }));

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});

export default app;
