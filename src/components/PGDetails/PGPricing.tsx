import React from 'react';
import { FiCheck, FiInfo } from 'react-icons/fi';
import { PGData } from '../PGListing/types';

interface PGPricingProps {
  pg: PGData;
}

const PGPricing: React.FC<PGPricingProps> = ({ pg }) => {
  // Create pricing cards for each available room type
  const pricingOptions = [
    pg.oneSharing?.available && {
      type: 'Single Sharing',
      price: pg.oneSharing.price,
      popular: true,
      features: [
        'Private space',
        'Maximum privacy',
        'Personal desk',
        'Larger room area',
        pg.washroom === 'attached' || pg.washroom === 'both' ? 'Attached bathroom' : 'Common bathroom'
      ]
    },
    pg.twoSharing?.available && {
      type: 'Double Sharing',
      price: pg.twoSharing.price,
      popular: false,
      features: [
        'Shared with one roommate',
        'Good balance of privacy and cost',
        'Personal desk',
        'Moderate room area',
        pg.washroom === 'attached' || pg.washroom === 'both' ? 'Attached bathroom' : 'Common bathroom'
      ]
    },
    pg.threeSharing?.available && {
      type: 'Triple Sharing',
      price: pg.threeSharing.price,
      popular: false,
      features: [
        'Shared with two roommates',
        'Economical option',
        'Shared desk space',
        'Standard room area',
        pg.washroom === 'attached' || pg.washroom === 'both' ? 'Attached bathroom' : 'Common bathroom'
      ]
    },
    pg.fourSharing?.available && {
      type: 'Four Sharing',
      price: pg.fourSharing.price,
      popular: false,
      features: [
        'Shared with three roommates',
        'Most economical option',
        'Shared desk space',
        'Standard room area',
        pg.washroom === 'attached' || pg.washroom === 'both' ? 'Attached bathroom' : 'Common bathroom'
      ]
    },
    pg.fiveSharing?.available && {
      type: 'Five Sharing',
      price: pg.fiveSharing.price,
      popular: false,
      features: [
        'Shared with four roommates',
        'Budget-friendly option',
        'Shared desk space',
        'Larger room area',
        pg.washroom === 'attached' || pg.washroom === 'both' ? 'Attached bathroom' : 'Common bathroom'
      ]
    }
  ].filter(Boolean);

  return (
    <div>
      {/* Pricing header with quirky design */}
      <div className="relative bg-gradient-to-r from-primary-50 to-blue-50 rounded-[30px] p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 opacity-30 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-30 rounded-tr-full"></div>
        
        <h2 className="text-2xl font-bold text-primary-800 mb-3 relative z-10">Room Options & Pricing</h2>
        <p className="text-gray-600 max-w-3xl relative z-10">
          {pg.name} offers various room configurations to suit different preferences and budgets.
          All prices include basic amenities and services. Additional charges may apply for premium services.
        </p>
      </div>
      
      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {pricingOptions.map((option, index) => (
          <div 
            key={index}
            className={`relative bg-white rounded-[30px] overflow-hidden transition-all hover:shadow-lg ${
              option.popular ? 'border-2 border-primary-500 shadow-md' : 'border border-gray-100 shadow-sm'
            }`}
          >
            {option.popular && (
              <div className="absolute top-5 right-5 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Popular
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary-800 mb-2">{option.type}</h3>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-800">₹{option.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <FiCheck className="text-primary-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-full font-medium transition-all ${
                option.popular 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-gray-100 text-primary-800 hover:bg-gray-200'
              }`}>
                Book Now
              </button>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-50 rounded-full opacity-50"></div>
          </div>
        ))}
      </div>
      
      {/* Additional pricing information */}
      <div className="bg-white rounded-[30px] p-6 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-primary-800 mb-4">Additional Charges</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Security Deposit</span>
              <span className="font-medium text-primary-800">₹{pg.deposit} (Refundable)</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Maintenance Fee</span>
              <span className="font-medium text-primary-800">₹500/month</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Electricity</span>
              <span className="font-medium text-primary-800">As per usage</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Food (if opted)</span>
              <span className="font-medium text-primary-800">₹3,500/month</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Laundry Service</span>
              <span className="font-medium text-primary-800">₹800/month</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-700">Guest Stay</span>
              <span className="font-medium text-primary-800">₹300/night</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment policy */}
      <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-[30px] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 opacity-20 rounded-bl-full"></div>
        
        <div className="flex items-start mb-4">
          <div className="p-2 bg-white rounded-full mr-4 text-primary-500">
            <FiInfo size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary-800 mb-2">Payment Policy</h3>
            <p className="text-gray-700">
              Monthly rent is due by the 5th of each month. We accept payments via bank transfer, UPI, or through our app.
              Late payments will incur a penalty of 5% of the monthly rent.
            </p>
          </div>
        </div>
        
        <div className="mt-6 pl-14">
          <h4 className="font-medium text-primary-800 mb-2">Cancellation Policy</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
              <span>1-month notice period required for vacating the PG</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
              <span>Security deposit will be refunded within 15 days after vacating, subject to deductions for damages if any</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
              <span>Minimum 3-month lock-in period from the date of moving in</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PGPricing;
