// /api/experience.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing experience ID' });
  }

  try {
    const response = await fetch('https://api.whop.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`, // tu token de producción
      },
      body: JSON.stringify({
        query: `
          query GetExperience($id: ID!) {
            experience(id: $id) {
              id
              name
              createdAt
              customFields {
                key
                value
              }
            }
          }
        `,
        variables: {
          id,
        },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error('Whop API error:', json.errors);
      return res.status(500).json({ error: 'Whop API error', details: json.errors });
    }

    res.status(200).json({ experience: json.data.experience });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
