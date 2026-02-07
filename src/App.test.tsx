import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { setMockState } from "./test/mockStore";

vi.mock("./store/hooks", async () => {
  const mockStore = await import("./test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

vi.mock("./store/slices/authSlice", () => {
  return {
    fetchMe: () => ({ type: "auth/fetchMe" }),
    logout: () => ({ type: "auth/logout" }),
  };
});

vi.mock("./pages/Login", () => ({
  default: () => <div>Login Screen</div>,
}));

vi.mock("./pages/Register", () => ({
  default: () => <div>Register Screen</div>,
}));

vi.mock("./pages/Campaigns", () => ({
  default: () => <div>Campaigns Screen</div>,
}));

vi.mock("./components/ui/Breadcrumbs", () => ({
  default: () => <div>Breadcrumbs</div>,
}));

describe("App routing", () => {
  it("redirects unauthenticated users to login", () => {
    setMockState({
      auth: {
        user: null,
        loading: false,
      },
    });

    render(
      <MemoryRouter initialEntries={["/campaigns"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("redirects authenticated users away from guest routes", () => {
    setMockState({
      auth: {
        user: { id: "u1", email: "test@example.com", displayName: "Tester" },
        loading: false,
      },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Campaigns Screen")).toBeInTheDocument();
  });

  it("shows loading state while auth is pending", () => {
    setMockState({
      auth: {
        user: null,
        loading: true,
      },
    });

    render(
      <MemoryRouter initialEntries={["/campaigns"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
