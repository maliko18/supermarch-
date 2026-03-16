import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  getProduits,
  getCategories,
  getJournal,
  exportProduitsCsv,
} from "../services/api";
import AIChat from "../components/AIChat";

function getStockStatus(quantite, seuil) {
  if (quantite === 0) return { label: "Rupture", className: "badge-rupture" };
  if (quantite <= seuil) return { label: "Faible", className: "badge-faible" };
  return { label: "En stock", className: "badge-stock" };
}

function ProductList() {
  const [produits, setProduits] = useState([]);
  const [journal, setJournal] = useState([]);
  const [categorieName, setCategorieName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [quantiteMin, setQuantiteMin] = useState("");
  const [quantiteMax, setQuantiteMax] = useState("");
  const [disponibilite, setDisponibilite] = useState("");
  const [sortBy, setSortBy] = useState("nom");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categorie = searchParams.get("categorie");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = {
          categorie,
          prixMin,
          prixMax,
          quantiteMin,
          quantiteMax,
          disponibilite,
          sortBy,
          sortOrder,
        };

        Object.keys(params).forEach((key) => {
          if (!params[key]) delete params[key];
        });

        const [data, cats] = await Promise.all([
          getProduits(params),
          getCategories(),
        ]);
        setProduits(data);
        if (categorie) {
          const cat = cats.find((c) => c.id === parseInt(categorie));
          setCategorieName(cat ? cat.nom : "Produits");
        } else {
          setCategorieName("Tous les produits");
        }
      } catch (err) {
        console.error("Erreur chargement produits", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [
    categorie,
    prixMin,
    prixMax,
    quantiteMin,
    quantiteMax,
    disponibilite,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    async function loadJournal() {
      try {
        const data = await getJournal(12);
        setJournal(data);
      } catch (err) {
        console.error("Erreur chargement journal", err);
      }
    }
    loadJournal();
  }, []);

  const produitsFiltres = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categorie_nom &&
        p.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.code_barres &&
        p.code_barres.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) return <div className="loading">Chargement...</div>;

  async function handleExportCsv() {
    try {
      const params = {
        categorie,
        prixMin,
        prixMax,
        quantiteMin,
        quantiteMax,
        disponibilite,
        sortBy,
        sortOrder,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await exportProduitsCsv(params);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "produits_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Erreur export CSV", err);
    }
  }

  return (
    <div className="product-page">
      <div className="product-list-container">
        <div className="product-list-main">
          <div className="product-list-header">
            <div>
              <Link to="/" className="back-link">
                ← Retour aux catégories
              </Link>
              <h1 className="product-list-title">{categorieName}</h1>
              <p className="product-list-subtitle">
                Gestion de l'inventaire en temps réel
              </p>
            </div>
            <div className="header-actions">
              <button
                className="btn-search"
                onClick={() => setSearchOpen(true)}
              >
                🔍 Rechercher
              </button>
              <button className="btn-search" onClick={handleExportCsv}>
                ⬇️ Export CSV
              </button>
              <button
                className="btn-add"
                onClick={() => navigate("/produits/new")}
              >
                + Ajouter un produit
              </button>
            </div>
          </div>

          <div className="table-toolbar">
            <button className="btn-search" onClick={() => setFiltersOpen(true)}>
              ⚙️ Filtres & tri
            </button>
          </div>

          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>ÉTAT</th>
                  <th>QUANTITÉ</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => {
                  const status = getStockStatus(p.quantite, p.seuil_alerte);
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link
                          to={`/produits/${p.id}`}
                          className="product-name-link"
                        >
                          {p.nom}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="quantity-cell">
                        <span
                          className={
                            p.quantite <= p.seuil_alerte ? "text-danger" : ""
                          }
                        >
                          {p.quantite} unité{p.quantite > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/produits/${p.id}`)}
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {produits.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      Aucun produit trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="journal-card">
            <h3>Journal des actions</h3>
            {journal.length === 0 && (
              <p className="search-empty">Aucune action enregistrée.</p>
            )}
            {journal.map((log) => (
              <div key={log.id} className="journal-item">
                <div>
                  <strong>{log.action}</strong> — {log.produit_nom}
                  <p>{log.details || "Action enregistrée"}</p>
                </div>
                <span>{new Date(log.created_at).toLocaleString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </div>
        <AIChat categorie={categorieName} />
      </div>

      {searchOpen && (
        <div
          className="search-modal-overlay"
          onClick={() => setSearchOpen(false)}
        >
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2>Recherche dans {categorieName}</h2>
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
              {searchTerm && produitsFiltres.length === 0 && (
                <p className="search-empty">
                  Aucun résultat pour "{searchTerm}"
                </p>
              )}

              {produitsFiltres.slice(0, 20).map((p) => (
                <button
                  key={p.id}
                  className="search-result-item search-result-btn"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchTerm("");
                    navigate(`/produits/${p.id}`);
                  }}
                >
                  <div>
                    <strong>{p.nom}</strong>
                    <p>{p.categorie_nom}</p>
                  </div>
                  <span>{p.quantite} unités</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtersOpen && (
        <div
          className="search-modal-overlay"
          onClick={() => setFiltersOpen(false)}
        >
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2>Filtres et tri</h2>
              <button
                className="search-modal-close"
                onClick={() => setFiltersOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="filter-grid">
              <select
                value={disponibilite}
                onChange={(e) => setDisponibilite(e.target.value)}
              >
                <option value="">Disponibilité</option>
                <option value="en_stock">En stock</option>
                <option value="faible">Stock faible</option>
                <option value="rupture">Rupture</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Prix min"
                value={prixMin}
                onChange={(e) => setPrixMin(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Prix max"
                value={prixMax}
                onChange={(e) => setPrixMax(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Qté min"
                value={quantiteMin}
                onChange={(e) => setQuantiteMin(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Qté max"
                value={quantiteMax}
                onChange={(e) => setQuantiteMax(e.target.value)}
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nom">Tri: Nom</option>
                <option value="prix">Tri: Prix</option>
                <option value="quantite">Tri: Quantité</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Ordre: Croissant</option>
                <option value="desc">Ordre: Décroissant</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                className="btn-filter-reset"
                onClick={() => {
                  setPrixMin("");
                  setPrixMax("");
                  setQuantiteMin("");
                  setQuantiteMax("");
                  setDisponibilite("");
                  setSortBy("nom");
                  setSortOrder("asc");
                }}
              >
                Réinitialiser
              </button>
              <button className="btn-add" onClick={() => setFiltersOpen(false)}>
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
