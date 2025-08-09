import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitSuccess(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', type: '', message: '' });
    
    // Reset success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <h1 className="text-2xl font-bold">联系我们</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">联系我们</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            有任何问题或建议？我们很乐意听到您的声音。
            无论是产品咨询、技术支持还是商务合作，我们都会及时回复。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-8">联系方式</h2>
            
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">邮箱地址</h3>
                      <p className="text-gray-600">support@financemanager.com</p>
                      <p className="text-gray-600">business@financemanager.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">客服电话</h3>
                      <p className="text-gray-600">400-888-8888</p>
                      <p className="text-sm text-gray-500">工作日 9:00-18:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">办公地址</h3>
                      <p className="text-gray-600">北京市朝阳区</p>
                      <p className="text-gray-600">建国门外大街1号</p>
                      <p className="text-gray-600">国贸大厦A座20层</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">工作时间</h3>
                      <p className="text-gray-600">周一至周五: 9:00-18:00</p>
                      <p className="text-gray-600">周末及节假日: 休息</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Link */}
            <div className="mt-8">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-lg">常见问题</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    在联系我们之前，您可以先查看常见问题，
                    可能会找到您需要的答案。
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/help">查看帮助中心</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">发送消息</CardTitle>
                <p className="text-gray-600">
                  填写下面的表单，我们会在24小时内回复您的消息
                </p>
              </CardHeader>
              <CardContent>
                {submitSuccess && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      消息发送成功！我们会在24小时内回复您。
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">姓名 *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="请输入您的姓名"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">邮箱 *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="请输入您的邮箱"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>咨询类型 *</Label>
                      <Select onValueChange={(value) => handleChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择咨询类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">产品咨询</SelectItem>
                          <SelectItem value="technical">技术支持</SelectItem>
                          <SelectItem value="billing">账单问题</SelectItem>
                          <SelectItem value="business">商务合作</SelectItem>
                          <SelectItem value="feedback">意见反馈</SelectItem>
                          <SelectItem value="other">其他问题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">主题 *</Label>
                      <Input
                        id="subject"
                        required
                        placeholder="请简要描述问题"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">详细描述 *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="请详细描述您的问题或需求，我们会根据您的描述提供更准确的帮助..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting ? '发送中...' : '发送消息'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">找到我们</h2>
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">地图加载中...</p>
              <p className="text-gray-500 mt-2">北京市朝阳区建国门外大街1号国贸大厦A座20层</p>
            </div>
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