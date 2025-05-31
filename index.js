import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/experiences/:experienceId', (req, res) => {
  const { experienceId } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hermetic Codex Experience</title>
      <meta charset="UTF-8" />
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <h1>Bienvenido al Codex Hermético</h1>
      <p>ID de experiencia: <strong>${experienceId}</strong></p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
