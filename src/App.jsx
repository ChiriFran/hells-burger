import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import PublicLayout from "./components/PublicLayout";

import { MesaProvider } from "./context/MesaContext";
import { PublicCartProvider } from "./context/PublicCartContext";

import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#fff",
        }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <MesaProvider>
      <PublicCartProvider>
        {user && <AdminLayout />}
        {!user && showLogin && <Login onLogin={() => setShowLogin(false)} />}
        {!user && !showLogin && (
          <PublicLayout onAdminClick={() => setShowLogin(true)} />
        )}
      </PublicCartProvider>
    </MesaProvider>
  );
}
