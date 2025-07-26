# Location Finder Application

## Overview

This is a modern web application that provides geolocation services including address-to-coordinates conversion, reverse geocoding, IP geolocation, and interactive mapping. Built with React, TypeScript, and Express.js, it offers a comprehensive suite of location-based tools with a clean, responsive user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Maps**: Leaflet with react-leaflet for interactive maps

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: Neon PostgreSQL (serverless)
- **API Style**: RESTful API with JSON responses
- **Session Storage**: PostgreSQL sessions with connect-pg-simple

### Development Setup
- **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`)
- **Hot Reload**: Vite dev server with HMR
- **Type Safety**: Shared TypeScript schemas between client and server
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)

## Key Components

### Frontend Components
1. **LocationMap**: Interactive map component using Leaflet
2. **CoordinatesDisplay**: Shows GPS coordinates in multiple formats (DD, DMS)
3. **AddressDetails**: Displays formatted address information
4. **IpInfo**: Shows network/IP geolocation data
5. **SearchTools**: Address/coordinate search interface
6. **PermissionModal**: Handles geolocation permission requests

### Backend Services
1. **Geocoding API**: Converts addresses to coordinates using OpenStreetMap Nominatim
2. **Reverse Geocoding**: Converts coordinates back to addresses
3. **IP Geolocation**: Determines location from IP addresses
4. **Storage Layer**: Abstracted storage interface with in-memory implementation

### Shared Schema
- **Zod Validation**: Type-safe data validation across client/server boundary
- **TypeScript Types**: Generated from Zod schemas for consistency
- **API Contracts**: Strongly typed request/response interfaces

## Data Flow

### Location Detection Flow
1. User requests current location
2. Browser geolocation API provides coordinates
3. Coordinates sent to reverse geocoding service
4. Address information retrieved and displayed
5. Location data stored in memory storage

### Search Flow
1. User enters address or coordinates in search field
2. Input validated and parsed (coordinate detection vs address)
3. Appropriate geocoding service called (forward or reverse)
4. Results displayed on map and in information panels
5. Location state updated throughout application

### External API Integration
- **Nominatim OpenStreetMap**: Free geocoding service for address resolution
- **Browser Geolocation API**: Native location detection
- **IP Geolocation Services**: For network-based location detection

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Mapping**: Leaflet, react-leaflet for interactive maps
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Forms**: React Hook Form, Hookform resolvers
- **Utilities**: date-fns, clsx, nanoid

### Backend Dependencies
- **Core**: Express.js, TypeScript
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Session**: express-session, connect-pg-simple
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, esbuild for building

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **ESBuild**: Backend bundling for production
- **TypeScript**: Type checking and compilation
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server on client directory
- **Backend**: tsx watch mode for hot reloading
- **Database**: Neon PostgreSQL with Drizzle migrations
- **Environment**: Shared development environment with proxy setup

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Production Neon PostgreSQL instance

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Defined in `shared/schema.ts` for consistency
- **Connection**: Neon serverless driver with connection pooling
- **Storage**: Fallback in-memory storage for development

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL
- **API Keys**: Configured for external geocoding services
- **Session Secret**: Required for session management
- **Node Environment**: Development/production mode switching

The application follows a modern full-stack architecture with strong type safety, responsive design, and scalable deployment patterns. The use of shared schemas ensures consistency between frontend and backend, while the modular component structure allows for easy maintenance and feature additions.