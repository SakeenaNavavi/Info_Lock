import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
const Header = () => {
    const navigate = useNavigate();
    return (
        <div>
            <nav className="container py-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="h4 font-bold">InfoLock</div>
                    <div>
                        <button className="btn btn-link text-light">Features</button>
                        <button className="btn btn-link text-light">Pricing</button>
                        <button className="btn btn-link text-light">Contact</button>
                        <button className="btn btn-primary ml-3" onClick={() => navigate('/register')}>Get Started</button>
                    </div>
                </div>
            </nav></div>

    )
}
export default Header;