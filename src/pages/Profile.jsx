import React, { useState } from "react";
import "./Profile.css";
import { currentUser } from "../data/global";
import {
  profileStats,
  settingsMenu,
  privacyOptions,
  preferences,
  paymentMethods,
} from "../data/profile";

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    user: (
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    ),
    bell: (
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m7.73 13a2 2 0 0 1-3.46 0" />
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    logout: (
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />
    ),
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    arrowLeft: <path d="m15 18-6-6 6-6" />,
    card: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4f4a4a"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-credit-card"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -8" />
        <path d="M3 10l18 0" />
        <path d="M7 15l.01 0" />
        <path d="M11 15l2 0" />
      </svg>
    ),
    trash: (
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
};

function Profile() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [user, setUser] = useState({ ...currentUser });
  const [cards, setCards] = useState([...paymentMethods]);

  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    currentPassword: "",
    newPassword: "",
  });
  
  // --- LÓGICA DE MÉTODOS DE PAGO ---
  const handleDeleteCard = (id) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  // --- LÓGICA DE EDICIÓN DE PERFIL ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileChanges = () => {
    // Aquí validarías la contraseña actual antes de proceder
    if (
      editForm.currentPassword === user.password ||
      editForm.currentPassword === ""
    ) {
      setUser((prev) => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        // Si hay nueva contraseña, la actualizamos
        password: editForm.newPassword || prev.password,
      }));
      alert("Cambios guardados con éxito");
      setActiveAccordion(null);
    } else {
      alert("La contraseña actual es incorrecta");
    }
  };

  const [privacyState, setPrivacyState] = useState(
    privacyOptions.reduce((acc, option) => {
      acc[option.key] = option.value;
      return acc;
    }, {}),
  );

  // 💡 Inicializamos notificaciones desde las preferences
  const [notifState, setNotifState] = useState(preferences.notifications);

  // Funciones para manejar los cambios en los toggles
  const handlePrivacyToggle = (key) => {
    setPrivacyState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotifToggle = (key) => {
    setNotifState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const renderAccordionContent = (id) => {
    switch (id) {
      case "sm1": // Editar Perfil
        return (
          <div className="edit-profile-form">
            <div className="form-avatar-section">
              <div className="avatar-circle small">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <button className="change-photo-btn">Cambiar foto</button>
            </div>

            <input
              name="name"
              type="text"
              value={editForm.name}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className="profile-input"
            />
            <input
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleInputChange}
              placeholder="Correo electrónico"
              className="profile-input"
            />
            <input
              name="currentPassword"
              type="password"
              placeholder="Contraseña actual"
              onChange={handleInputChange}
              className="profile-input"
            />
            <input
              name="newPassword"
              type="password"
              placeholder="Nueva contraseña"
              onChange={handleInputChange}
              className="profile-input"
            />

            <button className="save-changes-btn" onClick={saveProfileChanges}>
              Guardar Cambios
            </button>
          </div>
        );

      case "sm2": // Métodos de Pago
        return (
          <div className="payment-methods-container">
            {cards.map((method) => (
              <div className="payment-item" key={method.id}>
                <div className="payment-info">
                  <Icon name="card" size={24} color={method.brandColor} />
                  <span>
                    {method.type} •••• {method.lastFour}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteCard(method.id)}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            ))}
            <button className="add-card-btn">
              <Icon name="card" size={20} color="#A87343" />
              Añadir tarjeta
            </button>
          </div>
        );

      case "sm3": // Notificaciones
        return (
          <div className="notifications-settings">
            {/* 💡 Toggles dinámicos basados en preferences.notifications */}
            {Object.keys(preferences.notifications).map((key) => (
              <div className="notif-row" key={key}>
                <span>
                  {key === "newExpense"
                    ? "Nuevo gasto registrado"
                    : key === "debtReminder"
                      ? "Recordatorios de pago"
                      : key === "groupInvite"
                        ? "Invitaciones a grupos"
                        : "Resumen semanal"}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifState[key]}
                    onChange={() => handleNotifToggle(key)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}
          </div>
        );
      case "sm4": // Privacidad
        return (
          <div className="privacy-settings">
            {/* 💡 Toggles dinámicos basados en privacyOptions */}
            {privacyOptions.map((option) => (
              <div className="notif-row" key={option.id}>
                <span>{option.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={privacyState[option.key]}
                    onChange={() => handlePrivacyToggle(option.key)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}
          </div>
        );
      default:
        return <p>Sección en construcción...</p>;
    }
  };

  const iconMapping = {
    sm1: "user", // Editar perfil
    sm2: "card", // Metodo de pago
    sm3: "bell", // Notificaciones
    sm4: "shield", // Privacidad
    sm5: "logout", // Cerrar sesión
  };

  return (
    <div className="profile-container">
      <header className="mobile-header">
        <button className="back-btn">
          <Icon name="arrowLeft" size={24} />
        </button>
        <h1>Mi perfil</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="profile-layout">
        <div className="user-card">
          <div className="avatar-circle">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <h2 className="user-name">{user.name}</h2>
          <p className="user-email">{user.email}</p>

          <button
            className={`edit-btn ${activeAccordion === "sm1" ? "active" : ""}`}
            onClick={() => toggleAccordion("sm1")} 
          >
            <Icon name="pencil" size={14} /> Editar perfil
          </button>

          <div className="stats-row">
            {profileStats.map((stat) => (
              <div className="stat-item" key={stat.id}>
                <span
                  className={`stat-value ${stat.isCurrency ? "highlight" : ""}`}
                >
                  {stat.isCurrency ? `S/ ${stat.value}` : stat.value}
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title pc-only">Configuración</h3>
          <div className="accordion-group">
            {settingsMenu.map((item) => (
              <div key={item.id} className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() =>
                    item.id === "sm5" 
                      ? handleLogout()
                      : toggleAccordion(item.id)
                  }
                  style={{
                    color: item.danger
                      ? "var(--color-danger)"
                      : "var(--color-text-primary)",
                  }}
                >
                  <div className="header-left">
                    <div
                      className="icon-wrapper"
                      style={{
                        color: item.danger
                          ? "var(--color-danger)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {/* Usamos el mapeo para mostrar el icono correcto */}
                      <Icon name={iconMapping[item.id] || "user"} size={20} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.id !== "sm5" && (
                    <div className="header-right">
                      <Icon
                        name={
                          activeAccordion === item.id
                            ? "chevronDown"
                            : "chevronRight"
                        }
                        size={18}
                        color="var(--color-text-secondary)"
                      />
                    </div>
                  )}
                </button>

                {activeAccordion === item.id && (
                  <div className="accordion-content">
                    {renderAccordionContent(item.id)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
