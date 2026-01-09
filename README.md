# Hypotheek Buddy 🏠

A modern, interactive mortgage visualization tool built for the Dutch market. This application allows users to simulate and analyze their mortgage scenarios with precision, providing deep insights into monthly costs, tax benefits (Hypotheekrenteaftrek), and the impact of the *Wet Hillen* phase-out.

![Hypotheek Buddy Screenshot](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## ✨ Features

- **Multi-Part Mortgages**: Support for adding multiple mortgage parts (Annuity/Linear) with different rates and terms.
- **Detailed Visualization**:
  - Interactive **Stacked Area Chart** showing the exact breakdown of Repayment, Interest, and Tax Costs.
  - **Gross vs. Net** toggle to visualize the impact of tax deductions.
  - **Individual vs. Combined** views to isolate specific mortgage parts.
- **Dutch Tax Logic**:
  - Integrated historical tax rates (HRA) and future projections.
  - Automatic calculation of **Eigenwoningforfait** (EWF).
  - Simulation of the **Wet Hillen** phase-out effect.
- **Responsive Design**: Built with Tailwind CSS for a clean, mobile-friendly experience.

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Charting**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Wories/hypotheek-buddy.git
    cd hypotheek-buddy
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## 📸 Screenshots

*(Add screenshots of your application here)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
