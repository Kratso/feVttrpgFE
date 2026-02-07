import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Campaigns from "./Campaigns";
import { setMockState } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("Campaigns", () => {
  beforeEach(() => {
    setMockState({
      campaigns: {
        campaigns: [
          { id: "c1", name: "Alpha Campaign", role: "DM" },
          { id: "c2", name: "Bravo Campaign", role: "PLAYER" },
        ],
      },
    });
  });

  it("renders campaign cards", () => {
    render(
      <MemoryRouter>
        <Campaigns />
      </MemoryRouter>
    );

    expect(screen.getByText("Alpha Campaign")).toBeInTheDocument();
    expect(screen.getByText("Bravo Campaign")).toBeInTheDocument();
    expect(screen.getAllByText(/Role:/)).toHaveLength(2);
  });

  it("shows create button", () => {
    render(
      <MemoryRouter>
        <Campaigns />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });
});
