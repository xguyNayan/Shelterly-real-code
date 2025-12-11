import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: April 30, 2025</p>
          
          <div className="prose prose-blue max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Shelterly. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
            <p className="text-gray-600 mb-4">
              These Terms constitute a legally binding agreement between you and Shelterly regarding your use of our platform and services.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Service Description</h2>
            <p className="text-gray-600 mb-4">
              Shelterly is a platform that connects individuals seeking PG accommodations with property owners offering such accommodations. We provide a directory of available PGs, hostels, and shared accommodations along with their details, but we are not a party to any transaction between users and property owners.
            </p>
            <p className="text-gray-600 mb-4">
              While we strive to verify the information provided by property owners, we cannot guarantee the accuracy, completeness, or reliability of such information. Users are encouraged to verify all information directly with the property owners before making any decisions.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of our platform, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p className="text-gray-600 mb-4">
              You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p className="text-gray-600 mb-4">
              We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. User Conduct</h2>
            <p className="text-gray-600 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2">Use our services for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li className="mb-2">Harass, abuse, or harm another person</li>
              <li className="mb-2">Impersonate another user or person</li>
              <li className="mb-2">Use our services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying our services</li>
              <li className="mb-2">Attempt to access any part of the service that you are not authorized to access</li>
              <li className="mb-2">Develop or use any third-party applications that interact with our services without our prior written consent</li>
              <li className="mb-2">Use our services for any harmful or nefarious purpose</li>
              <li className="mb-2">Engage in any fraudulent activity with respect to payment methods</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Property Listings</h2>
            <p className="text-gray-600 mb-4">
              Property owners are solely responsible for the accuracy and completeness of their listings. Shelterly does not guarantee the quality, safety, or legality of listed properties.
            </p>
            <p className="text-gray-600 mb-4">
              We reserve the right to remove any listing from our platform at our sole discretion, without notice, for any reason, including but not limited to violations of these Terms.
            </p>
            <p className="text-gray-600 mb-4">
              Users should exercise due diligence when considering any property listed on our platform. We recommend visiting the property in person and verifying all details before making any payment or commitment.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Payments and Fees</h2>
            <p className="text-gray-600 mb-4">
              Shelterly may charge fees for certain services. All fees are non-refundable unless otherwise specified. We reserve the right to change our fee structure at any time.
            </p>
            <p className="text-gray-600 mb-4">
              Any payments made directly to property owners are not processed by Shelterly. We are not responsible for any payment disputes between users and property owners.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              The Shelterly platform, including its content, features, and functionality, is owned by Shelterly and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600 mb-4">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our platform without our prior written consent.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, Shelterly and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2">Your access to or use of or inability to access or use our services</li>
              <li className="mb-2">Any conduct or content of any third party on our services</li>
              <li className="mb-2">Any content obtained from our services</li>
              <li className="mb-2">Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">9. Indemnification</h2>
            <p className="text-gray-600 mb-4">
              You agree to defend, indemnify, and hold harmless Shelterly and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of our services or your violation of these Terms.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and bar access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p className="text-gray-600 mb-4">
              Upon termination, your right to use our services will immediately cease. If you wish to terminate your account, you may simply discontinue using our services or contact us to request account deletion.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">11. Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-600 mb-4">
              Any dispute arising out of or relating to these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-gray-600 mb-4">
              By continuing to access or use our services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use our services.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">13. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Email: shelterly.in@gmail.com<br />
              Phone: +91 9481402325
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
