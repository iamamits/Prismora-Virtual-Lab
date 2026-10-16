# Contributing to Prismora Virtual Lab 🔬

Thank you for your interest in contributing to **Prismora**! We are building the next-generation open-source scientific simulation and virtual engineering laboratory platform, and we welcome contributions from educators, students, engineers, and researchers worldwide.

---

## 🛠️ Development Setup

Prismora is a pnpm monorepo.

### Prerequisites
- **Node.js**: $\ge 20.0.0$
- **pnpm**: $\ge 9.0.0$ (or pnpm 10+)
- **Git**

### Installation
```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/Prismora-Virtual-Lab.git
cd Prismora-Virtual-Lab

# 2. Install workspace dependencies
pnpm install

# 3. Start local development server
pnpm dev
```

---

## 📐 Project Structure

```
Prismora/
├── apps/
│   └── web/                   # Next.js 16 App Router application
├── packages/
│   ├── simulation-core/       # Framework-agnostic simulation & mathematical models
│   └── ui/                    # Design system components, tokens & branding
```

---

## 🧪 Testing & Quality Standards

Before opening a pull request, ensure your code satisfies all quality checks:

```bash
# 1. Typecheck the entire monorepo
pnpm -r typecheck

# 2. Run all unit and analytical validation tests
pnpm -r test

# 3. Run Playwright end-to-end integration tests
pnpm --filter @prismora/web test:e2e

# 4. Verify production build
pnpm --filter @prismora/web build
```

---

## 🎨 Design Guidelines

When creating UI components or new simulation views:
- **Light Theme Exclusively:** Prismora uses a dedicated light theme to resemble clean laboratory notebooks and scientific journals.
- **Zero Gradients:** Use solid, high-contrast colors according to our discipline palette (Electric Blue for Physics, Coral Red for ECE, Royal Violet for Math/Automata, Emerald Green for Digital Logic, Amber Gold for COA).
- **Decoupled Physics Engine:** All scientific logic, numerical models, and state calculation MUST live in `@prismora/simulation-core` and be 100% testable without React or the DOM.

---

## 💬 Code of Conduct

Be welcoming, inclusive, and respectful. Discrimination, harassment, or disrespectful behavior of any kind will not be tolerated.

---

## 📄 License

By contributing to Prismora, you agree that your contributions will be licensed under its [MIT License](LICENSE).
