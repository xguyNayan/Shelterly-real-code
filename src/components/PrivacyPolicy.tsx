import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: April 30, 2025</p>
          
          <div className="prose prose-blue max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to Shelterly ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p className="text-gray-600 mb-4">
              By accessing or using Shelterly, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect several types of information from and about users of our platform:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2"><strong>Personal Information:</strong> Name, email address, phone number, and profile picture when you create an account.</li>
              <li className="mb-2"><strong>Authentication Information:</strong> When you sign up using Google or other third-party authentication services.</li>
              <li className="mb-2"><strong>Search Preferences:</strong> Location preferences, budget range, and other accommodation preferences.</li>
              <li className="mb-2"><strong>Usage Data:</strong> Information about how you interact with our platform, including PGs you view, search queries, and features you use.</li>
              <li className="mb-2"><strong>Device Information:</strong> Information about your device, browser, and how you access our platform.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2">Provide, maintain, and improve our services</li>
              <li className="mb-2">Process and complete transactions</li>
              <li className="mb-2">Send you notifications about PG listings that match your preferences</li>
              <li className="mb-2">Communicate with you about our services, updates, and promotions</li>
              <li className="mb-2">Personalize your experience on our platform</li>
              <li className="mb-2">Monitor and analyze usage patterns and trends</li>
              <li className="mb-2">Protect against unauthorized access and ensure the security of our platform</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2"><strong>PG Owners:</strong> When you express interest in a PG, we share your contact information with the PG owner to facilitate communication.</li>
              <li className="mb-2"><strong>Service Providers:</strong> Third-party vendors who provide services on our behalf, such as hosting, analytics, and customer service.</li>
              <li className="mb-2"><strong>Legal Requirements:</strong> When required by law or to protect our rights, privacy, safety, or property.</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information to third parties.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Data Storage and Security</h2>
            <p className="text-gray-600 mb-4">
              We use Firebase for data storage and authentication. Your data is stored securely in accordance with industry standards. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Your Choices and Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li className="mb-2">Access, correct, or delete your personal information</li>
              <li className="mb-2">Opt-out of marketing communications</li>
              <li className="mb-2">Disable location services through your device settings</li>
              <li className="mb-2">Request that we restrict the processing of your personal information</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, please contact us at support@shelterly.com.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. Cookies and Similar Technologies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to enhance your experience on our platform, analyze usage patterns, and personalize content. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our platform.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">10. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Email: support@shelterly.com<br />
              Phone: +91 9876543210
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
