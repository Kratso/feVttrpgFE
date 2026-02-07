import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { setMockState } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("Register", () => {
  beforeEach(() => {
    setMockState({
      auth: {
        error: "Registration failed",
      },
    });
  });

  it("renders register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText("Registration failed")).toBeInTheDocument();
  });
});
