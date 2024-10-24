import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Database, Server } from 'lucide-react';
import '../styles/styles.css';
import FeatureCard from '../Components/FeatureCard';
import Header from '../Components/Header';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-vh-150 bg-dark text-white">
      {/* Hero Section */}
      <header className="bg-custom-gradient">
        <Header/>
        <div className="container text-center py-5">
          <h1 className="display-4 font-weight-bold mb-4">
            Secure Your Digital Assets
          </h1>
          <p className="lead text-secondary mb-4">
            Military-grade encryption for your most valuable digital possessions
          </p>
          <button className="btn btn-primary btn-lg">Start Free Trial</button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="h3 text-center mb-5">Why Choose InfoLock?</h2>
          <div className="row text-center">
            <FeatureCard 
              icon={<Shield size={48} className="text-light" />}
              title="256-bit Encryption"
              description="Bank-level security for all your stored data"
            />
            <FeatureCard 
              icon={<Lock size={48} className="text-light" />}
              title="Two-Factor Auth"
              description="Extra layer of security for your account"
            />
            <FeatureCard 
              icon={<Database size={48} className="text-light" />}
              title="Unlimited Storage"
              description="Store as much as you need, whenever you need"
            />
            <FeatureCard 
              icon={<Server size={48} className="text-light" />}
              title="Cloud Backup"
              description="Your data is always safe and accessible"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bgs py-5">
        <div className="container text-center text-white">
          <h2 className="h3 mb-4">Ready to Secure Your Digital Life?</h2>
          <p className="lead mb-4">Join thousands of users who trust InfoLock with their digital assets</p>
          <div className="d-inline-flex gap-3">
            <button className="btn btn-light btn-lg" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn btn-outline-light btn-lg">Learn More</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-4">
        <div className="container text-center">
          <p className="text-secondary mb-0">© 2024 InfoLock. All rights reserved.</p>
          <div className="d-inline-flex gap-3 mt-3">
            <button className="btn btn-link text-muted">Privacy</button>
            <button className="btn btn-link text-muted">Terms</button>
            <button className="btn btn-link text-muted">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default LandingPage;
