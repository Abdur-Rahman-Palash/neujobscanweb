'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Zap, 
  FileText, 
  TrendingUp, 
  Shield, 
  Users,
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Smart ATS Optimization',
    description: 'AI-powered analysis that optimizes your resume to pass through Applicant Tracking Systems and reach human recruiters.',
    benefits: ['Increase interview rates by up to 80%', 'Beat ATS algorithms', 'Keyword optimization'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Real-time Analysis',
    description: 'Get instant feedback and suggestions to improve your resume for better job opportunities.',
    benefits: ['Live scoring', 'Instant recommendations', 'Real-time updates'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: FileText,
    title: 'Resume Parsing',
    description: 'Upload any resume format and let our AI extract skills, experience, and qualifications automatically.',
    benefits: ['Supports PDF, DOC, DOCX', 'Smart text extraction', 'Skill identification'],
    color: 'from-green-500 to-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Job Matching',
    description: 'Get precise match scores between your resume and job descriptions with detailed insights.',
    benefits: ['85%+ accuracy', 'Detailed breakdowns', 'Skill gap analysis'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Your resume and personal data are encrypted and stored securely with enterprise-grade protection.',
    benefits: ['256-bit encryption', 'GDPR compliant', 'Secure cloud storage'],
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share resumes and insights with your team or career coach for better feedback.',
    benefits: ['Real-time sharing', 'Collaborative editing', 'Team analytics'],
    color: 'from-indigo-500 to-indigo-600'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Powerful Features for Your Career Success
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              NeuJobScan provides cutting-edge AI tools to help you land your dream job faster and more effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <Star className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to optimize your job search.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Job Seekers Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of successful job seekers who use NeuJobScan
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Resumes Analyzed', value: '50K+', icon: FileText },
              { label: 'Success Rate', value: '85%', icon: BarChart3 },
              { label: 'Active Users', value: '10K+', icon: Users },
              { label: 'Satisfaction', value: '4.9/5', icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center border-0 shadow-sm">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and see the difference NeuJobScan can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <Star className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
