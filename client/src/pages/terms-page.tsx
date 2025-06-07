import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Breadcrumb from "@/components/seo/breadcrumb";
import SEOHead from "@/components/seo/seo-head";

export default function TermsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Terms of Service", isActive: true }
  ];

  return (
    <>
      <SEOHead
        title="Terms of Service - Legal Terms & Conditions"
        description="Read South Delhi Realty's terms of service, legal conditions, and user agreement for our real estate platform and services."
        keywords="terms of service, legal terms, conditions, real estate terms, south delhi realty legal"
        url="https://southdelhirealty.com/terms"
        type="article"
        noindex={false}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
              
              <div className="text-sm text-muted-foreground mb-8 text-center">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  Welcome to South Delhi Realty. By accessing and using our website, mobile application, or any of our services, 
                  you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these terms, 
                  you may not use our services.
                </p>
                <p className="mb-4">
                  These Terms apply to all visitors, users, and others who access or use our real estate platform and services 
                  in South Delhi, New Delhi, India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
                <p className="mb-4">
                  South Delhi Realty provides real estate services including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Property listings for sale and rent in South Delhi</li>
                  <li>Property search and discovery tools</li>
                  <li>Real estate consultation and advisory services</li>
                  <li>Property valuation and market analysis</li>
                  <li>Assistance with property transactions</li>
                  <li>Property management services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
                <p className="mb-4">
                  To access certain features of our services, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Property Listings and Information</h2>
                <p className="mb-4">
                  We strive to provide accurate property information, but:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Property details are provided by third parties and property owners</li>
                  <li>We do not guarantee the accuracy, completeness, or timeliness of listings</li>
                  <li>Property availability and pricing may change without notice</li>
                  <li>All property transactions are subject to verification and due diligence</li>
                  <li>Users should independently verify all property information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. User Conduct and Prohibited Activities</h2>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Use our services for any unlawful purpose or in violation of local, state, or national laws</li>
                  <li>Post false, misleading, or fraudulent property information</li>
                  <li>Harass, abuse, or harm other users or our staff</li>
                  <li>Attempt to gain unauthorized access to our systems or user accounts</li>
                  <li>Use automated tools to scrape or extract data from our platform</li>
                  <li>Interfere with the proper functioning of our services</li>
                  <li>Violate any applicable real estate laws or regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Protection</h2>
                <p className="mb-4">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal 
                  information. By using our services, you agree to our privacy practices as described in our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Fees and Payments</h2>
                <p className="mb-4">
                  Some of our services may require payment of fees. When applicable:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>All fees are clearly disclosed before payment</li>
                  <li>Payments are processed securely through trusted payment gateways</li>
                  <li>Refund policies are specific to each service and will be clearly stated</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
                <p className="mb-4">
                  The South Delhi Realty platform, including its content, features, and functionality, is owned by us and is 
                  protected by copyright, trademark, and other intellectual property laws. You may not:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Copy, modify, or distribute our content without permission</li>
                  <li>Use our trademarks or branding without authorization</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Create derivative works based on our platform</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitation of Liability</h2>
                <p className="mb-4">
                  Our services are provided "as is" and "as available." We disclaim all warranties, express or implied. 
                  We are not liable for:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Actions or omissions of third-party property owners or agents</li>
                  <li>Market fluctuations or changes in property values</li>
                  <li>Technical failures or service interruptions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
                <p className="mb-4">
                  You agree to indemnify and hold harmless South Delhi Realty, its officers, directors, employees, and agents 
                  from any claims, damages, or expenses arising from your use of our services or violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account and access to our services at any time, with or without notice, 
                  for any reason, including violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Governing Law and Jurisdiction</h2>
                <p className="mb-4">
                  These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of our 
                  services will be subject to the jurisdiction of the courts in New Delhi, India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes by 
                  posting the updated Terms on our website. Your continued use of our services after such changes constitutes 
                  acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="mb-2"><strong>South Delhi Realty</strong></p>
                  <p className="mb-2">Ward no. 1, Shop No.3, Desu Road, near Canara Bank</p>
                  <p className="mb-2">New Delhi, Delhi 110030</p>
                  <p className="mb-2">Phone: +91-99112-48822</p>
                  <p className="mb-2">Email: southdelhirealti@gmail.com</p>
                  <p>Website: https://southdelhirealty.com</p>
                </div>
              </section>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 