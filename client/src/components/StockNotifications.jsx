import { useEffect, useRef, useState } from "react";
import { getAlertes } from "../services/api";

const REMIND_DELAY_MS = 60 * 1000;
const NOTIF_ANIMATION_MS = 260;

function StockNotifications() {
  const [queue, setQueue] = useState([]);
  const [animState, setAnimState] = useState("enter");
  const remindTimeoutsRef = useRef([]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const alertes = await getAlertes();
        if (Array.isArray(alertes) && alertes.length > 0) {
          setQueue(alertes);
        }
      } catch (error) {
        console.error("Erreur chargement notifications stock", error);
      }
    }

    loadAlerts();

    return () => {
      remindTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      remindTimeoutsRef.current = [];
    };
  }, []);

  const currentNotification = queue[0];

  useEffect(() => {
    if (!currentNotification) return;
    setAnimState("enter");
  }, [currentNotification]);

  function closeNotification() {
    setAnimState("leave");
    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, NOTIF_ANIMATION_MS);
  }

  function remindLater() {
    setAnimState("leave");
    setTimeout(() => {
      setQueue((prev) => {
        if (prev.length === 0) return prev;
        const [current, ...rest] = prev;

        const timeoutId = setTimeout(() => {
          setQueue((list) => [...list, current]);
        }, REMIND_DELAY_MS);

        remindTimeoutsRef.current.push(timeoutId);
        return rest;
      });
    }, NOTIF_ANIMATION_MS);
  }

  if (!currentNotification) return null;

  return (
    <div className="stock-notif-overlay" role="alert" aria-live="assertive">
      <div
        className={`stock-notif-card ${animState === "leave" ? "stock-notif-leave" : "stock-notif-enter"}`}
      >
        <div className="stock-notif-header">
          <strong>⚠️ Alerte stock faible</strong>
          <span>{queue.length} en attente</span>
        </div>

        <div className="stock-notif-body">
          <p className="stock-notif-title">{currentNotification.nom}</p>
          <p>
            Catégorie : {currentNotification.categorie_nom || "Non définie"}
          </p>
          <p>
            Stock actuel : <strong>{currentNotification.quantite}</strong> —
            Seuil : <strong>{currentNotification.seuil_alerte}</strong>
          </p>
        </div>

        <div className="stock-notif-actions">
          <button
            className="stock-btn stock-btn-secondary"
            onClick={remindLater}
          >
            Rappeler dans 1 min
          </button>
          <button
            className="stock-btn stock-btn-primary"
            onClick={closeNotification}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockNotifications;
