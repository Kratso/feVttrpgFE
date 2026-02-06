import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/slices/authSlice";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate("/campaigns");
    } catch {
      return;
    }
  };

  return (
    <Panel>
      <h1>Welcome back</h1>
      <p className="muted">Log in to manage campaigns, characters, and maps.</p>
      <form onSubmit={onSubmit} className="form">
        <Field label="Email">
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <ErrorBanner message={error} />
        <Button type="submit" variant="primary">
          Log in
        </Button>
      </form>
      <p className="muted">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </Panel>
  );
}
