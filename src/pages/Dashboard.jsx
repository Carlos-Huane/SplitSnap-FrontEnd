import React from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Hola, Carlos 👋</h1>

      {/* Balance */}
      <div className="balance-card">
        <p>Balance total</p>
        <h2>+$1,250.00</h2>
        <span>Te deben en total</span>
      </div>

      {/* Actividad reciente */}
      <div className="activity">
        <h3>Actividad reciente</h3>

        <div className="item">
          <span>🍕 Pizza noche</span>
          <span className="negative">-$283.00</span>
        </div>

        <div className="item">
          <span>🏠 Alquiler abril</span>
          <span className="positive">+$200.00</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions">
        <button className="btn primary">Agregar gasto</button>
        <button className="btn outline">Escanear recibo</button>
      </div>
    </div>
  );
};

export default Dashboard;