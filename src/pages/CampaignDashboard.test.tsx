import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CampaignDashboard from "./CampaignDashboard";
import { setMockState } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("CampaignDashboard", () => {
  beforeEach(() => {
    setMockState({
      campaigns: {
        role: "DM",
      },
    });
  });

  it("shows admin link for DM", () => {
    render(
      <MemoryRouter initialEntries={["/campaigns/c1"]}>
        <Routes>
          <Route path="/campaigns/:campaignId" element={<CampaignDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin character editor")).toBeInTheDocument();
  });

  it("hides admin link for non-DM", () => {
    setMockState({
      campaigns: {
        role: "PLAYER",
      },
    });

    render(
      <MemoryRouter initialEntries={["/campaigns/c1"]}>
        <Routes>
          <Route path="/campaigns/:campaignId" element={<CampaignDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Admin character editor")).toBeNull();
  });
});
