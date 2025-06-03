// /api/experience.js

export default async function handler(req, res) {
  const { experienceId } = req.query;

  const response = await fetch('https://api.whop.com/api/v2/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          experience(id: "${experienceId}") {
            id
            customer {
              id
              email
              name
            }
          }
        }
      `,
    }),
  });

  const result = await response.json();
  res.status(200).json(result.data.experience);
}
