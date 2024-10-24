const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="col-lg-3 col-md-6 mb-4">
      <div className="card bg-secondary text-center border-0 h-100">
        <div className="card-body">
          <div className="mb-3">{icon}</div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;