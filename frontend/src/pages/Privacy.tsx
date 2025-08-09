import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Privacy() {
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
            <h1 className="text-2xl font-bold">隐私政策</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <h1 className="text-5xl font-bold mb-6">隐私政策</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            我们深知您的隐私对您的重要性，因此我们制定了这份隐私政策来说明我们如何收集、使用和保护您的个人信息。
          </p>
          <div className="mt-6 text-sm text-blue-200">
            最后更新时间：2024年12月
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 概述 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="h-6 w-6 mr-3 text-blue-600" />
                隐私保护承诺
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                财务管家（"我们"、"我们的"或"本服务"）致力于保护您的隐私。
                本隐私政策解释了我们如何收集、使用、披露和保护您在使用我们的财务管理服务时提供的信息。
                使用我们的服务即表示您同意本隐私政策中描述的做法。
              </p>
            </CardContent>
          </Card>

          {/* 信息收集 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCheck className="h-6 w-6 mr-3 text-green-600" />
                我们收集的信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. 个人身份信息</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 姓名、邮箱地址、电话号码</li>
                  <li>• 登录凭证（用户名、密码）</li>
                  <li>• 个人资料信息（头像、偏好设置等）</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">2. 财务数据</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 银行账户信息（账户名称、类型、余额等）</li>
                  <li>• 交易记录（收入、支出、转账等）</li>
                  <li>• 预算和财务目标信息</li>
                  <li>• 财务分类和标签</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. 技术信息</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 设备信息（操作系统、浏览器类型等）</li>
                  <li>• IP地址和位置信息</li>
                  <li>• 使用数据（访问时间、功能使用频率等）</li>
                  <li>• Cookies和类似技术</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 信息使用 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Eye className="h-6 w-6 mr-3 text-purple-600" />
                我们如何使用您的信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">服务提供</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 提供财务管理功能</li>
                    <li>• 生成财务报表和分析</li>
                    <li>• 账户同步和数据备份</li>
                    <li>• 客户支持服务</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">服务改进</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 优化用户体验</li>
                    <li>• 开发新功能</li>
                    <li>• 系统性能监控</li>
                    <li>• 安全防护</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">法律合规</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 遵守法律法规</li>
                    <li>• 防范欺诈行为</li>
                    <li>• 配合执法调查</li>
                    <li>• 维护用户权益</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">沟通交流</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 发送服务通知</li>
                    <li>• 产品更新说明</li>
                    <li>• 安全提醒</li>
                    <li>• 客户调研</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据保护 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lock className="h-6 w-6 mr-3 text-red-600" />
                数据安全保护
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">技术保护措施</h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                  <ul className="space-y-2">
                    <li>• SSL/TLS加密传输</li>
                    <li>• AES-256数据库加密</li>
                    <li>• 多重身份验证</li>
                    <li>• 定期安全审计</li>
                  </ul>
                  <ul className="space-y-2">
                    <li>• 防火墙和入侵检测</li>
                    <li>• 数据备份和恢复</li>
                    <li>• 访问控制和权限管理</li>
                    <li>• 安全监控和告警</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">管理保护措施</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• 员工保密协议和安全培训</li>
                  <li>• 最小权限原则，仅授权员工可访问必要数据</li>
                  <li>• 定期安全评估和渗透测试</li>
                  <li>• 第三方安全认证（ISO 27001等）</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 信息共享 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">信息共享和披露</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                我们不会出售、租赁或以其他方式向第三方提供您的个人信息，除非符合以下情况：
              </p>
              <ul className="text-gray-600 space-y-2 ml-4">
                <li>• <strong>获得您的同意：</strong>在获得您明确同意的情况下</li>
                <li>• <strong>服务提供商：</strong>向帮助我们运营服务的可信第三方提供，这些第三方受合同约束保护您的信息</li>
                <li>• <strong>法律要求：</strong>应法律、法规、法律程序或政府要求</li>
                <li>• <strong>安全保护：</strong>为保护我们或其他人的权利、财产或安全</li>
                <li>• <strong>业务转移：</strong>在业务合并、收购或资产转让时</li>
              </ul>
            </CardContent>
          </Card>

          {/* 用户权利 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">您的权利和选择</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">访问权</h3>
                  <p className="text-gray-600">
                    您可以在账户设置中查看和管理您的个人信息。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">修改权</h3>
                  <p className="text-gray-600">
                    您可以随时更新或修改您的个人资料信息。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">删除权</h3>
                  <p className="text-gray-600">
                    您可以请求删除您的账户和个人数据。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">导出权</h3>
                  <p className="text-gray-600">
                    您可以导出您在我们平台上的数据。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Cookies和类似技术</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                我们使用Cookies和类似技术来改善用户体验、分析网站使用情况并提供个性化服务。
              </p>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-800">必要Cookies：</strong>
                  <span className="text-gray-600 ml-2">确保网站基本功能正常运行</span>
                </div>
                <div>
                  <strong className="text-gray-800">分析Cookies：</strong>
                  <span className="text-gray-600 ml-2">帮助我们了解网站使用情况</span>
                </div>
                <div>
                  <strong className="text-gray-800">功能Cookies：</strong>
                  <span className="text-gray-600 ml-2">记住您的偏好设置</span>
                </div>
              </div>
              <p className="text-gray-600">
                您可以通过浏览器设置管理Cookies偏好，但禁用某些Cookies可能影响网站功能。
              </p>
            </CardContent>
          </Card>

          {/* 儿童隐私 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">儿童隐私保护</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                我们的服务面向18岁以上的成年用户。我们不会故意收集18岁以下儿童的个人信息。
                如果我们发现收集了儿童的个人信息，我们会立即删除相关信息。
                如果您认为我们可能收集了儿童的信息，请立即联系我们。
              </p>
            </CardContent>
          </Card>

          {/* 政策更新 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">隐私政策更新</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                我们可能会不定期更新本隐私政策。重大更改时，我们会在网站上发布通知或通过邮件通知您。
                继续使用我们的服务即表示您接受更新后的隐私政策。
                建议您定期查看本政策以了解我们如何保护您的信息。
              </p>
            </CardContent>
          </Card>

          {/* 联系我们 */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl">联系我们</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>邮箱：</strong> privacy@financemanager.com</p>
                <p><strong>电话：</strong> 400-888-8888</p>
                <p><strong>地址：</strong> 北京市朝阳区建国门外大街1号国贸大厦A座20层</p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/contact">联系我们</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2024 财务管家. 版权所有. 
            <Link to="/terms" className="hover:text-white ml-4">服务条款</Link>
            <Link to="/contact" className="hover:text-white ml-4">联系我们</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}