import express from 'express';
import path from 'path';
import serveIndex from 'serve-index';
import registerRoute from './routes/register.js';

const app = express();
const PORT = 3000;
const __dirname = path.resolve();

// Middleware to parse JSON
app.use(express.json());

// Mount register API route
app.use('/api/register', registerRoute);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Directory listing for frontend folder
app.use('/', serveIndex(path.join(__dirname, '../frontend'), { icons: true }));
app.get('/api/test', (req, res) => res.send('API is working'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
