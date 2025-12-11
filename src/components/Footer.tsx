import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiMail, FiPhone, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import logo from '../assets/images/logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 bg-opacity-70 border-t border-gray-100 pt-12 pb-6 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Logo and description */}
          <div className="md:col-span-4 lg:col-span-4">
            <div className="flex items-center mb-4">
              <img src={logo} alt="Shelterly Logo" className="h-8 mr-3" />
              <span className="text-xl font-medium text-gray-800">Shelterly</span>
            </div>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Shelterly helps students and professionals find verified PGs, hostels, and shared accommodations with ease. Discover affordable, trusted stays near your college or office — all in a swipe.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FiInstagram size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pg-listing" className="text-gray-500 hover:text-primary-500 transition-colors">
                  Explore PGs
                </Link>
              </li>
              <li>
                <Link to="/list-pg" className="text-gray-500 hover:text-primary-500 transition-colors">
                  List Your PG
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-500 hover:text-primary-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-500 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Bangalore Areas */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Popular Areas
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Link to="/pg-listing?location=Shanti Nagar" className="text-gray-500 hover:text-primary-500 transition-colors">
                Shanti Nagar
              </Link>
              <Link to="/pg-listing?location=Electronic City" className="text-gray-500 hover:text-primary-500 transition-colors">
                Electronic City
              </Link>
              <Link to="/pg-listing?location=Neelasandra" className="text-gray-500 hover:text-primary-500 transition-colors">
                Neelasandra
              </Link>
              <Link to="/pg-listing?location=Wilson Garden" className="text-gray-500 hover:text-primary-500 transition-colors">
                Wilson Garden
              </Link>
            </div>
          </div>
          
          {/* Contact */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FiMail className="text-primary-500 mt-0.5 mr-3" size={16} />
                <span className="text-gray-500">shelterly.in@gmail.com</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="text-primary-500 mt-0.5 mr-3" size={16} />
                <span className="text-gray-500">+91 9481402325</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Simple divider */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Website design and code by <a href="https://www.linkedin.com/in/nayan-srivastava-4abb38210/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 transition-colors">Nayan Srivastava</a>. All rights reserved.
              Business content © Shelterly.
            </p>
            <div className="flex flex-wrap justify-center space-x-4">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-primary-500 text-xs transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-primary-500 text-xs transition-colors">Terms of Service</Link>
              <Link to="/faq" className="text-gray-400 hover:text-primary-500 text-xs transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
