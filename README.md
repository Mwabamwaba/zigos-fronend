# ZigOS Frontend

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-5.4.11-green)](https://vitejs.dev/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-cyan)](https://tailwindcss.com/)

A modern, intelligent business operations platform frontend built with React, TypeScript, and Tailwind CSS. ZigOS streamlines Statement of Work (SOW) creation, project management, and approval workflows with AI-powered assistance.

##  Features

### Core Business Features

####  SOW Management
- **Intelligent SOW Builder**: Create professional Statements of Work with AI assistance
- **Template System**: Customizable templates with section-level configuration
- **Real-time Preview**: Live document preview with professional formatting
- **Version Control**: Track changes and maintain document history
- **Export Options**: PDF export with custom styling

####  Project Dashboard
- **Analytics Overview**: Project metrics, SOW status, and performance indicators
- **Project Tracking**: Comprehensive project lifecycle management
- **Work Breakdown Structure**: Visual project planning with interactive diagrams
- **Timeline Management**: Gantt charts and milestone tracking
- **Resource Allocation**: Team assignment and capacity planning

####  Approval Workflows
- **Multi-stage Approvals**: Configurable approval chains
- **Digital Signatures**: Integration-ready for DocuSign and similar platforms
- **Audit Trail**: Complete approval history and change tracking
- **Notification System**: Real-time updates and status notifications

#### 🤖 AI Assistant
- **Content Suggestions**: Intelligent recommendations for SOW content
- **Document Analysis**: AI-powered review and optimization
- **Smart Templates**: Dynamic template selection based on project type
- **Question Flow**: Guided content creation process

#### 👥 Team Management
- **Role-based Access**: Granular permissions and access control
- **Team Roster**: Member management with skill tracking
- **Collaboration Tools**: Real-time editing and communication
- **Workload Distribution**: Balanced task assignment

### Technical Features

####  User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: WCAG 2.1 AA compliant interface
- **Dark Mode**: System preference-aware theme switching
- **Keyboard Navigation**: Full keyboard accessibility support
- **Performance Optimized**: Code splitting and lazy loading

####  Developer Experience
- **TypeScript**: Full type safety and IntelliSense
- **Component Library**: Reusable, well-documented components
- **State Management**: Zustand for predictable state management
- **Testing Ready**: Jest and React Testing Library setup
- **ESLint + Prettier**: Consistent code formatting

##  Project Structure

```
FrontEnd/
├── src/
│   ├── components/           # React components
│   │   ├── AIAssistant/      # AI-powered features
│   │   ├── Dashboard/        # Dashboard and analytics
│   │   ├── SOW/              # SOW management
│   │   ├── project/          # Project management
│   │   ├── ApprovalWorkflow/ # Approval processes
│   │   ├── TeamManagement/   # Team collaboration
│   │   └── ui/               # Reusable UI components
│   ├── store/                # Zustand state management
│   │   ├── sowStore.ts       # SOW state
│   │   ├── projectStore.ts   # Project state
│   │   ├── teamStore.ts      # Team state
│   │   └── aiStore.ts        # AI assistant state
│   ├── services/             # API and business logic
│   │   ├── api/              # HTTP client configuration
│   │   ├── sowService.ts     # SOW-related services
│   │   ├── projectService.ts # Project services
│   │   └── teamService.ts    # Team services
│   ├── hooks/                # Custom React hooks
│   │   ├── useApi.ts         # API interaction hook
│   │   ├── useAutoSave.ts    # Auto-save functionality
│   │   └── useProject.ts     # Project data hook
│   ├── types/                # TypeScript type definitions
│   │   ├── sow.ts            # SOW-related types
│   │   ├── project.ts        # Project types
│   │   └── types.ts          # Global types
│   ├── data/                 # Mock data and constants
│   │   ├── templates.ts      # SOW templates
│   │   ├── aiModels.ts       # AI model configurations
│   │   └── mockUsers.ts      # Development data
│   └── utils/                # Utility functions
│       ├── pdfExport.ts      # PDF generation
│       └── sowAnalyzer.ts    # Document analysis
├── public/                   # Static assets
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── CODING_STANDARDS.md   # Development standards
│   └── INTEGRATION_GUIDE.md  # Third-party integrations
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

##  Prerequisites

Before setting up the frontend, ensure you have:

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

##  Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ZigOs.git
cd ZigOs/FrontEnd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

##  Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run unit tests (when configured) |

##  UI Components and Design System

### Component Library
The application uses a custom component library built on top of:
- **Headless UI**: Unstyled, accessible components
- **Lucide React**: Beautiful SVG icons
- **Tailwind CSS**: Utility-first CSS framework

### Key Components

#### Form Components
```typescript
import { Button, Input, Select, Textarea } from './components/ui';

// Usage example
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Create SOW
</Button>
```

#### Layout Components
```typescript
import { Sidebar, TopBar, Dashboard } from './components';

// Main application layout
<div className="h-screen flex">
  <Sidebar />
  <main className="flex-1">
    <TopBar />
    <Dashboard />
  </main>
</div>
```

#### Business Components
- **SOWBuilder**: Main SOW creation interface
- **ProjectDashboard**: Project overview and metrics
- **ApprovalWorkflow**: Approval status and actions
- **AIAssistant**: Intelligent content assistance

### Styling Guidelines

#### Tailwind CSS Classes
```css
/* Common patterns */
.card { @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6; }
.btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700; }
.input-field { @apply border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500; }
```

#### Responsive Design
```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>
```

##  State Management

The application uses Zustand for state management with separate stores for different domains:

### SOW Store
```typescript
import { useSOWStore } from './store/sowStore';

const { documents, createDocument, updateDocument } = useSOWStore();
```

### Project Store
```typescript
import { useProjectStore } from './store/projectStore';

const { projects, createProject, updateProject } = useProjectStore();
```

### AI Store
```typescript
import { useAIStore } from './store/aiStore';

const { currentModel, suggestions, generateContent } = useAIStore();
```

## 🌐 API Integration

### HTTP Client Configuration
```typescript
// src/services/api/httpClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7071/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Service Layer
```typescript
// Example SOW service
import { apiClient } from './api/httpClient';

export const sowService = {
  async createSOW(sowData: CreateSOWRequest): Promise<SOW> {
    const response = await apiClient.post('/sows', sowData);
    return response.data;
  },
  
  async getSOWs(): Promise<SOW[]> {
    const response = await apiClient.get('/sows');
    return response.data;
  },
};
```

## 🧪 Testing Strategy

### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Component Testing Example
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders application without crashing', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
```

## 🌐 Deployment

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
VITE_API_URL=http://localhost:7071/api
VITE_APP_ENV=development

# .env.production
VITE_API_URL=https://your-api.azurewebsites.net/api
VITE_APP_ENV=production
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
        },
      },
    },
  },
});
```

### Netlify Deployment
```bash
# Build settings
Build command: npm run build
Publish directory: dist
```

### Azure Static Web Apps
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [ main ]
    paths: [ 'FrontEnd/**' ]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: FrontEnd/package-lock.json
    
    - name: Install dependencies
      run: |
        cd FrontEnd
        npm ci
    
    - name: Build application
      run: |
        cd FrontEnd
        npm run build
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: 'upload'
        app_location: '/FrontEnd'
        output_location: 'dist'
```

##  Security Best Practices

### Authentication
- Implement JWT token-based authentication
- Store tokens securely (httpOnly cookies recommended)
- Implement automatic token refresh

### API Security
```typescript
// Add authentication headers
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Input Validation
```typescript
import { z } from 'zod';

const sowSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10),
  value: z.number().positive(),
});

// Validate form data
const result = sowSchema.safeParse(formData);
```

##  Performance Optimization

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const SOWBuilder = lazy(() => import('./components/SOW/SOWBuilder'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SOWBuilder />
    </Suspense>
  );
}
```

### Image Optimization
```typescript
// Use WebP format with fallbacks
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Description" loading="lazy" />
</picture>
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

## 🐛 Debugging and Troubleshooting

### Development Tools
- **React Developer Tools**: Browser extension for React debugging
- **Redux DevTools**: State management debugging (if using Redux)
- **Vite DevTools**: Build and performance analysis

### Common Issues

#### 1. Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

#### 3. Build Failures
```bash
# Check for unused imports and variables
npm run lint

# Clear Vite cache
rm -rf .vite
```

### Error Boundary Implementation
```typescript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Follow coding standards (see [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md))
3. Write tests for new features
4. Run linting: `npm run lint`
5. Create pull request with detailed description

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components are properly tested
- [ ] Accessibility standards are met
- [ ] Performance considerations are addressed
- [ ] Documentation is updated

## 📚 Additional Resources

### Documentation
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Coding Standards](./docs/CODING_STANDARDS.md)
- [Integration Guide](./docs/INTEGRATION_GUIDE.md)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🆘 Support

For frontend-specific issues:
- Check browser developer console for errors
- Review React DevTools for component state
- Verify API endpoints are accessible
- Check network tab for failed requests
- Create detailed issues in the project repository

### Getting Help
- Search existing issues before creating new ones
- Include steps to reproduce problems
- Provide browser and OS information
- Include relevant error messages and logs

---

**ZigOS Frontend** - Modern, intelligent interface for next-generation business operations.