# University Evaluation System - TODO

## Database & Schema
- [x] Create students table with type (Engineering/Management) and user relationship
- [x] Create courses table with code, name, and credits
- [x] Create enrollments table linking students and courses
- [x] Create grades table with validation and timestamps
- [x] Add database migrations and push schema

## Backend API
- [x] Create student CRUD endpoints (create, read, update, delete)
- [x] Create course management endpoints
- [x] Create enrollment endpoints (enroll, unenroll, list)
- [x] Create grade endpoints (set, get, validate 0-100 range)
- [x] Implement GPA calculation logic (Engineering: simple average, Management: credit-weighted)
- [x] Create transcript generation endpoint
- [x] Add role-based access control (admin vs student)
- [x] Implement real-time GPA recalculation on grade updates
- [x] Add error handling and validation

## Admin Dashboard
- [x] Create dashboard layout with sidebar navigation
- [x] Build student list view with search and filtering
- [x] Create add student form with type selection (Engineering/Management)
- [x] Create edit student form
- [x] Add delete student functionality
- [x] Implement role-based access (admin only)
- [x] Add student statistics and overview cards

## Student Management UI
- [x] Create student profile page
- [x] Build course enrollment interface
- [x] Create available courses list with filtering
- [x] Implement enroll/unenroll functionality
- [x] Add enrolled courses view with credit tracking

## Grade Management
- [x] Create grade entry form with validation (0-100)
- [x] Build grade viewing interface
- [x] Implement real-time GPA updates
- [x] Add grade history/audit trail
- [ ] Create bulk grade import (optional)

## Transcript & GPA Display
- [x] Build transcript page with course list, grades, and credits
- [x] Implement GPA display on 4.0 scale
- [x] Add calculation method indicator (Engineering vs Management)
- [x] Create printable/exportable transcript format
- [ ] Add GPA breakdown by semester (if applicable)

## Authentication & Authorization
- [x] Verify admin role setup in database
- [x] Create login/logout flow
- [x] Implement role-based route protection
- [x] Add admin-only features access control
- [x] Create student profile viewing restrictions

## UI/UX & Styling
- [x] Design clean, modern layout using shadcn/ui
- [x] Implement responsive design for mobile/tablet
- [x] Add loading states and error messages
- [x] Create empty states for lists
- [x] Add toast notifications for actions
- [x] Implement dark/light theme support

## Testing & Deployment
- [ ] Write vitest tests for API endpoints
- [ ] Test grade validation and GPA calculations
- [ ] Test role-based access control
- [ ] Verify responsive design across devices
- [ ] Create checkpoint before deployment
- [ ] Deploy to cloud and provide public URL

## Optional Enhancements
- [ ] Add semester/academic year support
- [ ] Implement grade distribution charts
- [ ] Add student performance analytics
- [ ] Create email notifications for grade updates
- [ ] Add bulk operations (import students, grades)
