export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing experience ID' });
  }

  const query = `
    query {
      experience(id: "${id}") {
        id
        buyer {
          id
          email
        }
        plan {
          name
        }
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
      body: JSON.stringify({ query }),
    });

    const json = await response.json();

    if (json.errors) {
      return res.status(404).json({ error: json.errors[0].message });
    }

    res.status(200).json(json.data.experience);
  } catch (error) {
    res.status(500).json({ error: "Internal error", details: error.message });
  }
}
