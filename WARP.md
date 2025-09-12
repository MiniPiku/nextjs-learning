# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js application that helps users find the nearest metro station based on their current location. The app uses the Geolocation API to get user coordinates, sends them to a backend API, and displays the nearest metro station with a route on Google Maps.

## Development Commands

```bash
# Development server (uses Turbopack for faster builds)
npm run dev

# Production build (uses Turbopack)
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### App Structure (Next.js App Router)
- `app/` - App Router directory structure
  - `layout.tsx` - Root layout with dark theme enabled
  - `page.tsx` - Main home page component
  - `globals.css` - Global styles with Tailwind CSS

### Components
- `MapComponent.tsx` - Google Maps integration with markers and directions
- `MetroInfo.tsx` - Displays metro station information
- `LocationFetcher.tsx` - Handles geolocation functionality (if needed)

### Library Structure
- `lib/api.ts` - Backend API integration functions
- `lib/index.ts` - Type definitions for UserLocation and MetroStation
- `lib/utils.ts` - Utility functions (Tailwind CSS class merging)

### Key Dependencies
- **Next.js 15.5.2** with App Router and Turbopack
- **@react-google-maps/api** for Google Maps integration
- **Tailwind CSS v4** for styling
- **shadcn/ui** components (configured in `components.json`)
- **TypeScript** for type safety

## Environment Variables Required

The application expects these environment variables:

```bash
NEXT_PUBLIC_BACKEND_URL=your_backend_api_url
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

## Application Flow

1. **Geolocation**: Uses `navigator.geolocation.getCurrentPosition()` to get user coordinates
2. **API Call**: Sends coordinates to `${NEXT_PUBLIC_BACKEND_URL}/metro/nearest/location?lat=${lat}&lon=${lon}`
3. **Map Rendering**: Displays user location and nearest metro station on Google Maps
4. **Route Display**: Uses Google Maps Directions API to show driving route

## API Integration

The backend API endpoint:
- `GET /metro/nearest/location?lat={lat}&lon={lon}`
- Returns: `{ "name": "Station Name", "lat": 40.7128, "lon": -74.0060 }`

## Development Notes

- Uses Turbopack for faster development builds
- Dark theme is enabled by default in the root layout
- Path aliases configured: `@/*` maps to project root
- ESLint configured with Next.js TypeScript rules
- PostCSS configured for Tailwind CSS v4

## Key Files for Modifications

- **Main functionality**: `app/page.tsx`
- **Map component**: `components/MapComponent.tsx`
- **API functions**: `lib/api.ts`
- **Type definitions**: `lib/index.ts`
- **Styling**: `app/globals.css`

## Testing the Application

1. Ensure environment variables are set
2. Run `npm run dev`
3. Visit `http://localhost:3000`
4. Allow location access when prompted
5. Verify API call to backend works
6. Check that map displays with markers and route