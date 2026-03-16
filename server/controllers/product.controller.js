const StockService = require("../services/stock.service");

function toCsvValue(value) {
  if (value == null) return "";
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

const ProductController = {
  async getAll(req, res) {
    try {
      const products = await StockService.getAllProducts(req.query);
      res.json(products);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des produits" });
    }
  },

  async exportCsv(req, res) {
    try {
      const produits = await StockService.getAllProducts(req.query);
      const headers = [
        "id",
        "nom",
        "categorie",
        "prix",
        "quantite",
        "seuil_alerte",
        "code_barres",
        "emplacement",
      ];
      const rows = produits.map((p) => [
        p.id,
        p.nom,
        p.categorie_nom,
        p.prix,
        p.quantite,
        p.seuil_alerte,
        p.code_barres,
        p.emplacement,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(toCsvValue).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="produits_export.csv"',
      );
      res.send(`\uFEFF${csvContent}`);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'export CSV" });
    }
  },

  async getById(req, res) {
    try {
      const product = await StockService.getProductById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Produit non trouvé" });
      res.json(product);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du produit" });
    }
  },

  async create(req, res) {
    try {
      const {
        nom,
        prix,
        quantite,
        seuil_alerte,
        code_barres,
        emplacement,
        categorie_id,
      } = req.body;
      if (!nom || prix == null || quantite == null) {
        return res
          .status(400)
          .json({ error: "Nom, prix et quantité sont obligatoires" });
      }
      const product = await StockService.createProduct({
        nom,
        prix,
        quantite,
        seuil_alerte,
        code_barres,
        emplacement,
        categorie_id,
      });
      await StockService.logProductAction({
        action: "CREATE",
        produit_id: product.id,
        produit_nom: product.nom,
        actor: req.headers["x-user"] || "StockManager",
        details: `Création produit (${product.quantite} unités, ${product.prix} €)`,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
  },

  async update(req, res) {
    try {
      const {
        nom,
        prix,
        quantite,
        seuil_alerte,
        code_barres,
        emplacement,
        categorie_id,
      } = req.body;
      if (!nom || prix == null || quantite == null) {
        return res
          .status(400)
          .json({ error: "Nom, prix et quantité sont obligatoires" });
      }
      const product = await StockService.updateProduct(req.params.id, {
        nom,
        prix,
        quantite,
        seuil_alerte,
        code_barres,
        emplacement,
        categorie_id,
      });
      await StockService.logProductAction({
        action: "UPDATE",
        produit_id: product.id,
        produit_nom: product.nom,
        actor: req.headers["x-user"] || "StockManager",
        details: `Mise à jour produit (${product.quantite} unités, ${product.prix} €)`,
      });
      res.json(product);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour du produit" });
    }
  },

  async delete(req, res) {
    try {
      const product = await StockService.getProductById(req.params.id);
      const deleted = await StockService.deleteProduct(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: "Produit non trouvé" });

      if (product) {
        await StockService.logProductAction({
          action: "DELETE",
          produit_id: product.id,
          produit_nom: product.nom,
          actor: req.headers["x-user"] || "StockManager",
          details: "Suppression produit",
        });
      }

      res.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression du produit" });
    }
  },

  async getLowStock(req, res) {
    try {
      const products = await StockService.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des alertes stock" });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await StockService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des catégories" });
    }
  },

  async getJournal(req, res) {
    try {
      const logs = await StockService.getJournal(req.query.limit);
      res.json(logs);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du journal" });
    }
  },
};

module.exports = ProductController;
