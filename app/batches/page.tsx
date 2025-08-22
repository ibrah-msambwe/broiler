"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Users,
  UserPlus,
  Building,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function BatchesPage() {
  const [activeTab, setActiveTab] = useState("register-account")
  const [language, setLanguage] = useState("en")
  const [isRegistered, setIsRegistered] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    experience: "",
    farmSize: "",
    broilerExperience: "",
    preferredBatchSize: "",
    expectedStartDate: "",
    additionalInfo: "",
  })

  const router = useRouter()

  const translations = {
    en: {
      title: "Tariq Broiler Management",
      subtitle: "Broiler Batch Registration",
      backToHome: "Back to Home",
      registerAccount: "Register Account",
      registerBatches: "Register Broiler Batches",
      registerAccountDesc: "Create your farmer account to get started",
      registerBatchesDesc: "Request new broiler batch registration",
      // Form fields
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Farm Address",
      experience: "Farming Experience (Years)",
      farmSize: "Farm Size (Acres)",
      broilerExperience: "Broiler Experience",
      preferredBatchSize: "Preferred Batch Size",
      expectedStartDate: "Expected Start Date",
      additionalInfo: "Additional Information",
      submitRegistration: "Submit Registration",
      // Success messages
      registrationSuccess: "Registration Successful!",
      accountCreated: "Your farmer account has been created successfully.",
      nextSteps: "Next Steps:",
      loginToDashboard: "Login to Dashboard",
      contactAdmin: "Contact Admin for Batch Setup",
      // Batch registration
      accessRestricted: "Batch Registration Restricted",
      adminApprovalRequired: "Admin Approval Required",
      contactAdminMessage:
        "To register new broiler batches, please contact our admin team. They will review your request and set up your batches according to our quality standards.",
      whyAdminApproval: "Why Admin Approval?",
      qualityControl: "• Ensure optimal broiler batch sizing",
      resourceManagement: "• Proper resource allocation and planning",
      expertGuidance: "• Professional guidance for batch setup",
      safetyStandards: "• Compliance with safety and health standards",
      adminContact: "Admin Contact Information",
      adminName: "Tariq Ahmed - Farm Manager",
      adminPhone: "+254 712 345 678",
      adminEmail: "admin@tariqbroiler.com",
      adminAddress: "Tariq Broiler Farm, Nairobi, Kenya",
      officeHours: "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM",
      requestProcess: "Batch Request Process",
      step1: "1. Contact admin via phone or email",
      step2: "2. Discuss your broiler batch requirements",
      step3: "3. Admin will assess farm capacity and readiness",
      step4: "4. Batch setup and resource allocation",
      step5: "5. Training and guidance provided",
    },
    sw: {
      title: "Usimamizi wa Kuku wa Nyama wa Tariq",
      subtitle: "Usajili wa Makundi ya Kuku wa Nyama",
      backToHome: "Rudi Nyumbani",
      registerAccount: "Sajili Akaunti",
      registerBatches: "Sajili Makundi ya Kuku wa Nyama",
      registerAccountDesc: "Unda akaunti yako ya mkulima ili uanze",
      registerBatchesDesc: "Omba usajili wa kundi jipya la kuku wa nyama",
      // Form fields
      fullName: "Jina Kamili",
      email: "Anwani ya Barua Pepe",
      phone: "Nambari ya Simu",
      address: "Anwani ya Shamba",
      experience: "Uzoefu wa Kilimo (Miaka)",
      farmSize: "Ukubwa wa Shamba (Ekari)",
      broilerExperience: "Uzoefu wa Kuku wa Nyama",
      preferredBatchSize: "Ukubwa wa Kundi Unaopendelea",
      expectedStartDate: "Tarehe ya Kuanza Inayotarajiwa",
      additionalInfo: "Maelezo ya Ziada",
      submitRegistration: "Wasilisha Usajili",
      // Success messages
      registrationSuccess: "Usajili Umefanikiwa!",
      accountCreated: "Akaunti yako ya mkulima imeundwa kwa mafanikio.",
      nextSteps: "Hatua Zinazofuata:",
      loginToDashboard: "Ingia kwenye Dashibodi",
      contactAdmin: "Wasiliana na Msimamizi kwa Mpangilio wa Kundi",
      // Batch registration
      accessRestricted: "Usajili wa Kundi Umezuiliwa",
      adminApprovalRequired: "Idhini ya Msimamizi Inahitajika",
      contactAdminMessage:
        "Ili kusajili makundi mapya ya kuku wa nyama, tafadhali wasiliana na timu yetu ya usimamizi. Wataangalia ombi lako na kuanzisha makundi yako kulingana na viwango vyetu vya ubora.",
      whyAdminApproval: "Kwa Nini Idhini ya Msimamizi?",
      qualityControl: "• Kuhakikisha ukubwa bora wa kundi la kuku wa nyama",
      resourceManagement: "• Ugawaji sahihi wa rasilimali na mipango",
      expertGuidance: "• Mwongozo wa kitaalamu kwa mpangilio wa kundi",
      safetyStandards: "• Kufuata viwango vya usalama na afya",
      adminContact: "Maelezo ya Mawasiliano ya Msimamizi",
      adminName: "Tariq Ahmed - Meneja wa Shamba",
      adminPhone: "+254 712 345 678",
      adminEmail: "admin@tariqbroiler.com",
      adminAddress: "Shamba la Kuku wa Nyama la Tariq, Nairobi, Kenya",
      officeHours: "Masaa ya Ofisi: Jumatatu - Ijumaa, 8:00 AM - 5:00 PM",
      requestProcess: "Mchakato wa Ombi la Kundi",
      step1: "1. Wasiliana na msimamizi kwa simu au barua pepe",
      step2: "2. Jadili mahitaji yako ya kundi la kuku wa nyama",
      step3: "3. Msimamizi ataangalia uwezo wa shamba na utayari",
      step4: "4. Mpangilio wa kundi na ugawaji wa rasilimali",
      step5: "5. Mafunzo na mwongozo utatolewa",
    },
  }

  const t = translations[language as keyof typeof translations]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistered(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-xl transform translate-x-2 translate-y-2"></div>
                  <Image
                    src="/images/chick-hero.png"
                    alt="Tariq Broiler Management"
                    width={40}
                    height={40}
                    className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                    style={{
                      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(255,165,0,0.4))",
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 relative">
                    <span
                      className="relative z-10"
                      style={{
                        textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                        TARIQ
                      </span>{" "}
                      Broiler Management
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white/80"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
                <Button variant="outline" onClick={() => router.push("/")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToHome}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.registrationSuccess}</h2>
              <p className="text-lg text-gray-600 mb-8">{t.accountCreated}</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-4">{t.nextSteps}</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="text-green-700">{t.loginToDashboard}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <span className="text-green-700">{t.contactAdmin}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push("/farmer-login")} className="bg-green-600 hover:bg-green-700">
                  {t.loginToDashboard}
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  {t.backToHome}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-xl transform translate-x-2 translate-y-2"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="Tariq Broiler Management"
                  width={40}
                  height={40}
                  className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(255,165,0,0.4))",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 relative">
                  <span
                    className="relative z-10"
                    style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>{" "}
                    Broiler Management
                  </span>
                </h1>
                <p className="text-sm text-gray-500">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white/80"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger
              value="register-account"
              className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t.registerAccount}</span>
            </TabsTrigger>
            <TabsTrigger
              value="register-batches"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building className="h-4 w-4" />
              <span>{t.registerBatches}</span>
            </TabsTrigger>
          </TabsList>

          {/* Register Account Tab */}
          <TabsContent value="register-account">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">{t.registerAccount}</CardTitle>
                <CardDescription className="text-lg">{t.registerAccountDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t.fullName} *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.phone} *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+254 700 000 000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">{t.experience}</Label>
                      <Select onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="2-5">2-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">{t.farmSize}</Label>
                      <Input
                        id="farmSize"
                        value={formData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", e.target.value)}
                        placeholder="e.g., 5 acres"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="broilerExperience">{t.broilerExperience}</Label>
                      <Select onValueChange={(value) => handleInputChange("broilerExperience", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select broiler experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t.address} *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your farm address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="preferredBatchSize">{t.preferredBatchSize}</Label>
                      <Select onValueChange={(value) => handleInputChange("preferredBatchSize", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred batch size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100-500">100-500 birds</SelectItem>
                          <SelectItem value="500-1000">500-1000 birds</SelectItem>
                          <SelectItem value="1000-2000">1000-2000 birds</SelectItem>
                          <SelectItem value="2000+">2000+ birds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedStartDate">{t.expectedStartDate}</Label>
                      <Input
                        id="expectedStartDate"
                        type="date"
                        value={formData.expectedStartDate}
                        onChange={(e) => handleInputChange("expectedStartDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">{t.additionalInfo}</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      placeholder="Any additional information about your farming goals or requirements"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                    {t.submitRegistration}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Batches Tab */}
          <TabsContent value="register-batches">
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800">{t.accessRestricted}</CardTitle>
                  <CardDescription className="text-lg text-red-600">{t.adminApprovalRequired}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">{t.contactAdminMessage}</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Why Admin Approval */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>{t.whyAdminApproval}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-blue-700 text-sm">{t.qualityControl}</p>
                        <p className="text-blue-700 text-sm">{t.resourceManagement}</p>
                        <p className="text-blue-700 text-sm">{t.expertGuidance}</p>
                        <p className="text-blue-700 text-sm">{t.safetyStandards}</p>
                      </CardContent>
                    </Card>

                    {/* Admin Contact */}
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-green-800 flex items-center space-x-2">
                          <Phone className="h-5 w-5" />
                          <span>{t.adminContact}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 font-medium">
                              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                                TARIQ
                              </span>{" "}
                              Ahmed - Farm Manager
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span className="text-green-800">{t.adminPhone}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-green-600" />
                            <span className="text-green-800">{t.adminEmail}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-green-800">
                              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                                TARIQ
                              </span>{" "}
                              Broiler Farm, Nairobi, Kenya
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 text-sm">{t.officeHours}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Request Process */}
                  <Card className="bg-purple-50 border-purple-200 mt-8">
                    <CardHeader>
                      <CardTitle className="text-lg text-purple-800 flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>{t.requestProcess}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-purple-500 text-white">1</Badge>
                          <span className="text-purple-800">{t.step1}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-purple-500 text-white">2</Badge>
                          <span className="text-purple-800">{t.step2}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-purple-500 text-white">3</Badge>
                          <span className="text-purple-800">{t.step3}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-purple-500 text-white">4</Badge>
                          <span className="text-purple-800">{t.step4}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-purple-500 text-white">5</Badge>
                          <span className="text-purple-800">{t.step5}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => (window.location.href = "tel:+254712345678")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Admin Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
