import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import TokenList from "./TokenList";
import type { Character, CharacterItem, Token } from "../../../api/types";

const mockApiFetch = vi.fn();

vi.mock("../../../api/client", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const buildToken = (overrides: Partial<Token> = {}): Token => ({
  id: "token-1",
  label: "A",
  x: 1,
  y: 2,
  color: "#f43f5e",
  character: {
    id: "char-1",
    name: "Ike",
    owner: { id: "user-1", displayName: "Owner" },
    equippedWeaponItem: null,
  },
  ...overrides,
});

const buildInventory = (): CharacterItem[] => [
  {
    id: "inv-1",
    itemId: "item-1",
    sortOrder: 0,
    item: {
      id: "item-1",
      name: "Iron Sword",
      type: "sword",
      category: "WEAPON",
      damageType: "PHYSICAL",
    },
  },
  {
    id: "inv-2",
    itemId: "item-2",
    sortOrder: 1,
    item: {
      id: "item-2",
      name: "Vulnerary",
      type: "item",
      category: "ITEM",
    },
  },
];

const findWeaponSelect = () => {
  const selects = screen.getAllByRole("combobox");
  const weaponSelect = selects.find((select) =>
    within(select).queryByText("No weapon")
  );
  if (!weaponSelect) {
    throw new Error("Weapon select not found");
  }
  return weaponSelect;
};

describe("TokenList", () => {
  it("shows weapon selector for DM and calls onEquipWeapon", async () => {
    const token = buildToken();
    const inventory = buildInventory();
    const character: Character = {
      id: "char-1",
      name: "Ike",
      stats: { hp: 20 },
      kind: "PLAYER",
      inventory,
    } as Character;

    mockApiFetch.mockResolvedValueOnce({ character });

    const onEquipWeapon = vi.fn();

    render(
      <TokenList
        tokens={[token]}
        role="DM"
        currentUserId="user-1"
        selectedTokenId={null}
        visibilityById={{}}
        onSelect={() => null}
        onVisibilityChange={() => null}
        onEquipWeapon={onEquipWeapon}
      />
    );

    const weaponSelect = findWeaponSelect();
    fireEvent.focus(weaponSelect);

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());

    fireEvent.change(weaponSelect, { target: { value: "inv-1" } });
    expect(onEquipWeapon).toHaveBeenCalledWith("char-1", "inv-1");
  });

  it("hides weapon selector for non-owner players", () => {
    const token = buildToken({
      character: {
        id: "char-1",
        name: "Ike",
        owner: { id: "owner-1", displayName: "Owner" },
        equippedWeaponItem: null,
      },
    });

    render(
      <TokenList
        tokens={[token]}
        role="PLAYER"
        currentUserId="user-2"
        selectedTokenId={null}
        visibilityById={{}}
        onSelect={() => null}
        onVisibilityChange={() => null}
      />
    );

    expect(screen.queryByText("No weapon")).not.toBeInTheDocument();
  });

  it("shows weapon selector for owner players", async () => {
    const token = buildToken({
      character: {
        id: "char-1",
        name: "Ike",
        owner: { id: "user-1", displayName: "Owner" },
        equippedWeaponItem: null,
      },
    });
    const inventory = buildInventory();
    const character: Character = {
      id: "char-1",
      name: "Ike",
      stats: { hp: 20 },
      kind: "PLAYER",
      inventory,
    } as Character;

    mockApiFetch.mockResolvedValueOnce({ character });

    render(
      <TokenList
        tokens={[token]}
        role="PLAYER"
        currentUserId="user-1"
        selectedTokenId={null}
        visibilityById={{}}
        onSelect={() => null}
        onVisibilityChange={() => null}
        onEquipWeapon={() => null}
      />
    );

    const weaponSelect = findWeaponSelect();
    fireEvent.focus(weaponSelect);

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
    expect(within(weaponSelect).getByText("Iron Sword")).toBeInTheDocument();
  });
});
