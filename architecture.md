# Online Learning Portal - System Architecture

## 1. System Architecture Overview
The application is a typical **MERN** stack application featuring a strict role-based access module.

*   **Frontend**: Built with **React** (using TypeScript and Vite), styled with **TailwindCSS**, and uses `react-router-dom` for navigation. Global state (like the current user and their role) is managed via `AuthContext`.
*   **Backend**: Powered by **Node.js** and **Express.js**. It exposes a RESTful API and utilizes **Mongoose** to interact with a MongoDB database. File storage involves specialized routing (supporting Multer, GridFS).

---

## 2. User Roles & The Core Workflow
The application revolves around 3 primary user roles, each with different permissions and designated dashboard views:

### A. Admin Flow
*   **Role Duty:** Ultimate platform controller.
*   **Workflow:**
    1.  Logs into the system (initial admin generated via `seedAdmin.js`).
    2.  Accesses the Admin Dashboard where they review registrations from Students and Teachers, approving or rejecting them.
    3.  Interacts with **Site Settings** (`/api/site-settings`), configuring the platform's visual branding (uploading background images, setting site logos).
    4.  Manages overarching platform content.

### B. Teacher Flow
*   **Role Duty:** Content creator.
*   **Workflow:**
    1.  Registers and waits for Admin approval.
    2.  Logs into the **Teacher Dashboard** (`<TeacherDashboard />` loaded at `/dashboard`).
    3.  **Course Module**: Creates a new course (`/create-course`), and edits existing courses (`/manage-course/:id`).
    4.  **Lesson & Material Module**: Uploads study materials (PDFs, docs) to a course and creates individual lessons.
    5.  **Quiz Module**: Generates interactive assessments mapped to their courses (`/create-quiz/:courseId`).

### C. Student Flow
*   **Role Duty:** Content consumer.
*   **Workflow:**
    1.  Registers and waits for Admin approval.
    2.  Logs into the **Student Dashboard** (`<StudentDashboard />` loaded at `/dashboard`), checking their enrollments.
    3.  Browses all available courses (`/courses`) and clicks into specific ones (`/courses/:id`).
    4.  Downloads related study materials to study.
    5.  Evaluates their knowledge by taking available quizzes (`/take-quiz/:id`).

---

## 3. Database Schema (Mongoose Models)
The data relationships holding the platform together include:

*   **Users (`Admin.js`, `Teacher.js`, `Student.js`)**: Defines the specific credentials, approval status (boolean), and role traits of platform members.
*   **`Course.js`**: Receptacle of primary curriculum. Contains a title, description, and the `Teacher` who created it.
*   **`Lesson.js`**: Sub-sections bound to a specific `Course`.
*   **`Quiz.js`**: Assessment module containing questions, options, correct answers, and references to the parent `Course`.
*   **`StudyMaterial.js`**: Contains file metadata (GridFS ids, file paths, format type) associated with courses.
*   **`SiteSettings.js`**: Stores dynamic site assets like Navbar logos or hero background images.

---

## 4. API Endpoints Flow (Backend)
The Express app maps specific domains of logic to distinct routes:

*   **Authentication Request flow (`/api/auth`)**: Validates credentials against user tables and issues a secure JWT along with role definitions (`admin`, `teacher`, `student`).
*   **Content Management flow (`/api/courses`, `/api/lessons`, `/api/quizzes`)**: Protected CRUD operations. Verification middleware ensures only Teachers can create/modify, while Students can only fetch (read).
*   **Asset Upload & Download flow (`/api/materials`, `/api/download/:id`)**: Routes that intercept files using Multer, storing them either on local`/uploads` or MongoDB (GridFS/Cloudinary), and securely streams them back when a user interacts with the download link.
*   **Configuration flow (`/api/site-settings`)**: Strictly Admin-accessible endpoints to modify dynamic UI variables that the React client pulls down upon loading `App.tsx` or `Navbar.tsx`.
