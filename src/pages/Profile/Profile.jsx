import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { useApp } from "../../context/AppContext";
import {
  settingsMenu,
  privacyOptions,
  preferences,
} from "../../data/profile";

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    user: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
    bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m7.73 13a2 2 0 0 1-3.46 0" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    arrowLeft: <path d="m15 18-6-6 6-6" />,
    card: <path d="M3 8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -8M3 10l18 0M7 15l.01 0M11 15l2 0" />,
    coin: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v10m-3-7h6m-6 4h6" />,
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

const CREDIT_PACKAGES = [
  { id: 'cp1', credits: 10, label: '10 créditos' },
  { id: 'cp2', credits: 25, label: '25 créditos' },
  { id: 'cp3', credits: 50, label: '50 créditos' },
  { id: 'cp4', credits: 100, label: '100 créditos' },
];

function Profile() {
  const navigate = useNavigate();
  const { groups, expenses, debts, currentUser, credits, profileAvatar, creditTransactions, dispatch } = useApp();
  const fileInputRef = useRef(null);

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: "",
    newPassword: "",
  });
  const [customAmount, setCustomAmount] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditForm(prev => ({ ...prev, name: currentUser.name, email: currentUser.email }));
    }
  }, [currentUser?.id]);

  const stats = useMemo(() => {
    const pendingTotal = debts
      .filter(d => d.status !== 'paid')
      .reduce((s, d) => s + d.amount, 0);
    const fmtMoney = (n) => Number.isInteger(n) ? n.toString() : n.toFixed(2);

    return [
      { id: 'ps1', label: 'Grupos activos', value: groups.length },
      { id: 'ps2', label: 'Por saldar', value: fmtMoney(pendingTotal), isCurrency: true },
      { id: 'ps3', label: 'Créditos', value: fmtMoney(credits), isCurrency: true },
    ];
  }, [groups, debts, credits]);

  if (!currentUser) return null;
  const user = currentUser;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen no debe superar 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({ type: 'SET_AVATAR', avatar: ev.target.result });
      showToast('Foto actualizada ✓');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    dispatch({ type: 'SET_AVATAR', avatar: null });
    showToast('Foto eliminada');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileChanges = () => {
    const newName = editForm.name.trim().replace(/\s+/g, ' ');
    const newEmail = editForm.email.trim().toLowerCase();

    if (newName.length < 3) {
      showToast('Ingresa un nombre válido.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showToast('Correo electrónico inválido.');
      return;
    }
    if (editForm.newPassword) {
      if (editForm.currentPassword !== user.password) {
        showToast('La contraseña actual es incorrecta.');
        return;
      }
      if (editForm.newPassword.length < 6) {
        showToast('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    const changes = { name: newName, email: newEmail };
    if (editForm.newPassword) changes.password = editForm.newPassword;

    dispatch({ type: 'UPDATE_PROFILE', changes });
    setEditForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    showToast('Cambios guardados con éxito ✓');
  };

  const buyCredits = (amount) => {
    if (amount <= 0) {
      showToast('Ingresa una cantidad válida.');
      return;
    }
    dispatch({ type: 'BUY_CREDITS', amount });
    showToast(`+${amount} créditos comprados ✓`);
  };

  const handleCustomBuy = () => {
    const amount = parseInt(customAmount, 10);
    if (!amount || amount <= 0) {
      showToast('Ingresa una cantidad válida.');
      return;
    }
    buyCredits(amount);
    setCustomAmount('');
  };

  const [privacyState, setPrivacyState] = useState(
    privacyOptions.reduce((acc, option) => {
      acc[option.key] = option.value;
      return acc;
    }, {}),
  );
  const [notifState, setNotifState] = useState(preferences.notifications);

  const handlePrivacyToggle = (key) =>
    setPrivacyState((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleNotifToggle = (key) =>
    setNotifState((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleAccordion = (id) =>
    setActiveAccordion(activeAccordion === id ? null : id);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  };

  const getInitials = () =>
    user.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

  const renderAvatarVisual = (size = 'large') => (
    <div className={`avatar-circle${size === 'small' ? ' small' : ''}`}>
      {profileAvatar
        ? <img src={profileAvatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        : getInitials()}
    </div>
  );

  const renderAccordionContent = (id) => {
    switch (id) {
      case "sm1":
        return (
          <div className="edit-profile-form">
            <div className="form-avatar-section">
              {renderAvatarVisual('small')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  className="change-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar foto
                </button>
                {profileAvatar && (
                  <button
                    type="button"
                    className="change-photo-btn"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={handleRemoveAvatar}
                  >
                    Quitar foto
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
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
              value={editForm.currentPassword}
              placeholder="Contraseña actual (solo si vas a cambiarla)"
              onChange={handleInputChange}
              className="profile-input"
            />
            <input
              name="newPassword"
              type="password"
              value={editForm.newPassword}
              placeholder="Nueva contraseña"
              onChange={handleInputChange}
              className="profile-input"
            />

            <button className="save-changes-btn" onClick={saveProfileChanges}>
              Guardar Cambios
            </button>
          </div>
        );

      case "sm2": {
        const recentTx = creditTransactions.slice(0, 5);
        return (
          <div className="payment-methods-container">
            <div className="credits-balance-card">
              <div>
                <p className="credits-balance-label">Saldo disponible</p>
                <p className="credits-balance-amount">{credits.toFixed(2)} créditos</p>
                <p className="credits-balance-sub">≈ S/ {credits.toFixed(2)} (1 crédito = S/ 1)</p>
              </div>
              <div className="credits-balance-icon">💰</div>
            </div>

            <p className="credits-section-title">Comprar créditos</p>
            <div className="credits-packages">
              {CREDIT_PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  className="credits-package-btn"
                  onClick={() => buyCredits(pkg.credits)}
                >
                  <span className="credits-package-amount">+{pkg.credits}</span>
                  <span className="credits-package-price">S/ {pkg.credits}</span>
                </button>
              ))}
            </div>

            <div className="credits-custom">
              <input
                type="number"
                min="1"
                placeholder="Otra cantidad"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="profile-input"
              />
              <button className="add-card-btn" onClick={handleCustomBuy}>
                Comprar
              </button>
            </div>

            <p className="credits-section-title" style={{ marginTop: 16 }}>
              Movimientos recientes
            </p>
            {recentTx.length === 0 ? (
              <p className="credits-empty">Aún no has comprado créditos.</p>
            ) : (
              <div className="credits-history">
                {recentTx.map(tx => (
                  <div key={tx.id} className="credits-history-row">
                    <span>
                      {tx.type === 'purchase' ? '🛒 Compra' : '💸 Pago de deuda'}
                    </span>
                    <span style={{ color: tx.type === 'purchase' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {tx.type === 'purchase' ? '+' : '-'}{tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "sm3":
        return (
          <div className="notifications-settings">
            {Object.keys(preferences.notifications).map((key) => (
              <div className="notif-row" key={key}>
                <span>
                  {key === "newExpense" ? "Nuevo gasto registrado"
                    : key === "debtReminder" ? "Recordatorios de pago"
                      : key === "groupInvite" ? "Invitaciones a grupos"
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

      case "sm4":
        return (
          <div className="privacy-settings">
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
    sm1: "user",
    sm2: "card",
    sm3: "bell",
    sm4: "shield",
    sm5: "logout",
  };

  const settingsLabels = settingsMenu.map(item =>
    item.id === 'sm2' ? { ...item, label: 'Métodos de pago / Créditos' } : item
  );

  return (
    <div className="profile-container">
      {toast && <div className="profile-toast">{toast}</div>}

      <header className="mobile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <Icon name="arrowLeft" size={24} />
        </button>
        <h1>Mi perfil</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="profile-desktop-header pc-only">
        <h1 className="profile-desktop-title">Mi perfil</h1>
        <p className="profile-desktop-sub">Gestiona tu cuenta, créditos y preferencias</p>
      </div>

      <div className="profile-layout">
        <div className="user-card">
          {renderAvatarVisual('large')}
          <h2 className="user-name">{user.name}</h2>
          <p className="user-email">{user.email}</p>

          <button
            className={`edit-btn ${activeAccordion === "sm1" ? "active" : ""}`}
            onClick={() => toggleAccordion("sm1")}
          >
            <Icon name="pencil" size={14} /> Editar perfil
          </button>

          <div className="stats-row">
            {stats.map((stat) => (
              <div className="stat-item" key={stat.id}>
                <span className={`stat-value ${stat.isCurrency ? "highlight" : ""}`}>
                  {stat.isCurrency ? `S/ ${stat.value}` : stat.value}
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title pc-only">Ajustes y configuración</h3>
          <div className="accordion-group">
            {settingsLabels.map((item) => (
              <div key={item.id} className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() =>
                    item.id === "sm5" ? handleLogout() : toggleAccordion(item.id)
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
                      <Icon name={iconMapping[item.id] || "user"} size={20} />
                    </div>
                    <span>{item.label}</span>
                    {item.id === 'sm2' && (
                      <span className="credits-badge">
                        {credits.toFixed(0)}
                      </span>
                    )}
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
