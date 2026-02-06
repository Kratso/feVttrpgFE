import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register } from "../store/slices/authSlice";
import Panel from "../components/ui/Panel";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(register({ displayName, email, password })).unwrap();
      navigate("/campaigns");
    } catch {
      return;
    }
  };

  return (
    <Panel>
      <h1>Create account</h1>
      <p className="muted">Set up your table and invite players.</p>
      <form onSubmit={onSubmit} className="form">
        <Field label="Display name">
          <TextInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </Field>
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
          Register
        </Button>
      </form>
      <p className="muted">
        Have an account? <Link to="/login">Log in</Link>
      </p>
    </Panel>
  );
}
