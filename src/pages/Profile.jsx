import "./Profile.css";
function Profile() {
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


export default Profile
