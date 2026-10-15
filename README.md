# Prismora

> **Explore. Experiment. Understand.**

Prismora is an open-source scientific simulation and experimentation platform that unifies interactive physics and natural science simulations, mathematical visualization, virtual laboratories, and reproducible scientific investigations.

---

## Architecture Overview

Prismora is organized as a modular pnpm monorepo with strict architectural boundaries:

```
Prismora/
├── apps/
│   └── web/                      # Next.js App Router frontend application
│       ├── src/app/              # Route handlers, layouts, and pages
│       │   ├── page.tsx          # Explore & simulation discovery catalog
│       │   ├── experiments/      # Flagship simulation workspaces
│       │   │   └── projectile-motion/page.tsx # Flagship Projectile Motion
│       │   ├── studio/           # Mathematical & 2D/3D studio
│       │   ├── labs/             # Virtual instrumentation & experiments
│       │   ├── library/          # Saved configurations & curriculum
│       │   └── api/              # Server-side endpoints & validation
│       ├── src/components/       # UI components (Canvas, Graphs, Equations)
│       └── src/lib/auth/         # RBAC, permissions & session definitions
│
├── packages/
│   ├── simulation-core/          # Pure TypeScript scientific engine
│   │   ├── src/models/           # Analytical physics models (Projectile Motion)
│   │   ├── src/engine/           # Simulation clock, controller, snapshots
│   │   ├── src/validation/       # Runtime parameter validation & constraints
│   │   ├── src/utils/            # SI units, angle conversions, invariants
│   │   └── __tests__/            # 63 unit & physics validation tests
│   │
│   └── ui/                       # Design system & scientific UI components
│       ├── src/components/       # Sliders, controls, readouts, cards, theme
│       └── src/lib/              # Design tokens, themes, utilities
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

---

## Flagship Experiment: Projectile Motion

The flagship release includes a scientifically validated, analytical projectile motion simulation:

### Governing Equations (SI Units)
For ideal projectile motion in uniform gravity without aerodynamic drag:

$$x(t) = v_0 \cos(\theta) t$$

$$y(t) = y_0 + v_0 \sin(\theta) t - \frac{1}{2} g t^2$$

$$v_x(t) = v_0 \cos(\theta) \quad (\text{constant})$$

$$v_y(t) = v_0 \sin(\theta) - g t$$

$$a_x(t) = 0, \quad a_y(t) = -g$$

### Analytical Maxima & Invariants
- **Total Flight Time ($t_f$):** Solved via quadratic formula $y_0 + v_{0y} t - \frac{1}{2} g t^2 = 0$:
  $$t_f = \frac{v_0 \sin(\theta) + \sqrt{v_0^2 \sin^2(\theta) + 2 g y_0}}{g}$$
- **Maximum Apex Height ($h_{\max}$):**
  $$h_{\max} = y_0 + \frac{v_0^2 \sin^2(\theta)}{2 g}$$
- **Horizontal Range ($R$):**
  $$R = x(t_f) = v_0 \cos(\theta) t_f$$
- **Conservation of Energy:** Specific mechanical energy $E = \frac{1}{2} v^2 + g y$ is conserved throughout the trajectory.

---

## Quick Start & Verification

### Prerequisites
- Node.js $\ge$ 20.0.0
- pnpm $\ge$ 9.0.0 (or pnpm 10+)

### 1. Installation
```bash
# Clone the repository and navigate into it
cd Prismora

# Install all workspace dependencies
pnpm install
```

### 2. Run Automated Verification Tests
```bash
# Run all workspace unit tests (Vitest)
pnpm test

# Run pure physics engine tests
pnpm test:unit

# Run strict TypeScript typecheck across all packages
pnpm typecheck
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- Explore Catalog: `http://localhost:3000` or `http://localhost:3000/explore`
- Flagship Simulation: `http://localhost:3000/experiments/projectile-motion`

### 4. Production Build
```bash
pnpm build
```

---

## Role-Based Access Control (RBAC) & Security

Prismora provides an extensible, server-verified authorization matrix:
- **Public & Anonymous:** Full unhindered access to run simulations, tweak parameters, and export JSON experiment configs.
- **Student / Researcher / Educator:** Experiment saving, custom notes, classroom assignment management.
- **Platform Admin / Super Admin:** System governance and content moderation.

Server-side endpoints validate permissions and parameters at trust boundaries (`/api/experiments` and `/api/health`).

---

## License

MIT License. Open-source scientific software for research, education, and exploration.
