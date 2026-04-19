const ActivityItem = ({ icon, title, info, amount, type }) => {
  return (
    <div className="activity-item">
      <div className="icon">{icon}</div>

      <div className="info">
        <p>{title}</p>
        <span>{info}</span>
      </div>

      <div className={`amount ${type}`}>
        {amount}
      </div>
    </div>
  );
};

export default ActivityItem;