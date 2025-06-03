export default async function handler(req, res) {
  const experienceId = req.query.id;

  if (!experienceId) {
    return res.status(400).json({ error: "Missing experience ID" });
  }

  const query = `
    query GetExperience($id: ID!) {
      experience(id: $id) {
        id
        buyer {
          id
          email
          name
        }
        plan {
          id
          name
        }
        created_at
        expires_at
        metadata
      }
    }
  `;

  try {
    const response = await fetch("https://api.whop.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WHOP_API_KEY}`
      },
      body: JSON.stringify({
        query,
        variables: { id: experienceId }
      }),
    });

    const result = await response.json();

    if (!result.data || !result.data.experience) {
      console.error("Whop API error:", result.errors || result);
      return res.status(404).json({ error: "Experience not found or invalid ID" });
    }

    res.status(200).json(result.data.experience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
