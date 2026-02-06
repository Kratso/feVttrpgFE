import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ displayName, email, password }),
      });
      await refresh();
      navigate("/campaigns");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="panel">
      <h1>Create account</h1>
      <p className="muted">Set up your table and invite players.</p>
      <form onSubmit={onSubmit} className="form">
        <label>
          Display name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary">
          Register
        </button>
      </form>
      <p className="muted">
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
