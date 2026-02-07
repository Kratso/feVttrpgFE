export const buildGrid = (rows: number, cols: number) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => null as string | null));

export const resizeGrid = (
  grid: Array<Array<string | null>>,
  rows: number,
  cols: number
): Array<Array<string | null>> => {
  const next = buildGrid(rows, cols);
  for (let row = 0; row < Math.min(rows, grid.length); row += 1) {
    for (let col = 0; col < Math.min(cols, grid[row].length); col += 1) {
      next[row][col] = grid[row][col];
    }
  }
  return next;
};
