# IMPULSA.ME - Plataforma de Crowdfunding

## Project Overview

IMPULSA.ME is a Bolivian crowdfunding platform focused on campaigns in Bolivianos (Bs). The platform enables creators to publish projects that go through an approval flow, while authenticated users can support projects through simulated donations via QR codes. Projects use editor.js for rich content and support image galleries (max 10 images with cover image).

**Key Features:**
- User authentication with email verification (5-digit token)
- Project creation with rich content editor (editor.js)
- Admin approval workflow for projects
- Simulated QR-based donations
- Favorites system
- Project metrics and KPIs
- Multi-language support (Spanish primary)

## Technology Stack

**Backend:**
- Node.js with Express (implied from structure)
- PostgreSQL database with comprehensive schema
- JWT/session-based authentication
- Repository pattern for data access

**Frontend:**
- HTML5, CSS3, JavaScript (vanilla)
- Editor.js for rich content
- Responsive design with mobile support
- Deep-linking navigation system

**Database:**
- PostgreSQL with custom enums and constraints
- Comprehensive indexing for performance
- Soft delete patterns for data integrity
- Audit logging for critical actions

## Project Structure

```
D:\WEB-I-2\Proyecto_Final_7pm_03\Proyecto_Final\
├── controllers/          # Request handlers
│   ├── authController.js
│   └── userController.js
├── repositories/         # Data access layer
│   ├── authRepository.js
│   └── userRepository.js
├── db/                   # Database configuration
│   └── dbConnection.js
├── public/               # Static frontend files
│   ├── admin/           # Admin interface
│   ├── assets/          # CSS, JS, images
│   ├── user/            # User dashboard
│   └── *.html           # Main pages
├── routes/               # API route definitions (empty)
├── db_impulsames.sql    # Complete database schema
├── seed.sql             # Sample data
├── index.js             # Main entry point (empty)
└── package.json         # Dependencies
```

## Database Architecture

### Core Tables
- **users**: User accounts with roles (usuario/admin) and status management
- **user_tokens**: 5-digit verification codes with expiration
- **categories**: Project categories with dynamic requirements
- **projects**: Main project entity with approval workflow
- **project_images**: Image management (max 10, unique cover)
- **donations**: Contribution tracking with status management
- **favorites**: User-project relationships
- **audit_logs**: Administrative action tracking

### Key Features
- **Approval Workflow**: borrador → en_revision → observado/publicado/rechazado
- **Campaign States**: no_iniciada, en_progreso, en_pausa, finalizada
- **Soft Deletes**: Preserves data integrity for KPIs
- **Comprehensive Indexing**: Optimized for common queries
- **View-based Metrics**: project_stats for performance

## Development Guidelines

### Code Style
- Spanish naming for business entities (proyectos, categorías, etc.)
- English for technical implementation (controllers, repositories)
- Repository pattern for data access
- Async/await for asynchronous operations
- Comprehensive error handling

### Security Considerations
- Email verification required for registration
- Token-based authentication with 15-minute expiration
- Admin approval required for project publication
- Soft delete to preserve audit trails
- Input validation at repository level

### Performance Optimization
- Database indexes on frequently queried fields
- Materialized view for project statistics
- Connection pooling for database operations
- Optimized queries with proper JOINs

## Build and Run Commands

```bash
# Install dependencies
npm install

# Database setup
psql -U postgres -d db_Impulsame -f db_impulsames.sql
psql -U postgres -d db_Impulsame -f seed.sql

# Start application (when implemented)
npm start
```

## Environment Configuration

Create `.env` file with:
```
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=master123
PG_DATABASE=db_Impulsame
PG_PORT=5432
PORT=3000
UPLOADS_PATH=d:/NUR/2-2024/images-uploaded
```

## Testing Strategy

- Unit tests for repository methods
- Integration tests for API endpoints
- Database constraint validation
- Frontend component testing
- Security testing for authentication flows

## Deployment Process

1. Database migration execution
2. Environment variable configuration
3. Static asset optimization
4. Process manager setup (PM2 recommended)
5. Reverse proxy configuration (nginx)
6. SSL certificate installation

## API Structure (Planned)

**Authentication:**
- POST /auth/register
- POST /auth/verify
- POST /auth/login
- POST /auth/resend-code

**Projects:**
- POST /projects
- GET /projects
- PATCH /projects/:id
- POST /projects/:id/submit

**Admin:**
- POST /admin/projects/:id/observe
- POST /admin/projects/:id/publish
- POST /admin/projects/:id/reject

## Frontend Features

- **Dashboard Tabs**: Deep-linking navigation (proyectos, aportes, favoritos)
- **Responsive Design**: Mobile-first approach
- **Rich Content Editor**: Editor.js integration
- **Image Management**: Multi-upload with cover selection
- **Progress Tracking**: Visual progress bars and metrics

## Current Status

- Database schema: Complete ✅
- Basic repository structure: Implemented ✅
- Frontend templates: Complete ✅
- Authentication: Partial implementation ⚠️
- API routes: Not implemented ❌
- Business logic: Not implemented ❌

## Next Steps

1. Implement Express server with route definitions
2. Complete authentication controller logic
3. Implement project CRUD operations
4. Add admin approval workflow
5. Integrate QR payment simulation
6. Implement file upload handling
7. Add comprehensive error handling
8. Create API documentation