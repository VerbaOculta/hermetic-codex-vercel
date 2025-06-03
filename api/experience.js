// /api/experience.js
export default async function handler(req, res) {
  const { experienceId } = req.query;

  if (!experienceId) {
    return res.status(400).json({ error: "Missing experienceId" });
  }

  try {
    const response = await fetch("https://api.whop.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`, // añade esta variable en Vercel
      },
      body: JSON.stringify({
        query: `
          query GetExperience($id: ID!) {
            experience(id: $id) {
              id
              name
              membership {
                id
                user {
                  id
                  email
                  firstName
                }
              }
            }
          }
        `,
        variables: {
          id: experienceId,
        },
      }),
    });

    const json = await response.json();
    return res.status(200).json(json.data.experience);
  } catch (error) {
    console.error("Whop API error:", error);
    return res.status(500).json({ error: "Failed to fetch data from Whop" });
  }
}
