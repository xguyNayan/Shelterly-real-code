import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiUsers, FiTarget, FiTrendingUp, FiShield, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUs: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section - with padding-top to prevent navbar overlap */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-primary-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-primary-100 rounded-full opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              About <span className="text-primary-500">Shelterly</span>
            </h1>
            <p className="text-sm md:text-xl text-gray-600 mb-4 md:mb-8 px-2 md:px-4 max-w-xs mx-auto md:max-w-none">
              Transforming how students and professionals find their perfect PG accommodations
            </p>
            <div className="w-16 md:w-24 h-1 bg-primary-500 mx-auto rounded-full mb-6 md:mb-12"></div>
          </motion.div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 px-2 sm:px-0">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-6 text-center md:text-left">Our Story</h2>
              <p className="text-sm md:text-base text-gray-600 mb-3 text-center md:text-left">
                Shelterly was born from a simple observation: finding quality PG accommodations in India is unnecessarily complicated and time-consuming. Our co-founders, Sahil and Vishal, experienced this frustration firsthand during their college years.
              </p>
              <p className="text-sm md:text-base text-gray-600 mb-3 text-center md:text-left">
                In 2023, they decided to solve this problem by creating a platform that would make finding verified PGs as simple as swiping right or left. What started as a solution for friends evolved into a mission to transform the PG finding experience.
              </p>
              <p className="text-sm md:text-base text-gray-600 text-center md:text-left">
                Today, Shelterly is revolutionizing how students and professionals find their ideal living spaces with our innovative approach and commitment to transparency.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-primary-100 rounded-lg"></div>
                <div className="relative z-10 rounded-lg shadow-lg w-full h-48 md:h-80 bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <FiUsers className="text-primary-500 mx-auto mb-4" size={60} />
                    <p className="text-gray-500 font-medium">Shelterly Team</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Vision & Mission */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Our Vision & Mission</h2>
            <div className="w-16 h-1 bg-primary-500 mx-auto rounded-full mb-6"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-2 sm:px-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-4 md:p-8 rounded-xl shadow-sm"
            >
              <div className="bg-primary-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4 md:mb-6">
                <FiTarget className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To create a world where finding your perfect living space is as simple as a swipe. We envision a future where everyone can access safe, verified, and comfortable accommodations without the stress and uncertainty that traditionally comes with the search.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-sm"
            >
              <div className="bg-primary-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4 md:mb-6">
                <FiHome className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To revolutionize the PG accommodation industry by providing a transparent, efficient, and user-friendly platform that connects seekers with verified PG owners. We're committed to eliminating the friction and uncertainty from the PG finding process through technology and rigorous verification.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Our Core Values</h2>
            <p className="text-gray-600 mb-6">
              These principles guide everything we do at Shelterly
            </p>
            <div className="w-16 h-1 bg-primary-500 mx-auto rounded-full mb-6"></div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 px-2 sm:px-0"
          >
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiShield className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                We verify every PG on our platform and provide honest, comprehensive information to help you make informed decisions.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiUsers className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">User-Centric Approach</h3>
              <p className="text-gray-600">
                Every feature we build starts with understanding our users' needs and pain points. Your experience is our priority.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiTrendingUp className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Continuous Innovation</h3>
              <p className="text-gray-600">
                We're constantly exploring new technologies and approaches to make finding your perfect PG even easier and more enjoyable.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiHeart className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Community Focus</h3>
              <p className="text-gray-600">
                We believe in building communities, not just providing accommodations. We foster connections between PG residents and owners.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiTarget className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Quality Over Quantity</h3>
              <p className="text-gray-600">
                We prioritize listing high-quality, verified PGs rather than simply growing our numbers. Every PG on Shelterly meets our standards.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 md:mb-4">
                <FiUsers className="text-primary-600 text-xl" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Inclusive Access</h3>
              <p className="text-gray-600">
                We're committed to making quality PG accommodations accessible to everyone, regardless of budget or background.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Our Journey */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Our Journey</h2>
            <div className="w-16 h-1 bg-primary-500 mx-auto rounded-full mb-6"></div>
          </motion.div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-100"></div>
            
            {/* Timeline Items */}
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center mb-16 px-4 md:px-0"
              >
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm w-full md:inline-block">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 md:text-right text-center">The Beginning</h3>
                    <p className="text-gray-600 md:text-right text-center">
                      Sahil and Vishal recognized the challenges of finding quality PG accommodations and conceptualized Shelterly as a solution.
                    </p>
                  </div>
                </div>
                <div className="bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center z-10 my-4 md:my-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block"></div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center mb-16 px-4 md:px-0"
              >
                <div className="md:w-1/2 md:pr-12 hidden md:block"></div>
                <div className="bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center z-10 my-4 md:my-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm w-full md:inline-block">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 text-center md:text-left">Development & Testing</h3>
                    <p className="text-gray-600 text-center md:text-left">
                      We built the first version of our platform and tested it with a small group of users and PG owners in Bangalore.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center mb-16 px-4 md:px-0"
              >
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm w-full md:inline-block">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center md:text-right">Launch & Growth</h3>
                    <p className="text-gray-600 text-center md:text-right">
                      Shelterly officially launched, quickly gaining traction among students and young professionals looking for quality PGs.
                    </p>
                  </div>
                </div>
                <div className="bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center z-10 my-4 md:my-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="md:w-1/2 md:pl-12 hidden md:block"></div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center px-4 md:px-0"
              >
                <div className="md:w-1/2 md:pr-12 hidden md:block"></div>
                <div className="bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center z-10 my-4 md:my-0">
                  <span className="text-white font-bold">4</span>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm w-full md:inline-block">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 text-center md:text-left">Today & Tomorrow</h3>
                    <p className="text-gray-600 text-center md:text-left">
                      We're continuously expanding our offerings and refining our platform based on user feedback, with plans to expand to more cities across India.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Meet the Founders */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Meet Our Founders</h2>
            <p className="text-gray-600 mb-6">
              The visionaries behind Shelterly
            </p>
            <div className="w-16 h-1 bg-primary-500 mx-auto rounded-full mb-6"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 px-4 sm:px-0">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="absolute -top-3 -left-3 w-full h-full bg-primary-100 rounded-full"></div>
                <div className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 md:w-64 md:h-64 rounded-full shadow-lg bg-gray-100 flex items-center justify-center">
                  <FiUser className="text-primary-500" size={isMobile ? 40 : 60} />
                </div>
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Sahil</h3>
              <p className="text-primary-500 font-medium mb-4">Co-founder</p>
              <p className="text-xs md:text-base text-gray-600 text-center max-w-xs md:max-w-md px-2">
                With a background in technology and a passion for solving real-world problems, Sahil leads Shelterly's product vision and business strategy. His experience in the PG accommodation space gives him unique insights into the challenges faced by both seekers and owners.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="absolute -top-3 -left-3 w-full h-full bg-primary-100 rounded-full"></div>
                <div className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 md:w-64 md:h-64 rounded-full shadow-lg bg-gray-100 flex items-center justify-center">
                  <FiUser className="text-primary-500" size={isMobile ? 40 : 60} />
                </div>
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Vishal</h3>
              <p className="text-primary-500 font-medium mb-4">Co-founder</p>
              <p className="text-xs md:text-base text-gray-600 text-center max-w-xs md:max-w-md px-2">
                Vishal brings technical expertise and innovative thinking to Shelterly. His focus on creating seamless user experiences and leveraging technology to solve complex problems has been instrumental in building our platform from the ground up.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Join Our Journey */}
      <section className="py-10 md:py-16 bg-primary-500 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Join Our Journey</h2>
            <p className="text-lg md:text-xl opacity-90 mb-6 md:mb-8">
              Whether you're looking for a PG or want to list your property, be part of the Shelterly community
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 px-2 sm:px-0">
              <a href="/pg-listing" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors">
                Find a PG
              </a>
              <a href="/list-pg" className="bg-transparent hover:bg-primary-600 border-2 border-white px-6 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors">
                List Your PG
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutUs;