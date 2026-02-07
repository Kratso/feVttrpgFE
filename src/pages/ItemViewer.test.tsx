import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ItemViewer from "./ItemViewer";
import { setMockState } from "../test/mockStore";

vi.mock("../store/hooks", async () => {
  const mockStore = await import("../test/mockStore");
  return {
    useAppDispatch: () => mockStore.mockDispatch,
    useAppSelector: mockStore.useAppSelector,
  };
});

describe("ItemViewer", () => {
  it("renders item and weapon selectors", () => {
    setMockState({
      items: {
        items: [],
        loading: false,
        error: null,
      },
    });

    render(<ItemViewer />);

    expect(screen.getByLabelText("Items")).toBeInTheDocument();
    expect(screen.getByLabelText("Weapons")).toBeInTheDocument();
  });

  it("shows selected item details", () => {
    setMockState({
      items: {
        items: [
          {
            id: "item-1",
            name: "Vulnerary",
            type: "item",
            category: "ITEM",
          },
          {
            id: "weapon-1",
            name: "Iron Sword",
            type: "sword",
            category: "WEAPON",
          },
        ],
        loading: false,
        error: null,
      },
    });

    render(<ItemViewer />);

    const itemSelect = screen.getByLabelText("Items");
    fireEvent.change(itemSelect, { target: { value: "item-1" } });

    expect(screen.getByRole("heading", { name: "Vulnerary" })).toBeInTheDocument();
  });

  it("switches selection between item and weapon", () => {
    setMockState({
      items: {
        items: [
          {
            id: "item-1",
            name: "Vulnerary",
            type: "item",
            category: "ITEM",
          },
          {
            id: "weapon-1",
            name: "Iron Sword",
            type: "sword",
            category: "WEAPON",
          },
        ],
        loading: false,
        error: null,
      },
    });

    render(<ItemViewer />);

    const itemSelect = screen.getByLabelText("Items") as HTMLSelectElement;
    const weaponSelect = screen.getByLabelText("Weapons") as HTMLSelectElement;

    fireEvent.change(itemSelect, { target: { value: "item-1" } });
    expect(itemSelect.value).toBe("item-1");

    fireEvent.change(weaponSelect, { target: { value: "weapon-1" } });
    expect(weaponSelect.value).toBe("weapon-1");
    expect(itemSelect.value).toBe("");
    expect(screen.getByRole("heading", { name: "Iron Sword" })).toBeInTheDocument();
  });
});
