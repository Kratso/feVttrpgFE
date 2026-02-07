import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PresetBuilder from "./PresetBuilder";

const mockFetch = vi.fn();

vi.mock("../api/client", () => ({
  apiFetch: (path: string, options?: RequestInit) => mockFetch(path, options),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ campaignId: "camp-1" }),
  };
});

const tileSets = [
  {
    id: "set-1",
    name: "Forest",
    imageUrl: "data:image/png;base64,AAA",
    tileSizeX: 32,
    tileSizeY: 32,
    columns: 1,
    rows: 1,
    tiles: [{ id: "tile-1", tileSetId: "set-1", index: 0, imageUrl: "data:image/png;base64,AAA" }],
  },
];

const presets = [
  {
    id: "preset-1",
    name: "Village",
    tileCountX: 2,
    tileCountY: 2,
    tileGrid: [["tile-1", null], [null, "tile-1"]],
    campaignId: "camp-1",
    createdAt: "2026-02-07T00:00:00.000Z",
  },
];

describe("PresetBuilder", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((path: string) => {
      if (path.includes("/tilesets")) {
        return Promise.resolve({ tileSets });
      }
      if (path.includes("/presets")) {
        return Promise.resolve({ presets });
      }
      return Promise.resolve({});
    });
  });

  it("loads presets and allows selection", async () => {
    render(<PresetBuilder />);

    expect(await screen.findByRole("heading", { name: /preset builder/i })).toBeInTheDocument();
    const select = await screen.findByLabelText("Preset");
    fireEvent.change(select, { target: { value: "preset-1" } });
    expect(await screen.findByLabelText("Preset name")).toHaveValue("Village");
  });
});
