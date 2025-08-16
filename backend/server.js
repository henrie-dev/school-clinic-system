// backend/server.js

import express from 'express';
import path from 'path';
import serveIndex from 'serve-index';
import registerRoute from './routes/register.js';
import clinicSearchInfoRoute from './routes/clinic/clinicSearchInfo.js';
import clinicEditMedicalHistory from './routes/clinic/clinicEditMedicalHistory.js';
import clinicEditPersonalDataRouter from './routes/clinic/clinicEditPersonalData.js';
import studentRoutes from './routes/students.js';
import clinicCensusRoutes from './routes/clinic/clinicCensusForm.js';
import clinicMedicalListRouter from "./routes/clinic/clinicMedicalList.js";
import clinicMedicalAnnualRouter from './routes/clinic/clinicMedicalAnnual.js';
import clinicMedicalAnnualCreateRouter from './routes/clinic/clinicMedicalAnnualCreate.js';
import clinicMedicalConsultCreateRouter from './routes/clinic/clinicMedicalConsultCreate.js';
import clinicMedicalConsultRouter from './routes/clinic/clinicMedicalConsult.js';
import clinicDentalListRouter from './routes/clinic/clinicDentalList.js';
import clinicDentalTreatCreateRouter from './routes/clinic/clinicDentalTreatCreate.js';
import clinicDentalTreatRouter from './routes/clinic/clinicDentalTreat.js';        
import clinicCensusRecordRouter from './routes/clinic1/clinicCensusRecord.js';
import clinicRouter from './routes/clinic1/clinicSchedule.js';

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

app.use(express.json());

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
app.use('/api/students', studentRoutes);
app.use('/api/clinicCensus', clinicCensusRoutes);

// Corrected Medical Records Routing to avoid conflicts
// clinicMedicalListRouter handles fetching lists of records
app.use("/api/medical_records", clinicMedicalListRouter);

// clinicMedicalAnnualCreateRouter handles the creation of annual records
app.use('/api/medical_records/annual', clinicMedicalAnnualCreateRouter);

// clinicMedicalAnnualRouter handles viewing/deleting a single annual record
app.use("/api/medical_records/annual", clinicMedicalAnnualRouter);

// clinicMedicalConsultCreateRouter handles the creation of consultation records
app.use("/api/medical_records/consult", clinicMedicalConsultCreateRouter);

// clinicMedicalConsultRouter handles viewing/deleting a single consultation record
app.use("/api/medical_records/consult", clinicMedicalConsultRouter);

// Original dental routes - these look fine
app.use("/api/dental_records", clinicDentalListRouter);
app.use("/api/dental_records", clinicDentalTreatCreateRouter);
app.use("/api/dental_records", clinicDentalTreatRouter);

// Correctly use the census record router only once
app.use('/api/clinicCensusRecord', clinicCensusRecordRouter);
app.use('/api/clinic', clinicRouter);   //clinicSchedule

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
