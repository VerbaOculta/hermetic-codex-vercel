// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // para parsear JSON
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta principal que carga el HTML
app.get('/experiences/:experienceId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/portal.html'));
});

// Ruta API que consulta Whop
app.post('/api/experience', async (req, res) => {
  const { experienceId } = req.body;

  const result = await fetch('https://api.whop.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHOP_API_KEY_APP}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetExperience($id: ID!) {
          experience(id: $id) {
            id
            status
            user {
              id
              email
              name
            }
            customFields {
              key
              value
            }
          }
        }
      `,
      variables: { id: experienceId },
    }),
  });

  const json = await result.json();
  res.json(json.data.experience);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
