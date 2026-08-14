const SUBSHELL_ORDER = [
  { subshell: "1s", capacity: 2, shell: 1 },
  { subshell: "2s", capacity: 2, shell: 2 },
  { subshell: "2p", capacity: 6, shell: 2 },
  { subshell: "3s", capacity: 2, shell: 3 },
  { subshell: "3p", capacity: 6, shell: 3 },
  { subshell: "4s", capacity: 2, shell: 4 },
  { subshell: "3d", capacity: 10, shell: 3 },
  { subshell: "4p", capacity: 6, shell: 4 },
  { subshell: "5s", capacity: 2, shell: 5 },
  { subshell: "4d", capacity: 10, shell: 4 },
  { subshell: "5p", capacity: 6, shell: 5 },
  { subshell: "6s", capacity: 2, shell: 6 },
  { subshell: "4f", capacity: 14, shell: 4 },
  { subshell: "5d", capacity: 10, shell: 5 },
  { subshell: "6p", capacity: 6, shell: 6 },
  { subshell: "7s", capacity: 2, shell: 7 },
  { subshell: "5f", capacity: 14, shell: 5 },
  { subshell: "6d", capacity: 10, shell: 6 },
  { subshell: "7p", capacity: 6, shell: 7 },
];

const SHELL_LABELS = ["K", "L", "M", "N", "O", "P", "Q"];

export const SHELL_COLORS = {
  K: "#ef4444",
  L: "#f97316",
  M: "#eab308",
  N: "#22c55e",
  O: "#06b6d4",
  P: "#3b82f6",
  Q: "#8b5cf6",
};

export function getElectronConfiguration(atomicNumber) {
  const config = [];
  let remaining = Math.max(0, Math.min(118, atomicNumber));

  for (const { subshell, capacity, shell } of SUBSHELL_ORDER) {
    if (remaining <= 0) break;

    const electrons = Math.min(capacity, remaining);

    config.push({ subshell, electrons, shell });

    remaining -= electrons;
  }

  const shells = SHELL_LABELS.map((label, index) => {
    const shellNumber = index + 1;
    const electrons = config
      .filter((c) => c.shell === shellNumber)
      .reduce((sum, c) => sum + c.electrons, 0);

    return { label, electrons, color: SHELL_COLORS[label] };
  }).filter((shell) => shell.electrons > 0);

  return { config, shells };
}
