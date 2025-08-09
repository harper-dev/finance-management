import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronRight, HelpCircle, Book, MessageCircle, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: '账户管理',
    question: '如何添加新的银行账户？',
    answer: '您可以在"账户"页面点击"添加账户"按钮，选择账户类型为"银行账户"，填写相关信息即可。支持储蓄账户、支票账户等多种类型。'
  },
  {
    id: '2',
    category: '账户管理',
    question: '如何修改账户信息？',
    answer: '在账户列表中找到要修改的账户，点击账户卡片进入详情页面，然后点击"编辑"按钮即可修改账户名称和描述信息。'
  },
  {
    id: '3',
    category: '交易记录',
    question: '如何快速记录日常支出？',
    answer: '点击"交易"页面的"添加交易"按钮，选择"支出"类型，填写金额、描述和分类即可。系统会自动保存常用的分类，方便下次快速选择。'
  },
  {
    id: '4',
    category: '交易记录',
    question: '如何进行账户间转账？',
    answer: '选择交易类型为"转账"，选择转出账户和转入账户，填写转账金额即可。系统会自动更新两个账户的余额。'
  },
  {
    id: '5',
    category: '数据安全',
    question: '我的财务数据安全吗？',
    answer: '我们采用银行级别的加密技术保护您的数据，所有数据传输都使用SSL加密，数据库采用多重加密存储。我们绝不会向第三方泄露您的个人信息。'
  },
  {
    id: '6',
    category: '数据安全',
    question: '如何备份我的数据？',
    answer: '专业版和企业版用户可以在"设置"页面找到"数据导出"功能，支持导出Excel、CSV等格式的数据备份。'
  },
  {
    id: '7',
    category: '团队协作',
    question: '如何邀请家庭成员一起记账？',
    answer: '在工作区设置中点击"邀请成员"，输入对方的邮箱地址并选择权限级别（管理员、成员或查看者），系统会自动发送邀请邮件。'
  },
  {
    id: '8',
    category: '团队协作',
    question: '不同权限的成员可以做什么？',
    answer: '管理员可以管理所有数据和成员；成员可以添加、编辑交易和账户；查看者只能查看数据报表，不能进行修改操作。'
  },
  {
    id: '9',
    category: '账单问题',
    question: '免费版有什么限制？',
    answer: '免费版最多支持3个账户，基础记账和简单报表功能。专业版解除账户限制，支持高级分析、预算管理和团队协作功能。'
  },
  {
    id: '10',
    category: '账单问题',
    question: '如何升级到专业版？',
    answer: '在"设置"页面找到"订阅管理"，选择适合的套餐计划，支持月付和年付。首次升级享有7天免费试用期。'
  }
];

const categories = ['全部', '账户管理', '交易记录', '数据安全', '团队协作', '账单问题'];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

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
            <h1 className="text-2xl font-bold">帮助中心</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">帮助中心</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            找到您需要的答案，快速解决问题。
            如果没有找到相关信息，请联系我们的客服团队。
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索问题或关键词..."
                className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 border-0 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/contact">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      联系客服
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/login">
                      <Book className="h-4 w-4 mr-2" />
                      用户指南
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/contact">
                      <Mail className="h-4 w-4 mr-2" />
                      意见反馈
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">问题分类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category}
                        {category !== '全部' && (
                          <span className="float-right text-sm text-gray-500">
                            {faqData.filter(item => item.category === category).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === '全部' ? '常见问题' : selectedCategory}
                </h2>
                <p className="text-gray-600">
                  找到 {filteredFAQs.length} 个相关结果
                </p>
              </div>

              {/* FAQ Items */}
              {filteredFAQs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFAQs.map((item) => (
                    <Card key={item.id} className="border-0 shadow-md">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{item.question}</h3>
                                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            {expandedItems.has(item.id) ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {expandedItems.has(item.id) && (
                          <div className="px-6 pb-6">
                            <div className="pl-9">
                              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">未找到相关问题</h3>
                    <p className="text-gray-600 mb-6">
                      抱歉，没有找到与您搜索内容相关的问题。
                      您可以尝试其他关键词或直接联系我们。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" onClick={() => {setSearchTerm(''); setSelectedCategory('全部');}}>
                        查看所有问题
                      </Button>
                      <Button asChild>
                        <Link to="/contact">联系客服</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Support */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-3">还没有找到答案？</h3>
                  <p className="text-gray-600 mb-6">
                    我们的客服团队随时为您提供帮助，
                    通常在24小时内回复您的问题。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link to="/contact">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        联系客服
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/contact">
                        <Mail className="h-5 w-5 mr-2" />
                        发送邮件
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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