# University Evaluation System

A comprehensive web-based student management system with **polymorphic grade calculations**, **role-based access control**, and **real-time GPA updates**. The system evaluates students differently based on their course type (Engineering or Management), implementing different GPA calculation methodologies.

## 🎯 Overview

The University Evaluation System is a full-stack web application built with **React**, **Express**, **tRPC**, and **MySQL**. It demonstrates advanced Object-Oriented Programming principles including:

- **Polymorphism**: Different grade calculation strategies for Engineering vs Management students
- **Inheritance**: Student hierarchy with specialized types
- **Encapsulation**: Role-based access control and data protection
- **Abstraction**: Clean API interfaces for complex operations

## ✨ Key Features

### 📊 Polymorphic Grade Calculation

The system implements two distinct GPA calculation methods:

| Student Type | Calculation Method | Formula |
|---|---|---|
| **Engineering** | Simple Average | Average of all course grades converted to 4.0 scale |
| **Management** | Credit-Weighted Average | Σ(Grade × Credits) ÷ Total Credits, converted to 4.0 scale |

**Grade Conversion Scale:**
- 90-100 → 4.0 GPA
- 80-89 → 3.0 GPA
- 70-79 → 2.0 GPA
- 60-69 → 1.0 GPA
- Below 60 → 0.0 GPA

### 👥 Role-Based Access Control

#### Admin Dashboard
- Create, read, update, and delete students
- Manage courses and enrollments
- Set and monitor student grades
- View student statistics and analytics
- Access to all student records

#### Student Portal
- View personal profile and GPA
- Enroll in available courses
- Track enrolled courses and credits
- View grades and transcripts
- Download/print official transcripts

### 🎓 Core Functionality

#### Student Management
- Create students with type designation (Engineering/Management)
- Track enrollment year and major
- Automatic GPA calculation based on student type
- Real-time updates when grades are modified

#### Course Management
- Create and manage courses with course codes
- Define course credits (1-4 credits typical)
- Track course prerequisites (optional)
- Manage course capacity and enrollment

#### Grade Management
- Set grades with validation (0-100 range)
- Automatic GPA conversion on 4.0 scale
- Real-time GPA recalculation on grade updates
- Grade history and audit trail
- Bulk grade operations support

#### Transcript Generation
- Official academic transcript display
- Includes all enrolled courses with grades and credits
- Shows calculation method used
- Printable/exportable format
- GPA breakdown and summary

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- Wouter for routing
- tRPC React Query for API calls

**Backend:**
- Express.js 4 for HTTP server
- tRPC 11 for type-safe API
- Drizzle ORM for database operations
- MySQL 2 for database driver

**Database:**
- MySQL/TiDB for data persistence
- Drizzle migrations for schema management

**Testing:**
- Vitest for unit tests
- 17 passing tests for GPA calculations

### Project Structure

```
university-evaluation-web/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page with feature overview
│   │   │   ├── AdminDashboard.tsx  # Admin student management
│   │   │   ├── StudentProfile.tsx  # Student profile & enrollment
│   │   │   ├── GradeManagement.tsx # Grade entry interface
│   │   │   └── Transcript.tsx      # Official transcript view
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx # Sidebar navigation
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── lib/trpc.ts             # tRPC client setup
│   │   ├── App.tsx                 # Main router
│   │   └── index.css               # Global styles
│   └── package.json
├── server/                          # Express backend
│   ├── routers.ts                  # tRPC procedure definitions
│   ├── db.ts                       # Database query helpers
│   ├── gpaCalculator.ts            # GPA calculation logic
│   ├── gpaCalculator.test.ts       # GPA calculation tests
│   └── _core/                      # Framework internals
├── drizzle/
│   └── schema.ts                   # Database schema
└── package.json
```

## 📦 Database Schema

### Students Table
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  studentId VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('engineering', 'management') NOT NULL,
  enrollmentYear INT NOT NULL,
  major VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  courseCode VARCHAR(20) UNIQUE NOT NULL,
  courseName VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentId INT NOT NULL,
  courseId INT NOT NULL,
  enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

### Grades Table
```sql
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enrollmentId INT NOT NULL,
  courseId INT NOT NULL,
  grade INT NOT NULL CHECK (grade >= 0 AND grade <= 100),
  gpaScale DECIMAL(3,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollmentId) REFERENCES enrollments(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ or TiDB

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Aluro7in/university-evaluation-system-web.git
cd university-evaluation-system-web
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# Create .env file with your database URL
DATABASE_URL=mysql://user:password@localhost:3306/university_db
JWT_SECRET=your_jwt_secret_here
```

4. **Initialize database**
```bash
pnpm db:push
```

5. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### For Administrators

1. **Log in** with admin credentials
2. **Navigate to Dashboard** to manage students
3. **Create Students**:
   - Click "Add Student"
   - Enter Student ID (e.g., ENG001, MGT001)
   - Select student type (Engineering or Management)
   - Set enrollment year and major
4. **Manage Grades**:
   - Go to Grade Management
   - Select student and course
   - Enter grade (0-100)
   - GPA automatically recalculates
5. **View Analytics**:
   - Dashboard shows total students by type
   - Statistics on enrollment and GPA distribution

### For Students

1. **Log in** with student credentials
2. **View Profile**:
   - See current GPA and enrolled courses
   - View total credits earned
3. **Enroll in Courses**:
   - Click "Enroll Course" on profile
   - Select from available courses
   - Confirm enrollment
4. **Check Transcript**:
   - Go to Transcript page
   - View all courses, grades, and GPA
   - Print or download transcript

## 🧪 Testing

The project includes comprehensive vitest tests for GPA calculations:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- server/gpaCalculator.test.ts

# Run with coverage
pnpm test -- --coverage
```

### Test Coverage

- ✅ Percentage to GPA conversion (5 tests)
- ✅ Engineering GPA calculation (4 tests)
- ✅ Management GPA calculation (4 tests)
- ✅ Student GPA calculation (2 tests)
- ✅ Total: 17 passing tests

## 🔐 Security Features

- **Role-Based Access Control**: Admin and student roles with different permissions
- **Protected Procedures**: tRPC procedures protected with authentication
- **Input Validation**: Grade validation (0-100 range), student ID uniqueness
- **Data Isolation**: Students can only view their own data
- **Secure Sessions**: JWT-based session management

## 📊 API Endpoints

### Students
- `POST /api/trpc/students.create` - Create new student
- `GET /api/trpc/students.list` - List all students (admin only)
- `GET /api/trpc/students.get` - Get student by ID
- `DELETE /api/trpc/students.delete` - Delete student (admin only)
- `GET /api/trpc/students.me` - Get current student profile

### Courses
- `GET /api/trpc/courses.list` - List all courses

### Enrollments
- `POST /api/trpc/enrollments.enroll` - Enroll in course
- `GET /api/trpc/enrollments.list` - List student enrollments
- `DELETE /api/trpc/enrollments.unenroll` - Unenroll from course

### Grades
- `POST /api/trpc/grades.set` - Set grade for enrollment
- `GET /api/trpc/grades.list` - List grades for student
- `GET /api/trpc/grades.calculateGPA` - Calculate student GPA
- `GET /api/trpc/grades.transcript` - Generate transcript

## 🎨 UI Components

The application uses shadcn/ui components for a modern, accessible interface:

- **Button** - Action triggers
- **Card** - Content containers
- **Dialog** - Modal forms
- **Input** - Text input fields
- **Select** - Dropdown selections
- **Table** - Data display
- **Toast** - Notifications

## 🔄 Real-Time Updates

The system implements real-time GPA recalculation:

1. Admin sets a grade for a student
2. Grade is validated (0-100 range)
3. Grade is converted to GPA scale
4. Student's overall GPA is recalculated
5. Calculation method applied based on student type
6. UI updates automatically with new GPA

## 📈 Performance Considerations

- **Database Indexing**: Student ID and course code indexed for fast lookups
- **Query Optimization**: Efficient joins for enrollment and grade queries
- **Caching**: tRPC query caching for reduced database hits
- **Pagination**: Support for large student lists (future enhancement)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check database connection
pnpm db:push

# Verify DATABASE_URL in .env
```

### Authentication Errors
- Clear browser cookies and log in again
- Verify JWT_SECRET is set correctly

### Grade Calculation Issues
- Ensure all courses have valid credits
- Check that grades are in 0-100 range
- Verify student type is correctly set

## 🚀 Deployment

### Deploy to Manus
The application is built with Manus hosting in mind:

```bash
# Save checkpoint
pnpm webdev_save_checkpoint

# Publish via Manus UI
# Click Publish button in Management UI
```

### Deploy to Other Platforms

**Vercel/Netlify:**
```bash
# Build for production
pnpm build

# Deploy dist folder
```

**Docker:**
```dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📝 Future Enhancements

- [ ] Bulk grade import via CSV
- [ ] GPA distribution analytics dashboard
- [ ] Email notifications for grade postings
- [ ] Semester-based transcript view
- [ ] Academic probation alerts
- [ ] Course prerequisite enforcement
- [ ] Grade appeal workflow
- [ ] Student performance predictions

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

## 👨‍💻 Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for usage examples

## 🎓 Learning Resources

This project demonstrates:
- **OOP Principles**: Polymorphism, inheritance, encapsulation
- **Full-Stack Development**: React + Node.js + MySQL
- **Type Safety**: TypeScript and tRPC
- **Database Design**: Relational schema with proper indexing
- **API Design**: RESTful principles with tRPC
- **Testing**: Unit tests with Vitest
- **UI/UX**: Modern component-based design

---

**Built with ❤️ for educational excellence**

**Repository:** https://github.com/Aluro7in/university-evaluation-system-web

**Live Demo:** https://3000-i6nolbjfiuhswb4z80wzb-f821a848.sg1.manus.computer
