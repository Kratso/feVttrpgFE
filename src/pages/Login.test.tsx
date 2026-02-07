import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { setMockState } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("Login", () => {
  beforeEach(() => {
    setMockState({
      auth: {
        error: "Invalid credentials",
      },
    });
  });

  it("renders login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
