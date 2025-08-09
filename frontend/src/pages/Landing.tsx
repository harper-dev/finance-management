import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Users, 
  PieChart, 
  Wallet,
  CreditCard,
  Target,
  BarChart3,
  Star,
  CheckCircle,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

export default function Landing() {
  const { t } = useTranslation(['common', 'landing']);
  const { getCurrentCurrency } = useLanguage();
  const currency = getCurrentCurrency();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('common:appName')}
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('common:navigation.features')}
              </Link>
              <Link to="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('common:navigation.pricing')}
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('common:navigation.about')}
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('common:navigation.contact')}
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Button variant="outline" asChild>
                <Link to="/login">{t('common:navigation.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/login">{t('common:navigation.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('landing:hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('landing:hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/login">
                  {t('landing:hero.ctaPrimary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="#demo">{t('landing:hero.ctaSecondary')}</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              {t('landing:hero.benefits.free')}
              <CheckCircle className="h-4 w-4 text-green-500 ml-4 mr-2" />
              {t('landing:hero.benefits.noCard')}
              <CheckCircle className="h-4 w-4 text-green-500 ml-4 mr-2" />
              {t('landing:hero.benefits.instant')}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing:features.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing:features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 账户管理 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.accounts.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.accounts.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 交易记录 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.transactions.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.transactions.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 预算管理 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.budgets.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.budgets.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 数据分析 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.analytics.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.analytics.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 团队协作 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.collaboration.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.collaboration.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 数据安全 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">{t('landing:features.security.title')}</CardTitle>
                <CardDescription>
                  {t('landing:features.security.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">{t('landing:stats.users')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{currency.symbol}50M+</div>
              <div className="text-blue-100">{t('landing:stats.assets')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">{t('landing:stats.transactions')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">{t('landing:stats.uptime')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing:testimonials.title')}</h2>
            <p className="text-xl text-gray-600">{t('landing:testimonials.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('landing:testimonials.reviews.0.text')}"
                </p>
                <div className="flex items-center">
                  <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    张
                  </div>
                  <div>
                    <div className="font-semibold">{t('landing:testimonials.reviews.0.author')}</div>
                    <div className="text-sm text-gray-500">{t('landing:testimonials.reviews.0.location')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('landing:testimonials.reviews.1.text')}"
                </p>
                <div className="flex items-center">
                  <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    李
                  </div>
                  <div>
                    <div className="font-semibold">{t('landing:testimonials.reviews.1.author')}</div>
                    <div className="text-sm text-gray-500">{t('landing:testimonials.reviews.1.location')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('landing:testimonials.reviews.2.text')}"
                </p>
                <div className="flex items-center">
                  <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    王
                  </div>
                  <div>
                    <div className="font-semibold">{t('landing:testimonials.reviews.2.author')}</div>
                    <div className="text-sm text-gray-500">{t('landing:testimonials.reviews.2.location')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">选择适合您的方案</h2>
            <p className="text-xl text-gray-600">{t('landing:pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{t('landing:pricing.plans.free.name')}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  {t('landing:pricing.plans.free.price')}
                  <span className="text-base font-normal text-gray-500">{t('landing:pricing.plans.free.period')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    最多3个账户
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    基础记账功能
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    简单报表分析
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    单用户使用
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/login">立即开始</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm">
                  推荐
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">专业版</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ¥29
                  <span className="text-base font-normal text-gray-500">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    无限账户数量
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    高级分析报表
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    预算管理
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    最多5人协作
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    数据导出
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link to="/login">开始试用</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">企业版</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ¥99
                  <span className="text-base font-normal text-gray-500">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    专业版所有功能
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    无限用户协作
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    API接口访问
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    专属客服支持
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    定制化开发
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/contact">联系销售</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">准备开始您的财务管理之旅？</h2>
          <p className="text-xl mb-8 text-blue-100">
            加入万千用户，让财务管理变得简单高效
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
            <Link to="/login">
              立即免费注册
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">财务管家</span>
              </div>
              <p className="text-gray-400 mb-4">
                专业的个人财务管理平台，让财务管理变得简单高效。
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">功能特色</Link></li>
                <li><Link to="/pricing" className="hover:text-white">价格方案</Link></li>
                <li><Link to="/security" className="hover:text-white">安全保障</Link></li>
                <li><Link to="/api" className="hover:text-white">API 文档</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">关于我们</Link></li>
                <li><Link to="/careers" className="hover:text-white">招聘信息</Link></li>
                <li><Link to="/blog" className="hover:text-white">博客</Link></li>
                <li><Link to="/news" className="hover:text-white">新闻动态</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">帮助中心</Link></li>
                <li><Link to="/contact" className="hover:text-white">联系我们</Link></li>
                <li><Link to="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link to="/terms" className="hover:text-white">服务条款</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 财务管家. 版权所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}