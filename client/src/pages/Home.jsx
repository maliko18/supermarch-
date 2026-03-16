import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getProduits } from "../services/api";

const CATEGORY_ICONS = {
  "Produits Frais": { icon: "🌿", color: "#e8f5e9", iconColor: "#43a047" },
  "Épicerie Sucrée": { icon: "🎂", color: "#fce4ec", iconColor: "#e91e63" },
  "Épicerie Salée": { icon: "🍴", color: "#fff3e0", iconColor: "#ef6c00" },
  Boissons: { icon: "🥤", color: "#e3f2fd", iconColor: "#1976d2" },
  "Hygiène & Beauté": { icon: "✂️", color: "#e0f2f1", iconColor: "#00897b" },
  "Entretien & Maison": { icon: "🏠", color: "#f3e5f5", iconColor: "#8e24aa" },
  "Boulangerie & Pâtisserie": {
    icon: "🥖",
    color: "#fbe9e7",
    iconColor: "#d84315",
  },
  Surgelés: { icon: "❄️", color: "#e8eaf6", iconColor: "#3949ab" },
};

function Home() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [allProduits, setAllProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [cats, produits] = await Promise.all([
          getCategories(),
          getProduits(),
        ]);
        setCategories(cats);
        const countMap = {};
        produits.forEach((p) => {
          countMap[p.categorie_id] = (countMap[p.categorie_id] || 0) + 1;
        });
        setCounts(countMap);
        setAllProduits(produits);
      } catch (err) {
        console.error("Erreur chargement catégories", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProduits = allProduits.filter(
    (p) =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categorie_nom &&
        p.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.code_barres &&
        p.code_barres.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <div className="home-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#e8edf5" />
              <rect x="10" y="12" width="20" height="4" rx="2" fill="#4361ee" />
              <rect x="10" y="18" width="20" height="4" rx="2" fill="#4361ee" />
              <rect x="10" y="24" width="14" height="4" rx="2" fill="#4361ee" />
            </svg>
          </div>
          <h1>Gestion de Stock Supermarché</h1>
          <p className="home-subtitle">
            Veuillez sélectionner une catégorie pour gérer l'inventaire et les
            réapprovisionnements.
          </p>
          <div className="home-header-actions">
            <button className="btn-search" onClick={() => setSearchOpen(true)}>
              🔍 Rechercher un produit
            </button>
          </div>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => {
            const style = CATEGORY_ICONS[cat.nom] || {
              icon: "📦",
              color: "#f5f5f5",
              iconColor: "#666",
            };
            return (
              <Link
                key={cat.id}
                to={`/produits?categorie=${cat.id}`}
                className="category-card"
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: style.color }}
                >
                  <span>{style.icon}</span>
                </div>
                <span className="category-name">{cat.nom}</span>
              </Link>
            );
          })}
        </div>
        <footer className="home-footer">
          <span>📋 SYSTÈME DE GESTION CENTRALISÉ</span>
        </footer>
      </div>

      {searchOpen && (
        <div
          className="search-modal-overlay"
          onClick={() => setSearchOpen(false)}
        >
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2>Recherche globale</h2>
              <button
                className="search-modal-close"
                onClick={() => setSearchOpen(false)}
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              className="search-bar"
              placeholder="Tapez un nom, une catégorie ou un code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            <div className="search-results">
              {searchTerm && filteredProduits.length === 0 && (
                <p className="search-empty">
                  Aucun résultat pour "{searchTerm}"
                </p>
              )}

              {filteredProduits.slice(0, 20).map((p) => (
                <Link
                  key={p.id}
                  to={`/produits/${p.id}`}
                  className="search-result-item"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div>
                    <strong>{p.nom}</strong>
                    <p>{p.categorie_nom}</p>
                  </div>
                  <span>{p.quantite} unités</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
