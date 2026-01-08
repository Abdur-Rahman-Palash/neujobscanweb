'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  FileText, 
  TrendingUp,
  Menu,
  X,
  Briefcase,
  Star,
  Info,
  ChevronDown,
  Target,
  Zap,
  BarChart3,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const products = [
    { name: 'ATS Scanner', href: '/dashboard', icon: Target, description: 'Analyze resumes against job descriptions' },
    { name: 'Resume Parser', href: '/resumes', icon: FileText, description: 'Extract skills from any resume format' },
    { name: 'Job Matcher', href: '/jobs', icon: Zap, description: 'Find best matching opportunities' },
    { name: 'Analytics Pro', href: '/analytics', icon: BarChart3, description: 'Track your job search performance' },
    { name: 'Security Shield', href: '/pricing', icon: Shield, description: 'Enterprise-grade data protection' },
  ];

  return (
    <header className="border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow"
            >
              <span className="text-white font-bold text-lg">NS</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                NeuJobScan
              </span>
              <span className="text-xs text-gray-400">AI-Powered ATS Optimization</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group">
                  <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Products</span>
                  <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 border-gray-700 bg-slate-800" align="start" forceMount>
                {products.map((product, index) => (
                  <DropdownMenuItem key={product.name} asChild className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
                    <Link href={product.href} className="flex items-center space-x-3 w-full">
                      <product.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.description}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Features, Pricing, About */}
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <Link
              href="/features"
              className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 group text-sm"
            >
              <Star className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span>Features</span>
            </Link>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 group text-sm"
            >
              <TrendingUp className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span>Pricing</span>
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 group text-sm"
            >
              <Info className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span>About</span>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {session.user.subscription !== 'free' && (
                      <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 border-gray-700 bg-slate-800" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4 border-b border-gray-700">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold text-white">{session.user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">
                        {session.user.email}
                      </p>
                      <Badge className="w-fit bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                        {session.user.subscription}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-white/10 border border-gray-600">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-700 bg-slate-900/95 backdrop-blur"
            >
              <nav className="flex flex-col space-y-2 p-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-3 px-4 py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                {/* Products Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 group justify-start w-full">
                      <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Products</span>
                      <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 border-gray-700 bg-slate-800" align="start" forceMount>
                    {products.map((product, index) => (
                      <DropdownMenuItem key={product.name} asChild className="text-gray-300 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
                        <Link href={product.href} className="flex items-center space-x-3 w-full" onClick={() => setIsMobileMenuOpen(false)}>
                          <product.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-gray-400">{product.description}</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Features, Pricing, About */}
                <div className="h-px bg-gray-700 my-2"></div>
                <Link
                  href="/features"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-3 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Features</span>
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-3 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Pricing</span>
                </Link>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-3 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm">About</span>
                </Link>
                
                {!session && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700 mt-4">
                    <Button variant="ghost" asChild className="justify-start text-gray-300 hover:text-white hover:bg-white/10">
                      <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
