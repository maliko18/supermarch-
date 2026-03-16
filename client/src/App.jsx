import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import StockNotifications from "./components/StockNotifications";

function App() {
  return (
    <BrowserRouter>
      <StockNotifications />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produits" element={<ProductList />} />
        <Route path="/produits/new" element={<ProductDetail />} />
        <Route path="/produits/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
