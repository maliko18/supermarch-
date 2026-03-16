const axios = require("axios");
const StockService = require("./stock.service");

const AIService = {
  async analyserStock(question) {
    const context = await StockService.getStockSummary();

    const alertesText =
      context.alertes.length > 0
        ? context.alertes
            .map(
              (a) =>
                `  • ${a.nom} (${a.categorie}) : ${a.quantite} unités restantes / seuil : ${a.seuil_alerte}`,
            )
            .join("\n")
        : "  Aucun produit en alerte.";

    const systemPrompt = `Tu es un assistant expert en gestion de stock pour un supermarché. Tu réponds toujours en français, de façon claire, structurée et professionnelle.

📦 ÉTAT ACTUEL DU STOCK :
- Total produits référencés : ${context.total_produits}
- Produits en alerte de stock : ${context.produits_en_alerte}

📊 RÉPARTITION PAR CATÉGORIE :
${context.par_categorie.map((c) => `  • ${c.categorie} : ${c.nb_produits} produits, ${c.stock_total} unités`).join("\n")}

⚠️ PRODUITS EN ALERTE :
${alertesText}

RÈGLES DE RÉPONSE :
- Réponds uniquement sur la base des données ci-dessus.
- Structure tes réponses avec des titres et des listes quand c'est pertinent.
- Donne des conseils concrets et actionnables.
- Utilise un ton professionnel mais accessible.
- Si une question ne concerne pas le stock, rappelle poliment ton rôle.`;

    const response = await axios.post(
      process.env.AI_BASE_URL ||
        "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  },

  async recommanderReapprovisionnement() {
    const question =
      "Quels produits dois-je réapprovisionner en priorité ? Donne-moi une liste ordonnée avec les quantités suggérées.";
    return this.analyserStock(question);
  },
};

module.exports = AIService;
