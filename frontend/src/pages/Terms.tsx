import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, Users, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Terms() {
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
            <h1 className="text-2xl font-bold">服务条款</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 mx-auto mb-6 text-blue-200" />
          <h1 className="text-5xl font-bold mb-6">服务条款</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            本服务条款规定了您使用财务管家服务时的权利和义务。请仔细阅读以下条款，使用我们的服务即表示您同意遵守这些条款。
          </p>
          <div className="mt-6 text-sm text-blue-200">
            最后更新时间：2024年12月
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 接受条款 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Scale className="h-6 w-6 mr-3 text-blue-600" />
                接受条款
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                欢迎使用财务管家（"本服务"、"我们"或"平台"）！这些服务条款（"条款"）
                是您与我们之间的法律协议，规定了您使用我们服务的条件。
                通过访问或使用我们的服务，您同意受这些条款的约束。
                如果您不同意这些条款，请不要使用我们的服务。
              </p>
            </CardContent>
          </Card>

          {/* 服务描述 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-3 text-green-600" />
                服务描述
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. 服务内容</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 个人和家庭财务管理工具</li>
                  <li>• 收入支出记录和分类管理</li>
                  <li>• 预算规划和财务分析报表</li>
                  <li>• 多用户协作和数据同步功能</li>
                  <li>• 财务数据导入导出服务</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">2. 服务可用性</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 我们努力保证服务的持续可用性，但不保证100%无中断</li>
                  <li>• 可能因维护、升级或不可抗力因素暂停服务</li>
                  <li>• 我们会提前通知重大服务变更或中断</li>
                  <li>• 保留随时修改、暂停或终止服务的权利</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. 服务更新</h3>
                <p className="text-gray-600">
                  我们可能随时更新或修改服务功能。重大功能变更会提前通知用户，
                  持续使用服务即视为接受更新。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 用户账户 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="h-6 w-6 mr-3 text-purple-600" />
                用户账户与责任
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">账户注册</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 您必须提供真实、准确、完整的注册信息</li>
                  <li>• 您有责任维护账户信息的准确性</li>
                  <li>• 一个邮箱地址只能注册一个账户</li>
                  <li>• 禁止创建虚假账户或冒用他人身份</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">账户安全</h3>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• 您有责任保管好登录凭证，不得与他人共享</li>
                  <li>• 如发现账户被盗用，应立即通知我们</li>
                  <li>• 建议启用双因子认证等安全功能</li>
                  <li>• 您对账户下发生的所有活动承担责任</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">账户终止</h3>
                <p className="text-gray-600">
                  您可随时删除账户。我们保留在用户违反条款时暂停或终止账户的权利。
                  账户终止后，相关数据将按照隐私政策进行处理。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 使用规则 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                使用规则与限制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">允许的使用</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 个人或家庭财务管理</li>
                  <li>• 合法的商业财务记录</li>
                  <li>• 与授权用户共享财务数据</li>
                  <li>• 导出自己的财务数据</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">禁止的使用</h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-red-600">严格禁止：</strong>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• 上传虚假、误导性或非法的财务信息</li>
                      <li>• 使用服务进行洗钱或其他非法金融活动</li>
                      <li>• 未授权访问他人账户或数据</li>
                      <li>• 对服务进行逆向工程、破解或攻击</li>
                      <li>• 传播恶意软件或进行网络攻击</li>
                      <li>• 违反相关法律法规的任何行为</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong className="text-orange-600">使用限制：</strong>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li>• 超出合理使用范围的大量请求</li>
                      <li>• 商业再分发或转售服务</li>
                      <li>• 创建竞争产品或抄袭功能</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 付费服务 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">付费服务与退款</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">订阅计费</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• 订阅费用按选择的计费周期（月度/年度）收取</li>
                  <li>• 费用将在每个计费周期开始时自动扣除</li>
                  <li>• 价格可能调整，但会提前30天通知现有用户</li>
                  <li>• 未及时付费可能导致服务降级或暂停</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">退款政策</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• 新用户享有7天免费试用期</li>
                  <li>• 试用期内取消不收取任何费用</li>
                  <li>• 正式订阅后，如因我们的原因无法提供服务，将按比例退款</li>
                  <li>• 其他情况下，已支付费用概不退还</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">取消订阅</h3>
                <p className="text-gray-600">
                  您可随时在账户设置中取消订阅。取消后将在当前计费周期结束时生效，
                  期间仍可正常使用付费功能。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 知识产权 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">知识产权</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">我们的权利</h3>
                <p className="text-gray-600">
                  财务管家的所有软件、设计、文本、图像、商标和其他内容均受知识产权法保护。
                  未经许可，您不得复制、修改、分发或以其他方式使用我们的知识产权。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">您的数据权利</h3>
                <p className="text-gray-600">
                  您保留对上传到平台的财务数据的所有权。我们仅在提供服务的必要范围内使用您的数据，
                  不会将其用于其他目的或向第三方销售。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">许可授予</h3>
                <p className="text-gray-600">
                  通过使用我们的服务，您授予我们在提供服务所需范围内处理、存储和传输您数据的许可。
                  此许可在您删除数据或终止账户时终止。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">免责声明与责任限制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">服务免责声明</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• 服务按"现状"和"可获得"基础提供</li>
                  <li>• 不保证服务完全无错误或无中断</li>
                  <li>• 不对财务决策结果承担责任</li>
                  <li>• 用户应独立验证数据准确性</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">责任限制</h3>
                <p className="text-gray-600">
                  在法律允许的最大范围内，我们对因使用或无法使用服务而导致的任何直接、间接、
                  偶然、特殊或后果性损害不承担责任，包括但不限于利润损失、数据丢失或业务中断。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">损害赔偿上限</h3>
                <p className="text-gray-600">
                  在任何情况下，我们的总责任不超过您在导致损害的事件发生前12个月内
                  向我们支付的费用总额。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 争议解决 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">争议解决</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">友好协商</h3>
                <p className="text-gray-600">
                  如因本条款或服务使用产生任何争议，双方应首先通过友好协商解决。
                  您可通过客服渠道联系我们寻求解决方案。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">法律适用</h3>
                <p className="text-gray-600">
                  本条款受中华人民共和国法律管辖。如协商无法解决争议，
                  双方同意将争议提交至我们所在地有管辖权的人民法院解决。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 条款变更 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">条款变更</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                我们保留随时修改这些条款的权利。重要变更会通过以下方式通知您：
              </p>
              <ul className="text-gray-600 space-y-2 ml-4 mb-4">
                <li>• 在网站或应用内发布通知</li>
                <li>• 向您的注册邮箱发送邮件</li>
                <li>• 通过其他适当的通信方式</li>
              </ul>
              <p className="text-gray-600">
                修改后的条款将在发布30天后生效。继续使用服务即表示您接受新条款。
                如不同意变更，您可选择终止使用服务。
              </p>
            </CardContent>
          </Card>

          {/* 其他条款 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">其他条款</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">可分割性</h3>
                <p className="text-gray-600">
                  如本条款的任何部分被认定无效或不可执行，其余部分仍继续有效。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">整体协议</h3>
                <p className="text-gray-600">
                  本条款构成双方就服务使用达成的完整协议，取代之前的所有协议和理解。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">不弃权</h3>
                <p className="text-gray-600">
                  我们未执行本条款的任何权利不应被视为对该权利的放弃。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 联系我们 */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl">联系我们</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                如果您对这些服务条款有任何疑问或需要澄清，请通过以下方式联系我们：
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>邮箱：</strong> legal@financemanager.com</p>
                <p><strong>客服热线：</strong> 400-888-8888</p>
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
            <Link to="/privacy" className="hover:text-white ml-4">隐私政策</Link>
            <Link to="/contact" className="hover:text-white ml-4">联系我们</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}