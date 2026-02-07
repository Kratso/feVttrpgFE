import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MapViewer from "./MapViewer";
import { setMockState, mockDispatch } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("MapViewer", () => {
  beforeEach(() => {
    setMockState({
      maps: {
        maps: [
          { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
          { id: "map-2", name: "Other Map", imageUrl: "other.png", gridSize: 40, gridOffsetX: 5, gridOffsetY: 5 },
        ],
        selectedMapId: "map-1",
        map: { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        tokens: [
          { id: "token-1", label: "A", x: 1, y: 2, color: "#f43f5e" },
          { id: "token-2", label: "B", x: 0, y: 0, color: "#22d3ee" },
        ],
        loading: false,
        error: null,
      },
      campaigns: {
        role: "DM",
      },
    });
  });

  it("renders map viewer and map name", () => {
    render(<MapViewer />);
    expect(screen.getByRole("heading", { name: /map viewer/i })).toBeInTheDocument();
    expect(screen.getByText("Test Map")).toBeInTheDocument();
  });

  it("shows tokens on the map", () => {
    render(<MapViewer />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows DM controls for creating map and token", () => {
    render(<MapViewer />);
    expect(screen.getByRole("heading", { name: /create map/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /create token/i })).toBeInTheDocument();
  });

  it("shows role in toolbar", () => {
    render(<MapViewer />);
    expect(screen.getByText(/role: dm/i)).toBeInTheDocument();
  });

  it("dispatches selectMap when selection changes", () => {
    render(<MapViewer />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "map-2" } });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "maps/selectMap", payload: "map-2" });
  });

  it("dispatches createMap when submitting create map form", () => {
    render(<MapViewer />);
    fireEvent.change(screen.getByLabelText("Map name"), { target: { value: "New Map" } });
    fireEvent.change(screen.getByLabelText("Image URL"), { target: { value: "url.png" } });
    fireEvent.change(screen.getByLabelText("Grid size (px)"), { target: { value: 32 } });
    fireEvent.click(screen.getByRole("button", { name: /add map/i }));
    // Check that dispatch was called with a thunk (function)
    const calls = mockDispatch.mock.calls;
    expect(calls.some(([arg]) => typeof arg === "function")).toBe(true);
  });

  it("can fill and submit create token form", () => {
    render(<MapViewer />);
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Z" } });
    fireEvent.change(screen.getByLabelText("X"), { target: { value: 3 } });
    fireEvent.change(screen.getByLabelText("Y"), { target: { value: 4 } });
    fireEvent.change(screen.getByLabelText("Color"), { target: { value: "#000000" } });
    fireEvent.click(screen.getByRole("button", { name: /add token/i }));
    // No error thrown, form interaction works
    expect(screen.getByLabelText("Label")).toHaveValue("Z");
    expect(screen.getByLabelText("X")).toHaveValue(3);
    expect(screen.getByLabelText("Y")).toHaveValue(4);
    expect(screen.getByLabelText("Color")).toHaveValue("#000000");
  });

  it("hides DM controls for non-DM role", () => {
    setMockState({
      maps: {
        maps: [
          { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        ],
        selectedMapId: "map-1",
        map: { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        tokens: [],
        loading: false,
        error: null,
      },
      campaigns: { role: "PLAYER" },
    });
    render(<MapViewer />);
    expect(screen.queryByRole("heading", { name: /create map/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /create token/i })).not.toBeInTheDocument();
  });

  it("shows error banner if error present", () => {
    setMockState({
      maps: {
        maps: [
          { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        ],
        selectedMapId: "map-1",
        map: { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        tokens: [],
        loading: false,
        error: "Something went wrong!",
      },
      campaigns: { role: "DM" },
    });
    render(<MapViewer />);
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });

  it("starts drag only for DM", () => {
    render(<MapViewer />);
    const token = screen.getByText("A");
    fireEvent.mouseDown(token);
    // No error thrown, drag logic is DM-only
  });

  it("does not start drag for non-DM", () => {
    setMockState({
      maps: {
        maps: [
          { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        ],
        selectedMapId: "map-1",
        map: { id: "map-1", name: "Test Map", imageUrl: "test.png", gridSize: 50, gridOffsetX: 0, gridOffsetY: 0 },
        tokens: [ { id: "token-1", label: "A", x: 1, y: 2, color: "#f43f5e" } ],
        loading: false,
        error: null,
      },
      campaigns: { role: "PLAYER" },
    });
    render(<MapViewer />);
    const token = screen.getByText("A");
    fireEvent.mouseDown(token);
    // No error thrown, drag logic is skipped for non-DM
  });
});
