# TimelessTreasures - Vintage Marketplace Frontend

TimelessTreasures is a frontend-only React application for a vintage products platform where users can buy, sell, exchange, and request repairs for collectibles such as cars, watches, clocks, rugs, cameras, and showpieces.

This project currently includes UI and routing flows. Backend, real authentication, payments API, and database integrations will be added later.

## Core Features

- Auth-first flow (`Login` / `Signup`) before entering app pages
- Marketplace listing page with product cards, photos, and detailed specs
- Dedicated pages for:
  - Repair
  - Exchange
  - Resell
  - Product comparison
- Drag-and-drop image upload UI in resale listing form
- Search, filter, and sort for product browsing
- Product details page with category, era, origin, material, dimensions, condition, and highlights
- Contact Us form in app footer
- Vintage-themed responsive UI design

## Tech Stack

- React
- Vite
- React Router DOM
- Plain CSS

## Project Structure

```text
src/
  components/
  data/
  pages/
  App.jsx
  main.jsx
  index.css
```

## Routes

### Public Routes

- `/login`
- `/signup`

### Protected App Routes

- `/app/marketplace`
- `/app/repair`
- `/app/exchange`
- `/app/resell`
- `/app/compare`
- `/app/product/:productId`

If user is not logged in, protected routes redirect to `/login`.

## How to Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - run development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks

## Current Frontend-Only Notes

- Login/signup uses simple frontend state with `localStorage` key: `vintage_auth`
- Razorpay section is a UI placeholder
- Uploaded photos (drag-drop) are currently selected in UI only (not persisted to backend yet)

## Planned Next Steps

- Node/Express backend APIs
- MongoDB Atlas integration
- Real auth (JWT/session)
- Real Razorpay order + signature verification flow
- Product CRUD with persistent image upload storage
