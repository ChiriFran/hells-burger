import PublicProductos from "./PublicProductos";
import PublicCartSidebar from "./PublicCartSidebar";
import { usePublicCart } from "../context/PublicCartContext";
import logo from "../../assets/logo/logo-con-diablo.jpeg";

import "../styles/publicLayout.css";

export default function PublicLayout({ onAdminClick }) {
  const { setOpen, items } = usePublicCart();

  return (
    <div className="public-root">
      {/* HEADER */}
      <header className="public-header">
        <img className="public-logo" src={logo} alt="Hells Burger" />

        <button className="public-cart-btn" onClick={() => setOpen(true)}>
          {/* Ícono de carrito SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="var(--color-letra)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          {/* Badge con cantidad */}
          {items.length > 0 && (
            <span className="public-cart-badge">{items.length}</span>
          )}
        </button>
      </header>

      <PublicProductos />
      <PublicCartSidebar />

      <button className="public-admin-access-btn" onClick={onAdminClick}>
        {/* Ícono de usuario SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-letra)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
        </svg>
      </button>
    </div>
  );
}
