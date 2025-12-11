import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "What is Shelter Swipe?",
      answer: "Shelter Swipe is India's first swipe-to-find PG experience. It's a Tinder-like interface for finding PG accommodations quickly and easily. You can swipe right on PGs you like to save them to your wishlist, and swipe left on those that don't match your preferences."
    },
    {
      question: "Are all PGs on Shelter Swipe verified?",
      answer: "Yes, all PGs listed on Shelter Swipe are personally verified by our team. We ensure that the information provided is accurate and that the PGs meet our quality standards for safety, cleanliness, and amenities."
    },
    {
      question: "Is there a brokerage fee?",
      answer: "No, Shelter Swipe is completely free for PG seekers. We don't charge any brokerage fee or commission when you find and book a PG through our platform."
    },
    {
      question: "How do I contact a PG owner?",
      answer: "Once you've saved a PG to your wishlist by swiping right, you can view detailed information including contact details. You can then reach out directly to schedule a visit or ask questions."
    },
    {
      question: "Can I filter PGs based on my preferences?",
      answer: "Yes, Shelter Swipe allows you to set preferences like location, budget, gender, and amenities. The PGs shown to you will be tailored to match these preferences, making your search more efficient."
    },
    {
      question: "Is Shelter Swipe available in all cities?",
      answer: "Currently, Shelter Swipe is available in Bangalore. We're rapidly expanding to other major cities across India and will be launching in new locations soon."
    }
  ];
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Enhanced background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFEFF] via-[#F7FDFF] to-[#F5FBFF] z-0"></div>
      
      {/* Structured wavy pattern at top - following user preference */}
      <div className="absolute top-0 left-0 w-full overflow-hidden z-0">
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
          <path 
            fill="#F8FAFC" 
            d="M0,48L48,53.3C96,59,192,69,288,69.3C384,69,480,59,576,53.3C672,48,768,48,864,53.3C960,59,1056,69,1152,69.3C1248,69,1344,59,1392,53.3L1440,48L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
      
      {/* Curved accent elements in corners - following user preference */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#14898A]/10 to-transparent rounded-bl-full -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FF6B6B]/10 to-transparent rounded-tr-full translate-y-1/3 -translate-x-1/3"></div>
      
      {/* Subtle grid pattern as background element - following user preference */}
      <div className="absolute inset-0 opacity-[0.02] z-0" style={{ 
        backgroundImage: "linear-gradient(#14898A 1px, transparent 1px), linear-gradient(90deg, #14898A 1px, transparent 1px)", 
        backgroundSize: "30px 30px" 
      }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.span 
            className="inline-block py-1 px-3 bg-gradient-to-r from-[#14898A]/15 to-[#14898A]/5 text-[#14898A] text-xs font-medium tracking-wider rounded-full mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Got Questions?
          </motion.span>
          
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Frequently <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14898A] to-[#62B299]">Asked Questions</span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to know about Shelter Swipe and finding your perfect PG.
          </motion.p>
        </div>
        
        <div className="max-w-3xl mx-auto relative">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <button
                className={`w-full text-left p-4 sm:p-5 rounded-xl flex justify-between items-center ${
                  openIndex === index ? 'bg-gradient-to-r from-[#14898A]/10 to-[#14898A]/5' : 'bg-white/80 backdrop-blur-sm shadow-sm'
                } hover:shadow-md transition-all duration-300`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.question}</span>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${openIndex === index ? 'bg-[#14898A]/20' : 'bg-gray-100'} transition-colors`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-[#14898A] transition-transform ${openIndex === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-b-xl">
                      <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
