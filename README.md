# NeuJobScan - AI-Powered ATS Resume Optimization Platform

A modern, enterprise-grade ATS (Applicant Tracking System) optimization platform that helps job seekers optimize their resumes and improve their chances of landing interviews.

## 🚀 Features

- **Smart Resume Parsing**: AI-powered extraction of skills, experience, and qualifications from any resume format
- **ATS Optimization**: Optimize resumes to pass through Applicant Tracking Systems
- **Job Matching**: Precise match scores between resumes and job descriptions
- **Real-time Analysis**: Instant feedback and optimization suggestions
- **Multi-Agent AI System**: Advanced AI agents for resume analysis, job parsing, and matching
- **Modern UI**: Beautiful, responsive interface built with Next.js 15, TypeScript, and Framer Motion
- **Enterprise Architecture**: Scalable, secure, and production-ready codebase

## 🛠️ Tech Stack

**Hosting & Deployment**
- Node.js / Next.js (recommended for full features)
- Container-ready (Dockerfile + docker-compose provided)
- Apache static hosting (use `public/.htaccess` after `next export`)

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** components
- **Framer Motion** animations
- **React Hook Form** with Zod validation

### Backend & AI
- **Next.js API Routes**
- **OpenAI GPT-4** for AI analysis
- **Multi-agent AI architecture**
- **PDF parsing** with pdf-parse
- **Document parsing** with mammoth
- **File upload** with multer

### Authentication & Security
- **NextAuth.js** for authentication
- **JWT tokens**
- **Secure API architecture**
- **Input validation** with Zod

### Deployment
- **Vercel** ready (frontend + API)
- **Node.js** compatible for VPS/Hostinger
- **Environment configuration**
- **Production optimizations**

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neujobscan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── resume/        # Resume upload & parsing
│   │   ├── job/           # Job description parsing
│   │   └── ai/            # AI matching & analysis
│   ├── auth/              # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer
│   ├── resume/           # Resume-related components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility libraries
│   ├── ai/              # AI agents and orchestration
│   ├── parsers/         # Resume & job parsers
│   ├── auth.ts          # NextAuth configuration
│   ├── constants.ts     # App constants
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## 🤖 AI Agent Architecture

The platform uses a multi-agent AI system:

1. **ATS Analyzer Agent**: Analyzes resumes for ATS compatibility
2. **Match Maker Agent**: Creates resume-job matches with detailed scoring
3. **Optimization Agent**: Generates optimization suggestions
4. **Keyword Extractor Agent**: Extracts relevant keywords from text
5. **AI Agent Orchestrator**: Coordinates all AI agents

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume
- `POST /api/resume/parse` - Parse resume text
- `POST /api/resume/analyze` - Analyze resume with AI

### Job Management
- `POST /api/job/parse` - Parse job description
- `POST /api/job/analyze` - Analyze job requirements

### AI Matching
- `POST /api/ai/match` - Create resume-job match
- `POST /api/ai/optimize` - Get optimization suggestions
- `POST /api/ai/keywords` - Extract keywords

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | NextAuth.js URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `DATABASE_URL` | Database URL (production) | Optional |
| `UPLOAD_DIR` | File upload directory | Optional |
| `MAX_FILE_SIZE` | Max file size in bytes | Optional |

### File Upload Configuration

Supported file types:
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Plain text (`.txt`)

Default max file size: 10MB

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Node.js VPS / Docker (VPS or Hostinger)

1. **Build locally** for a production image or use Dockerfile directly:
   ```bash
   docker build -t neujobscan:latest .
   docker run -p 3000:3000 neujobscan:latest
   ```

2. **Use docker-compose** to run the app and optional services:
   ```bash
   docker-compose up --build -d
   ```

3. **System services / process managers** (alternative to Docker):
   - Build: `npm run build`
   - Start: `npm start`
   - Use PM2 or systemd for process supervision and restart policies.

4. **Apache + Node proxy**: prefer configuring a vhost with ProxyPass/ProxyPassReverse to forward traffic to `http://127.0.0.1:3000`.

5. **Static export**: run `npm run build && next export` then copy `out/` to an Apache server and use `public/.htaccess` for security and routing.

### Integrating Other Backends (Python/Django, PHP, etc.)

- Deploy other backends as separate services (containers or separate VPS). Use internal networking or an API gateway to communicate between services.
- Use CORS and authentication tokens (JWT) between services.
- Example: `docker-compose.yml` includes an example `django` service to show separation of concerns.

### Payment Gateway Integration

- We added a pluggable payments provider scaffold: `src/lib/payments/provider.ts` and a mock `/api/payments/create-session` route.
- For production: implement Stripe Checkout + webhooks (recommended), or connect PayPal / Coinbase Commerce for crypto support.

### Security and Hardening (quick checklist)
- Use HTTPS with a valid TLS cert (Let’s Encrypt, cloud provider managed TLS, or a load balancer).
- Store secrets in environment variables or a secret store (don’t commit `.env.local` to Git).
- Setup rate limiting, CSP, and input validation.

---



## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Performance

- **Optimized bundle size** with Next.js 15
- **Lazy loading** for components and routes
- **Image optimization** with Next.js Image component
- **Caching** strategies for API responses
- **CDN ready** for static assets

## 🔒 Security

- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **XSS protection** with content security policy
- **Rate limiting** for API endpoints
- **Secure file uploads** with type and size validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

- 📧 Email: support@neujobscan.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/neujobscan/issues)
- 📖 Documentation: [docs.neujobscan.com](https://docs.neujobscan.com)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/neujobscan&type=Date)](https://star-history.com/#your-username/neujobscan&Date)

---

**Built with ❤️ for job seekers worldwide**
