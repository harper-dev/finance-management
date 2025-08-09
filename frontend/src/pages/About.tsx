import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Award, Heart, Globe, Lightbulb } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">关于我们</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">让每个人都能轻松管理财务</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            我们致力于为个人和家庭提供简单、安全、高效的财务管理解决方案，
            让复杂的财务管理变得简单易懂，帮助用户实现财务自由。
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">我们的使命</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 text-lg leading-relaxed">
                让每个人都能轻松掌控自己的财务状况，通过智能化的工具和服务，
                帮助用户建立健康的财务习惯，实现财务目标，过上更美好的生活。
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">我们的愿景</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 text-lg leading-relaxed">
                成为全球领先的个人财务管理平台，让财务管理不再是负担，
                而是一种生活方式，帮助千万家庭实现财务健康和财富增长。
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">我们的故事</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                财务管家诞生于2024年，源于我们对个人财务管理痛点的深刻理解。
                在数字化时代，人们的财务状况越来越复杂，传统的记账方式已经无法满足现代生活的需要。
              </p>
              <p className="text-xl leading-relaxed mb-6">
                我们的创始团队来自金融科技和互联网行业，有着丰富的产品开发和用户服务经验。
                我们深知用户在财务管理上的困扰：账目繁多难以整理、支出结构不清晰、
                预算执行缺乏监控、家庭成员协作困难等问题。
              </p>
              <p className="text-xl leading-relaxed mb-6">
                基于这些洞察，我们打造了财务管家这一产品，
                希望通过现代化的技术手段和人性化的产品设计，
                让每个人都能轻松管理自己的财务，实现财务健康。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">核心价值观</h2>
            <p className="text-xl text-gray-600">指导我们前进的价值理念</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">用户至上</h3>
              <p className="text-gray-600">
                始终以用户需求为中心，持续优化产品体验，
                为用户创造真正的价值。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">专业可靠</h3>
              <p className="text-gray-600">
                凭借专业的技术实力和严谨的工作态度，
                为用户提供安全可靠的服务。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">简单易用</h3>
              <p className="text-gray-600">
                追求极致的产品体验，让复杂的财务管理
                变得简单直观。
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">持续创新</h3>
              <p className="text-gray-600">
                拥抱变化，持续创新，不断探索财务管理
                领域的新可能。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">核心团队</h2>
            <p className="text-xl text-gray-600">来自各个领域的专业人士</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                  CTO
                </div>
                <h3 className="text-xl font-bold mb-2">技术团队</h3>
                <p className="text-gray-500 mb-4">首席技术官</p>
                <p className="text-gray-600">
                  10年+互联网技术经验，专注于金融科技产品架构设计，
                  致力于为用户提供安全稳定的技术服务。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                  CPO
                </div>
                <h3 className="text-xl font-bold mb-2">产品团队</h3>
                <p className="text-gray-500 mb-4">首席产品官</p>
                <p className="text-gray-600">
                  8年+产品设计经验，深度理解用户需求，
                  专注于打造简单易用的产品体验。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                  CMO
                </div>
                <h3 className="text-xl font-bold mb-2">市场团队</h3>
                <p className="text-gray-500 mb-4">首席营销官</p>
                <p className="text-gray-600">
                  资深市场营销专家，拥有丰富的品牌建设经验，
                  致力于让更多用户了解和使用我们的产品。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">发展里程碑</h2>
            <p className="text-xl text-gray-600">我们的成长历程</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  2024.1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">项目启动</h3>
                  <p className="text-gray-600">
                    核心团队成立，开始产品规划和技术架构设计
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  2024.6
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">产品上线</h3>
                  <p className="text-gray-600">
                    完成MVP版本开发，正式发布财务管家1.0版本
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  2024.9
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">用户破万</h3>
                  <p className="text-gray-600">
                    注册用户突破10,000人，获得用户一致好评
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  2024.12
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">功能升级</h3>
                  <p className="text-gray-600">
                    推出高级分析、团队协作等核心功能，用户体验大幅提升
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">加入我们的财务管理之旅</h2>
          <p className="text-xl mb-8 text-blue-100">
            让我们一起改变财务管理的方式
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/login">立即开始</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link to="/contact">联系我们</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2024 财务管家. 版权所有. 
            <Link to="/privacy" className="hover:text-white ml-4">隐私政策</Link>
            <Link to="/terms" className="hover:text-white ml-4">服务条款</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}