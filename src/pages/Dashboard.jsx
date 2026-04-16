import React from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">

      {/* Header */}
      <div className="header">
        <div>
          <h2>Hola, Carlos 👋</h2>
          <p>Bienvenido de vuelta</p>
        </div>

        <div className="user-info">
          <span className="user-name">Carlos García</span>
          <div className="avatar">CG</div>
        </div>
      </div>

      {/* Balance */}
      <div className="balance-card">
        <p className="balance-label">Balance total</p>
        <h1 className="balance-amount">+$1,250.00</h1>
        <span className="balance-sub">Te deben en total</span>
      </div>

      {/* Actividad */}
      <div className="section">
        <div className="section-header">
          <h3>Actividad reciente</h3>
          <span className="link">Ver todo</span>
        </div>

        <div className="activity-list">

          <div className="activity-item">
            <div className="icon">🍕</div>
            <div className="info">
              <p>Pizza noche</p>
              <span>Roomies · Hace 2 horas</span>
            </div>
            <div className="amount positive">+$150.00</div>
          </div>

          <div className="activity-item">
            <div className="icon">🛒</div>
            <div className="info">
              <p>Súper semanal</p>
              <span>Depa 4B · Ayer</span>
            </div>
            <div className="amount negative">-$320.50</div>
          </div>

          <div className="activity-item">
            <div className="icon">🎬</div>
            <div className="info">
              <p>Netflix mensual</p>
              <span>Roomies · Hace 3 días</span>
            </div>
            <div className="amount positive">+$75.00</div>
          </div>

          <div className="activity-item">
            <div className="icon">⚡</div>
            <div className="info">
              <p>Luz del mes</p>
              <span>Depa 4B · Hace 5 días</span>
            </div>
            <div className="amount positive">+$200.00</div>
          </div>

        </div>
      </div>

      {/* Acciones */}
      <div className="section">
        <h3>Acciones rápidas</h3>

        <div className="actions">
          <button className="btn primary">+ Agregar gasto</button>
          <button className="btn outline">⛶ Escanear recibo</button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;