import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiKey, FiShield, FiCreditCard } from 'react-icons/fi';

interface ProfileSectionProps {
  userData: {
    name: string;
    email: string;
    profileImage: string;
    joinDate: string;
  };
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  // Mock additional user data
  const userDetails = {
    phone: '+91 9876543210',
    address: '123 Main Street, Bangalore',
    preferences: {
      gender: 'Male',
      roomType: 'Single Sharing',
      budget: '₹10,000 - ₹15,000',
      location: 'Koramangala, Indiranagar'
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <div className="md:w-1/3">
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary-100">
              <img 
                src={userData.profileImage} 
                alt={userData.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">{userData.name}</h2>
            <p className="text-gray-500 text-sm">Member since {userData.joinDate}</p>
            
            <button className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-full text-sm w-full">
              Edit Profile
            </button>
            
            {/* Profile navigation */}
            <div className="mt-6 space-y-2">
              {[
                { id: 'personal', label: 'Personal Info', icon: <FiUser /> },
                { id: 'preferences', label: 'Preferences', icon: <FiMapPin /> },
                { id: 'security', label: 'Security', icon: <FiShield /> },
                { id: 'payment', label: 'Payment Methods', icon: <FiCreditCard /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all text-left
                    ${activeTab === tab.id 
                      ? 'bg-primary-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Profile content */}
        <div className="md:w-2/3">
          {activeTab === 'personal' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                <button className="p-2 text-primary-500 hover:bg-primary-50 rounded-full">
                  <FiEdit2 />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <FiUser className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <FiMail className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <FiPhone className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{userDetails.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <FiMapPin className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{userDetails.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Preferences</h2>
                <button className="p-2 text-primary-500 hover:bg-primary-50 rounded-full">
                  <FiEdit2 />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Preferred Gender</p>
                  <p className="font-medium mt-1">{userDetails.preferences.gender}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Preferred Room Type</p>
                  <p className="font-medium mt-1">{userDetails.preferences.roomType}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Budget Range</p>
                  <p className="font-medium mt-1">{userDetails.preferences.budget}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Preferred Locations</p>
                  <p className="font-medium mt-1">{userDetails.preferences.location}</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <FiKey className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-primary-500 text-white rounded-full text-sm">
                      Update
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <FiShield className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Enhance your account security</p>
                      </div>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input 
                        type="checkbox" 
                        className="opacity-0 w-0 h-0" 
                        id="toggle-2fa" 
                      />
                      <label 
                        htmlFor="toggle-2fa"
                        className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all"
                      ></label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <FiShield className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">Login History</p>
                        <p className="text-sm text-gray-500">View your recent login activity</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 border border-gray-300 rounded-full text-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'payment' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm">
                  Add New
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <FiCreditCard className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-500">**** **** **** 4321</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Default</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 rounded-full p-2">
                        <FiCreditCard className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-gray-500">user@okbank</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
