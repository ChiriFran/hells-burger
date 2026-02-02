import React, { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import "../styles/login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      onLogin(userCredential.user);
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  const handleBackHome = () => {
    window.location.href = "/"; // o "/home" si ese es tu home
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleEmailLogin}>Iniciar sesión</button>

        <button className="back-home-btn" onClick={handleBackHome}>
          ⬅ Volver al Inicio
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
