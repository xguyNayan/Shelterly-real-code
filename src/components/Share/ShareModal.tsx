import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiLink, FiCopy, FiTwitter, FiInstagram, FiFacebook, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share on social media
  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this PG: ${title}`)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareByEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`Check out this PG: ${title}`)}&body=${encodeURIComponent(`I found this great PG on Shelterly: ${url}`)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this PG: ${title} ${url}`)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Share this PG</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-5">
                <p className="text-sm text-gray-600 mb-2">Copy link</p>
                <div className="flex items-center bg-gray-100 rounded-lg p-2 mb-1">
                  <FiLink className="text-gray-500 mr-2" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-gray-700 truncate">{url}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="ml-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <FiCopy className="text-gray-600" />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Link copied to clipboard!</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-3">Share via</p>
                <div className="grid grid-cols-4 gap-3">
                  <button 
                    onClick={shareOnTwitter}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <FiTwitter className="text-blue-500 text-xl mb-1" />
                    <span className="text-xs text-gray-700">Twitter</span>
                  </button>
                  
                  <button 
                    onClick={shareOnFacebook}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <FiFacebook className="text-blue-600 text-xl mb-1" />
                    <span className="text-xs text-gray-700">Facebook</span>
                  </button>
                  
                  <button 
                    onClick={shareOnWhatsApp}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-green-600 text-xl mb-1"
                    >
                      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
                      <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c9.756 0 17.664-7.89 17.667-17.65.001-4.714-1.85-9.136-5.201-12.473zm-9.676 26.779h-.004c-2.642-.002-5.236-.656-7.512-1.893l-.534-.3-5.59 1.463 1.483-5.428-.329-.523c-1.383-2.18-2.11-4.718-2.108-7.345.005-7.615 6.214-13.815 13.836-13.815 3.688.002 7.152 1.436 9.76 4.044 2.607 2.608 4.04 6.073 4.039 9.761-.006 7.598-6.217 13.796-13.84 13.796z" />
                    </svg>
                    <span className="text-xs text-gray-700">WhatsApp</span>
                  </button>
                  
                  <button 
                    onClick={shareByEmail}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <FiMail className="text-purple-600 text-xl mb-1" />
                    <span className="text-xs text-gray-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
