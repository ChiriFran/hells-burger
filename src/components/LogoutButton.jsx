import React from "react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import '../styles/logoutButton.css'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada correctamente");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}
