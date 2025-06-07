import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Breadcrumb from "@/components/seo/breadcrumb";
import SEOHead from "@/components/seo/seo-head";

export default function PrivacyPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Privacy Policy", isActive: true }
  ];

  return (
    <>
      <SEOHead
        title="Privacy Policy - Data Protection & Privacy Rights"
        description="Learn how South Delhi Realty protects your privacy, collects, uses, and safeguards your personal information on our real estate platform."
        keywords="privacy policy, data protection, personal information, privacy rights, south delhi realty privacy"
        url="https://southdelhirealty.com/privacy"
        type="article"
        noindex={false}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
              
              <div className="text-sm text-muted-foreground mb-8 text-center">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  South Delhi Realty ("we," "our," or "us") is committed to protecting your privacy and personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                  our website, use our mobile application, or engage with our real estate services.
                </p>
                <p className="mb-4">
                  By using our services, you consent to the data practices described in this Privacy Policy. If you do not 
                  agree with our practices, please do not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
                <p className="mb-4">We may collect the following personal information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Name, email address, phone number</li>
                  <li>Postal address and location information</li>
                  <li>Age, occupation, and income details (for property transactions)</li>
                  <li>Financial information for property financing</li>
                  <li>Government-issued ID numbers (as required by law)</li>
                  <li>Profile photos and other uploaded content</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Property Search Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Search queries and property preferences</li>
                  <li>Saved properties and wish lists</li>
                  <li>Property viewing history</li>
                  <li>Budget range and financing preferences</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.3 Technical Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Website usage data and analytics</li>
                  <li>Cookies and tracking technologies</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use your information for the following purposes:</p>
                
                <h3 className="text-xl font-semibold mb-3">3.1 Service Provision</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Providing property search and listing services</li>
                  <li>Facilitating property transactions and communications</li>
                  <li>Arranging property viewings and consultations</li>
                  <li>Processing applications and agreements</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3.2 Communication</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Responding to your inquiries and requests</li>
                  <li>Sending property alerts and notifications</li>
                  <li>Providing customer support</li>
                  <li>Marketing communications (with consent)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">3.3 Legal and Compliance</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Complying with legal and regulatory requirements</li>
                  <li>Verifying identity and preventing fraud</li>
                  <li>Maintaining records as required by law</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
                <p className="mb-4">We may share your information in the following circumstances:</p>
                
                <h3 className="text-xl font-semibold mb-3">4.1 With Your Consent</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Property owners and landlords (for property inquiries)</li>
                  <li>Other buyers or tenants (with explicit permission)</li>
                  <li>Third-party service providers you've requested</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">4.2 Service Providers</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Payment processors and financial institutions</li>
                  <li>Legal advisors and property lawyers</li>
                  <li>Property valuation and inspection services</li>
                  <li>Marketing and analytics partners</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">4.3 Legal Requirements</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Government authorities and regulatory bodies</li>
                  <li>Law enforcement agencies (when legally required)</li>
                  <li>Courts and legal proceedings</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                <p className="mb-4">We implement robust security measures to protect your information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and database protection</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className="mb-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your 
                  information, we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="mb-4">We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Enable social media features</li>
                  <li>Deliver targeted advertising</li>
                </ul>
                <p className="mb-4">
                  You can control cookie settings through your browser preferences. For more details, please see our 
                  Cookie Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
                <p className="mb-4">You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to provide our services and comply with 
                  legal obligations. Retention periods vary based on:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The type of information collected</li>
                  <li>Legal and regulatory requirements</li>
                  <li>Business needs and purposes</li>
                  <li>Your account status and activity</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
                <p className="mb-4">
                  Your information may be transferred to and processed in countries other than India. We ensure that 
                  such transfers comply with applicable data protection laws and implement appropriate safeguards.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
                <p className="mb-4">
                  Our services are not intended for children under 18 years of age. We do not knowingly collect personal 
                  information from children. If you believe we have collected information from a child, please contact us 
                  immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
                <p className="mb-4">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                  of these external sites. We encourage you to review their privacy policies before providing any information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                  posting the new Privacy Policy on our website and updating the "Last updated" date. Your continued 
                  use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="mb-2"><strong>South Delhi Realty - Privacy Officer</strong></p>
                  <p className="mb-2">M-15, Greater Kailash Part 1</p>
                  <p className="mb-2">New Delhi, Delhi 110048</p>
                  <p className="mb-2">Phone: +91-99112-48822</p>
                  <p className="mb-2">Email: privacy@southdelhirealty.com</p>
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