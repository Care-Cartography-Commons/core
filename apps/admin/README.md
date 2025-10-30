# Care Cartography Commons - Admin Panel

Administration interface for managing institutions and viewing ratings data.

## Features

- **Institution Management**
  - Create new institutions with custom ID and name
  - Edit existing institution names
  - Delete institutions (cascades to ratings)
  - View institution details with all ratings

- **User Interface**
  - Bootstrap 5 styling for clean, professional appearance
  - Responsive table layout for institution list
  - Modal forms for create/edit operations
  - Confirmation dialogs for destructive actions
  - Toast notifications for success/error feedback
  - Loading states and error handling

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (default: http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Configuration

Create a `.env` file to configure the API URL:

```env
VITE_API_URL=http://localhost:8000
```

## Architecture

- **React 19** with TypeScript
- **Bootstrap 5** for styling
- **Vite** for build tooling
- **REST API** integration via fetch

### Components

- `App.tsx` - Main application container with state management
- `InstitutionList.tsx` - Table view of all institutions with action buttons
- `InstitutionForm.tsx` - Create/edit form modal
- `InstitutionDetail.tsx` - Detailed view of single institution with ratings
- `Toast.tsx` - Success/error notification component

### API Integration

All API calls are centralized in `api.ts`:
- `listInstitutions()` - GET /api/institutions
- `getInstitution(id)` - GET /api/institutions/{id}
- `createInstitution(data)` - POST /api/institutions
- `updateInstitution(id, data)` - PUT /api/institutions/{id}
- `deleteInstitution(id)` - DELETE /api/institutions/{id}

## Future Enhancements

- Authentication (JWT/OAuth)
- Data filtering by date range
- Export to CSV/JSON
- Bulk operations
- Rating analytics and visualizations