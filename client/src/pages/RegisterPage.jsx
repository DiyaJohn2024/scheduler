// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { registerUser } from '../api/authApi';
import '../styles/LoginPage.css';   // reuse the same CSS file

function RegisterPage() {
  const [name, setName] = useState('');
  const [clubOrDept, setClubOrDept] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const data = await registerUser({
        name,
        email,
        password,
        role,
        clubOrDept,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMsg(`Registered & logged in as ${data.user.name} (${data.user.role})`);
    } catch {
      setError('Registration failed (maybe email already used).');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Create an account</h1>
          <p>Join Campus Nexus to manage and discover events.</p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="clubOrDept">
              Club / Department (for club heads / faculty)
            </label>
            <input
              id="clubOrDept"
              type="text"
              value={clubOrDept}
              onChange={(e) => setClubOrDept(e.target.value)}
              placeholder="e.g. CSI Club, CSE Dept"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@college.edu"
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="club_head">Club Head</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <button className="login-btn" type="submit">
            Sign up
          </button>
        </form>

        <div className="login-footer">
          <span>Already have an account?</span>
          <span className="hint">Use the Login button in the top bar.</span>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
