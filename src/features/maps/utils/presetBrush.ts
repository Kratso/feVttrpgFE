export const applyPresetAt = (
  grid: Array<Array<string | null>>,
  presetGrid: Array<Array<string | null>>,
  startRow: number,
  startCol: number
): Array<Array<string | null>> => {
  const next = grid.map((row) => [...row]);
  for (let row = 0; row < presetGrid.length; row += 1) {
    for (let col = 0; col < presetGrid[row].length; col += 1) {
      const targetRow = startRow + row;
      const targetCol = startCol + col;
      const tileId = presetGrid[row][col];
      if (tileId === null) {
        continue;
      }
      if (targetRow < 0 || targetCol < 0) {
        continue;
      }
      if (targetRow >= next.length || targetCol >= next[targetRow].length) {
        continue;
      }
      next[targetRow][targetCol] = tileId;
    }
  }
  return next;
};
