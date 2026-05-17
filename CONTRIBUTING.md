# Contributing to Virtual Science Lab

Thank you for your interest in contributing to the project! 🎉

We welcome contributions that improve the Virtual Science Lab experience, including:

- Bug fixes
- UI improvements
- New features
- Documentation updates
- Performance enhancements

Whether you're a beginner or an experienced developer, your contributions are appreciated ❤️

---

## Detailed Project Structure

```text
Virtual_Science_lab/
├── Backend/                         # FastAPI backend server
│   ├── app/
│   │   ├── api/                    # API route definitions
│   │   │   └── routes.py
│   │   ├── core/                   # Core configuration files
│   │   │   └── config.py
│   │   ├── models/                 # Database/data models
│   │   │   └── ...
│   │   ├── services/               # Business logic and services
│   │   │   └── logic.py
│   │   ├── schemas.py              # Request/response schemas
│   │   └── main.py                 # Backend entry point
│   ├── requirements.txt            # Python dependencies
│   └── run.sh                      # Script to run backend server
│
├── frontend/                       # React + Vite frontend
│   ├── src/
│   │   ├── assets/                 # Static assets and videos
│   │   │   └── videos/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── SubjectCard.jsx
│   │   │   ├── ExperimentCard.jsx
│   │   │   └── ...
│   │   ├── context/               # React context providers
│   │   │   └── ThemeContext.jsx
│   │   ├── data/                  # JSON experiment data
│   │   │   ├── biology.json
│   │   │   ├── chemistry.json
│   │   │   └── physics.json
│   │   ├── experiments/           # Experiment-related pages/files
│   │   │   ├── biology/
│   │   │   ├── chemistry/
│   │   │   └── physics/
│   │   ├── pages/                 # Main application pages
│   │   │   ├── Home.jsx
│   │   │   ├── Physics.jsx
│   │   │   ├── Chemistry.jsx
│   │   │   └── Biology.jsx
│   │   ├── styles/                # Global and component styles
│   │   │   └── ...
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── package.json                # Frontend dependencies/scripts
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── eslint.config.js           # ESLint configuration
│
├── README.md                       # Project overview and setup
├── CONTRIBUTING.md                 # Contribution guidelines
└── .gitignore                      # Ignored files and folders
```

---

## Getting Started

### 1) Fork the Repository

Click the **Fork** button at the top-right corner of the repository page.

Then clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/Virtual_Science_lab.git
cd Virtual_Science_lab
```

### 2) Create a New Branch

Always create a separate branch before making changes:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b fix/navbar-bug
git checkout -b docs/update-readme
git checkout -b feature/dark-mode
```

---

## Setup Instructions

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

Open a new terminal and run:

```bash
cd Backend
pip install -r requirements.txt
bash run.sh
```

---

## Contribution Guidelines

Please follow these guidelines before submitting your contribution:

- Write clean and readable code.
- Keep pull requests focused on a single issue or feature.
- Test your changes locally before submitting.
- Follow the existing folder structure.
- Avoid unnecessary files or large unrelated changes.
- Update documentation when necessary.

---

## Commit Message Guidelines

Use meaningful and descriptive commit messages.

Examples:

```bash
git commit -m "Add dark mode toggle"
git commit -m "Fix experiment routing issue"
git commit -m "Update CONTRIBUTING.md"
```

---

## Submitting a Pull Request

After committing your changes, push your branch:

```bash
git push origin your-branch-name
```

Then:

1. Open your fork on GitHub
2. Click **Compare & Pull Request**
3. Add a clear PR title and description
4. Submit the Pull Request

---

## Pull Request Checklist

Before submitting a PR, make sure:

- The project runs successfully.
- Changes were tested locally.
- No unnecessary files were added.
- Documentation is updated if needed.
- The PR addresses a specific issue.

---

## Reporting Issues

If you discover bugs or want to suggest improvements:

1. Open the **Issues** tab
2. Search existing issues first
3. Create a detailed issue if it does not already exist

Include:

- Steps to reproduce the issue
- Expected behavior
- Screenshots (if applicable)

---

## Code of Conduct

Please be respectful and constructive while contributing.

We appreciate every contribution made to this project ❤️

