import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">FM</span>
        </div>

        {/* Main 404 Content */}
        <div className="space-y-4">
          {/* Large 404 Number */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-6">
                <svg 
                  className="w-12 h-12 text-primary"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.91-2.709L4 10l2.09-2.291A7.962 7.962 0 0112 5c2.34 0 4.291 1.1 5.91 2.709L20 10l-2.09 2.291z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Page not found
            </h2>
            <p className="text-gray-600">
              Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          <Card className="border-2 border-dashed border-gray-200 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Go to Dashboard</h3>
                    <p className="text-sm text-gray-500">Return to your main dashboard</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-200 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Browse Features</h3>
                    <p className="text-sm text-gray-500">Explore accounts, transactions, and more</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/accounts">Accounts</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/transactions">Transactions</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/budgets">Budgets</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analytics">Analytics</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <div className="bg-gray-100 rounded-lg p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Still need help?</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/help">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help Center
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/contact">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}