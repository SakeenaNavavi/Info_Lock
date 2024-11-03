import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import VerifyEmail from './Components/VerifyEmail';
import AdminLoginPage from './Pages/AdminLoginPage';

function App() {
  return (
    <div className="App">
          <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/admin" element={<AdminLoginPage />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
