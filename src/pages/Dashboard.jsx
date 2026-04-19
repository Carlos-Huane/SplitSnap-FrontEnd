import React from "react";
import "../styles/dashboard.css";
import ActivityItem from "../components/dashboard/ActivityItem";

const Dashboard = () => {
  const user = {
  name: "Carlos",
  fullName: "Carlos García"
};

const activities = [
  {
    id: 1,
    icon: "🍕",
    title: "Pizza noche",
    info: "Roomies · Hace 2 horas",
    amount: "+150.00",
    type: "positive"
  },
  {
    id: 2,
    icon: "🛒",
    title: "Súper semanal",
    info: "Depa 4B · Ayer",
    amount: "-320.50",
    type: "negative"
  },
  {
    id: 3,
    icon: "🎬",
    title: "Netflix mensual",
    info: "Roomies · Hace 3 días",
    amount: "+$75.00",
    type: "positive"
  },
  {
    id: 4,
    icon: "⚡",
    title: "Luz del mes",
    info: "Depa 4B · Hace 5 días",
    amount: "+$200.00",
    type: "positive"
  },
  {
    id: 5,
    icon: "🍔",
    title: "Hamburguesas",
    info: "Amigos · Hace 1 hora",
    amount: "+$90.00",
    type: "positive"
  }
];

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="header">
        <div>
          <h2>Hola, {user.name} 👋</h2>
          <p>Bienvenido de vuelta</p>
        </div>

        <div className="user-info">
          <span className="user-name">{user.fullName}</span>
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
          {activities.map((item) => (
            <div className="activity-item" key={item.id}>
              <div className="icon">{item.icon}</div>

              <div className="info">
                <p>{item.title}</p>
                <span>{item.info}</span>
              </div>

              <div className={`amount ${item.type}`}>
                {item.amount}
              </div>
            </div>
          ))}
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