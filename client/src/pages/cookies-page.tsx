import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Breadcrumb from "@/components/seo/breadcrumb";
import SEOHead from "@/components/seo/seo-head";

export default function CookiesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cookie Policy", isActive: true }
  ];

  return (
    <>
      <SEOHead
        title="Cookie Policy - How We Use Cookies & Tracking"
        description="Learn about South Delhi Realty's cookie policy, how we use cookies, tracking technologies, and your cookie preferences on our website."
        keywords="cookie policy, cookies, tracking, website cookies, privacy settings, south delhi realty cookies"
        url="https://southdelhirealty.com/cookies"
        type="article"
        noindex={false}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8 text-center">Cookie Policy</h1>
              
              <div className="text-sm text-muted-foreground mb-8 text-center">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
                <p className="mb-4">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit 
                  our website. They help us provide you with a better browsing experience by remembering your preferences 
                  and improving our services.
                </p>
                <p className="mb-4">
                  This Cookie Policy explains how South Delhi Realty ("we," "our," or "us") uses cookies and similar 
                  tracking technologies on our website at https://southdelhirealty.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold mb-3">2.1 Essential Cookies</h3>
                <p className="mb-4">
                  These cookies are necessary for the website to function properly. They enable basic functions like 
                  page navigation and access to secure areas of the website.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                  <li>CSRF protection</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.2 Performance Cookies</h3>
                <p className="mb-4">
                  These cookies collect information about how visitors use our website, helping us improve performance 
                  and user experience.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Page load times and site performance</li>
                  <li>Popular pages and content</li>
                  <li>Error monitoring and debugging</li>
                  <li>A/B testing and optimization</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.3 Functionality Cookies</h3>
                <p className="mb-4">
                  These cookies remember your choices and preferences to provide enhanced, personalized features.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Language and region preferences</li>
                  <li>Property search filters and sorting</li>
                  <li>Saved properties and favorites</li>
                  <li>User interface customizations</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.4 Analytics Cookies</h3>
                <p className="mb-4">
                  We use analytics cookies to understand how our website is used and to improve our services.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Google Analytics for website usage statistics</li>
                  <li>User behavior and interaction tracking</li>
                  <li>Conversion and goal tracking</li>
                  <li>Demographic and interest reports</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">2.5 Marketing Cookies</h3>
                <p className="mb-4">
                  These cookies track your browsing habits to deliver relevant advertisements and marketing content.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Targeted advertising on third-party websites</li>
                  <li>Social media integration and sharing</li>
                  <li>Remarketing and retargeting campaigns</li>
                  <li>Cross-device tracking for consistent experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Specific Cookies We Use</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">session_id</td>
                        <td className="border border-gray-300 px-4 py-2">User authentication and session management</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                        <td className="border border-gray-300 px-4 py-2">Essential</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">csrf_token</td>
                        <td className="border border-gray-300 px-4 py-2">Security protection against CSRF attacks</td>
                        <td className="border border-gray-300 px-4 py-2">Session</td>
                        <td className="border border-gray-300 px-4 py-2">Essential</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">user_preferences</td>
                        <td className="border border-gray-300 px-4 py-2">Store user preferences and settings</td>
                        <td className="border border-gray-300 px-4 py-2">1 year</td>
                        <td className="border border-gray-300 px-4 py-2">Functionality</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">_ga</td>
                        <td className="border border-gray-300 px-4 py-2">Google Analytics - distinguish users</td>
                        <td className="border border-gray-300 px-4 py-2">2 years</td>
                        <td className="border border-gray-300 px-4 py-2">Analytics</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">_gid</td>
                        <td className="border border-gray-300 px-4 py-2">Google Analytics - distinguish users</td>
                        <td className="border border-gray-300 px-4 py-2">24 hours</td>
                        <td className="border border-gray-300 px-4 py-2">Analytics</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">_fbp</td>
                        <td className="border border-gray-300 px-4 py-2">Facebook Pixel for advertising</td>
                        <td className="border border-gray-300 px-4 py-2">3 months</td>
                        <td className="border border-gray-300 px-4 py-2">Marketing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                <p className="mb-4">
                  We may also use third-party services that set their own cookies. These include:
                </p>
                
                <h3 className="text-xl font-semibold mb-3">4.1 Google Services</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Google Analytics:</strong> Website analytics and user behavior tracking</li>
                  <li><strong>Google Maps:</strong> Interactive maps for property locations</li>
                  <li><strong>Google Ads:</strong> Advertising and remarketing campaigns</li>
                  <li><strong>Google OAuth:</strong> User authentication via Google accounts</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">4.2 Social Media Platforms</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Facebook:</strong> Social sharing and Facebook Pixel tracking</li>
                  <li><strong>Instagram:</strong> Social media integration</li>
                  <li><strong>WhatsApp:</strong> Direct messaging functionality</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">4.3 Other Services</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Cloudinary:</strong> Image hosting and optimization</li>
                  <li><strong>Payment Gateways:</strong> Secure payment processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
                
                <h3 className="text-xl font-semibold mb-3">5.1 Browser Settings</h3>
                <p className="mb-4">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>View and delete existing cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block third-party cookies</li>
                  <li>Delete all cookies when closing the browser</li>
                  <li>Receive notifications when cookies are set</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">5.2 Browser-Specific Instructions</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">5.3 Opting Out of Analytics</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Google Analytics:</strong> Use the Google Analytics Opt-out Browser Add-on</li>
                  <li><strong>Facebook:</strong> Adjust your ad preferences in Facebook settings</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
                <p className="mb-4">
                  While you can disable cookies, please note that this may affect your experience on our website:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>You may need to re-enter information more frequently</li>
                  <li>Some features and functionalities may not work properly</li>
                  <li>Personalized content and recommendations may not be available</li>
                  <li>You may see less relevant advertisements</li>
                  <li>Website performance may be reduced</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Mobile App Tracking</h2>
                <p className="mb-4">
                  If you use our mobile application, we may use similar tracking technologies including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Device identifiers and advertising IDs</li>
                  <li>Local storage and app preferences</li>
                  <li>Push notification tokens</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Updates to This Cookie Policy</h2>
                <p className="mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or legal 
                  requirements. We will notify you of any significant changes by posting the updated policy on our 
                  website and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Your Consent</h2>
                <p className="mb-4">
                  By continuing to use our website, you consent to our use of cookies as described in this Cookie Policy. 
                  You can withdraw your consent at any time by adjusting your browser settings or contacting us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Cookie Policy or our use of cookies, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="mb-2"><strong>South Delhi Realty - Data Protection Officer</strong></p>
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