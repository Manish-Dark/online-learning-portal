const fs = require('fs');
const path = require('path');

const outputMdPath = path.join(__dirname, 'Full_Architecture_and_Codebase.md');

let mdContent = `# Comprehensive Architecture and Codebase Documentation for Online Learning Portal\n\n`;

mdContent += `## 1. System Architecture Overview\n`;
mdContent += `The application is a typical **MERN** stack application featuring strict role-based access control.\n`;
mdContent += `- **Frontend**: Built with **React** (TypeScript, Vite), styled with **TailwindCSS**, uses \`react-router-dom\` for navigation. Global state via \`AuthContext\`.\n`;
mdContent += `- **Backend**: Powered by **Node.js** and **Express.js**. Exposes a RESTful API and utilizes **Mongoose** for MongoDB. Handles complex file storage with Multer and GridFS.\n\n`;

mdContent += `## 2. User Interfaces (Image Placeholders)\n\n`;
const uiPlaceholders = [
    'Home Page / Landing Page',
    'User Registration Page',
    'User Login Page',
    'Admin Dashboard - Overview',
    'Admin Dashboard - User Approval List',
    'Admin Dashboard - Site Settings (Branding)',
    'Teacher Dashboard - Courses Overview',
    'Teacher Dashboard - Create/Edit Course',
    'Teacher Dashboard - Upload Material / Create Lesson',
    'Teacher Dashboard - Quiz Creation',
    'Student Dashboard - Enrolled Courses',
    'Student Dashboard - Course Catalog',
    'Student Dashboard - Taking a Quiz',
    'Student Dashboard - Downloading Materials'
];

uiPlaceholders.forEach(placeholder => {
    mdContent += `### 2.${uiPlaceholders.indexOf(placeholder) + 1} ${placeholder}\n`;
    mdContent += `\n\n\n\n<div style="width: 100%; height: 400px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem;">\n  <p style="color: #999; font-size: 1.5rem;">[Insert Screenshot of ${placeholder} Here]</p>\n</div>\n\n\n\n`;
});

mdContent += `\n## 3. Frontend Source Code (React / TypeScript)\n\n`;

const frontendDirs = [
    { name: 'Root', dir: 'client/src', files: ['App.tsx', 'main.tsx'] },
    { name: 'Context', dir: 'client/src/context' },
    { name: 'Pages', dir: 'client/src/pages' },
    { name: 'Components', dir: 'client/src/components' }
];

function appendFilesContent(baseDir, filesArray = null) {
    const fullDir = path.join(__dirname, baseDir);
    if (!fs.existsSync(fullDir)) return;

    let files = [];
    if (filesArray) {
        files = filesArray;
    } else {
        files = fs.readdirSync(fullDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));
    }

    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            mdContent += `### File: \`${baseDir}/${file}\`\n\n`;
            mdContent += `\`\`\`${file.endsWith('.tsx') || file.endsWith('.ts') ? 'typescript' : 'javascript'}\n`;
            mdContent += content;
            mdContent += `\n\`\`\`\n\n`;
        }
    });
}

frontendDirs.forEach(item => {
    mdContent += `\n### 3.${frontendDirs.indexOf(item) + 1} ${item.name}\n\n`;
    appendFilesContent(item.dir, item.files);
});

mdContent += `\n## 4. Backend Source Code (Node.js / Express)\n\n`;

const backendDirs = [
    { name: 'Root', dir: 'server', files: ['index.js'] },
    { name: 'Config', dir: 'server/config' },
    { name: 'Models', dir: 'server/models' },
    { name: 'Controllers', dir: 'server/controllers' },
    { name: 'Routes', dir: 'server/routes' },
    { name: 'Middleware', dir: 'server/middleware' }
];

backendDirs.forEach(item => {
    mdContent += `\n### 4.${backendDirs.indexOf(item) + 1} ${item.name}\n\n`;
    appendFilesContent(item.dir, item.files);
});

fs.writeFileSync(outputMdPath, mdContent);
console.log('Successfully generated Full_Architecture_and_Codebase.md');
