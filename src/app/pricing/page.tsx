'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  Zap, 
  TrendingUp, 
  Users, 
  Crown,
  ArrowRight
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic resume analysis',
    features: [
      'Basic ATS scanning',
      'Up to 3 resumes per month',
      'Standard match analysis',
      'Email support'
    ],
    notIncluded: [
      'Advanced analytics',
      'Priority processing',
      'Team collaboration',
      'API access'
    ],
    color: 'from-gray-500 to-gray-600',
    popular: false,
    buttonText: 'Get Started'
  },
  {
    name: 'Professional',
    price: '$19',
    period: 'per month',
    description: 'Ideal for serious job seekers who want comprehensive tools',
    features: [
      'Advanced ATS scanning',
      'Unlimited resumes',
      'Detailed match analysis',
      'Priority email support',
      'Skill gap analysis',
      'Export to PDF',
      '30-day history'
    ],
    notIncluded: [
      'Team collaboration',
      'API access',
      'Custom branding'
    ],
    color: 'from-blue-500 to-blue-600',
    popular: true,
    buttonText: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: 'per month',
    description: 'Complete solution for teams and power users',
    features: [
      'Everything in Professional',
      'Team collaboration',
      'API access',
      'Custom branding',
      'Dedicated account manager',
      'Unlimited history',
      'Advanced analytics',
      'Priority processing'
    ],
    notIncluded: [],
    color: 'from-purple-500 to-purple-600',
    popular: false,
    buttonText: 'Contact Sales'
  }
];

export default function PricingPage() {
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your job search needs. No hidden fees, cancel anytime.
            </p>
            <div className="flex justify-center mb-8">
              <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                14-day free trial on all plans
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                  <CardHeader className="text-center pb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      {plan.name === 'Free' && <Star className="h-8 w-8 text-white" />}
                      {plan.name === 'Professional' && <Crown className="h-8 w-8 text-white" />}
                      {plan.name === 'Enterprise' && <Users className="h-8 w-8 text-white" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 px-4">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {plan.notIncluded.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-3">Not included:</p>
                        <div className="space-y-2">
                          {plan.notIncluded.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-3">
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                              <span className="text-gray-400 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <Button 
                        className={`w-full py-3 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : ''}`}
                        size="lg"
                        asChild
                      >
                        <Link href={plan.name === 'Enterprise' ? '/contact' : '/auth/signup'}>
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I change my plan anytime?',
                answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the next billing cycle.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use enterprise-grade encryption and follow GDPR compliance standards. Your data is never shared with third parties.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll refund your payment.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
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
              Start Your Free Trial Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              No credit card required. 14 days free on all features.
            </p>
            <Button size="lg" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
