import React from 'react';
import { 
  FiWifi, FiTv, FiCoffee, FiHome, FiShield, 
  FiDroplet, FiWind, FiMonitor, FiPackage, FiTruck,
  FiCheck, FiX, FiSun, FiVideo, FiZap, FiThermometer,
  FiArrowUp
} from 'react-icons/fi';
import { PGData } from '../PGListing/types';

interface QuirkyAmenitiesProps {
  pg: PGData;
}

const QuirkyAmenities: React.FC<QuirkyAmenitiesProps> = ({ pg }) => {
  // Define amenities with icons, descriptions and fun facts
  const amenities = [
    {
      id: 'wifi',
      name: 'WiFi',
      icon: <FiWifi size={28} />,
      available: pg.wifi === true || pg.amenities?.wifi === true,
      description: 'High-speed internet access throughout the property',
      funFact: 'Stay connected with speeds fast enough to stream your favorite shows!'
    },
    {
      id: 'tv',
      name: 'TV',
      icon: <FiTv size={28} />,
      available: pg.tv === true || pg.amenities?.tv === true,
      description: 'Television with cable/streaming services in common areas',
      funFact: 'Movie nights just got better with our entertainment setup!'
    },
    {
      id: 'food',
      name: 'Food',
      icon: <FiCoffee size={28} />,
      available: pg.food === true || pg.amenities?.food === true,
      description: 'Nutritious meals provided according to meal schedule',
      funFact: 'Home-cooked meals that remind you of mom\'s cooking!'
    },
    {
      id: 'fridge',
      name: 'Refrigerator',
      icon: <FiHome size={28} />,
      available: pg.fridge === true || pg.amenities?.fridge === true,
      description: 'Shared refrigerator for storing personal food items',
      funFact: 'Keep your midnight snacks fresh and ready!'
    },
    {
      id: 'security',
      name: 'Security',
      icon: <FiShield size={28} />,
      available: pg.security === true || pg.amenities?.security === true,
      description: '24/7 security with CCTV surveillance for your safety',
      funFact: 'Sleep soundly knowing we\'ve got your back!'
    },
    {
      id: 'washingMachine',
      name: 'Washing Machine',
      icon: <FiDroplet size={28} />,
      available: pg.washingMachine === true || pg.amenities?.washingMachine === true,
      description: 'Laundry facilities available for residents',
      funFact: 'No more lugging laundry bags to the laundromat!'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      icon: <FiHome size={28} />,
      available: pg.housekeeping === true || pg.amenities?.housekeeping === true,
      description: 'Regular cleaning services to maintain hygiene',
      funFact: 'A clean space is a happy space - and we handle it for you!'
    },
    {
      id: 'parking',
      name: 'Parking',
      icon: <FiTruck size={28} />,
      available: pg.parking === true || pg.amenities?.parking === true,
      description: 'Secure parking space for vehicles',
      funFact: 'No more circling the block looking for parking spots!'
    },
    {
      id: 'cctv',
      name: 'CCTV Surveillance',
      icon: <FiVideo size={28} />,
      available: pg.amenities?.cctv === true || (pg as any).cctv === true,
      description: '24/7 video monitoring for enhanced security',
      funFact: 'Extra peace of mind with round-the-clock surveillance!'
    },
    {
      id: 'geyser',
      name: 'Hot Water',
      icon: <FiThermometer size={28} />,
      available: pg.amenities?.geyser === true || (pg as any).geyser === true,
      description: 'Hot water available for showers and washing',
      funFact: 'Enjoy hot showers even on the coldest mornings!'
    },
    {
      id: 'ac',
      name: 'Air Conditioning',
      icon: <FiWind size={28} />,
      available: pg.amenities?.ac === true || (pg as any).ac === true,
      description: 'Climate control for comfortable living',
      funFact: 'Stay cool during summer months with temperature control!'
    },
    {
      id: 'powerBackup',
      name: 'Power Backup',
      icon: <FiZap size={28} />,
      available: pg.amenities?.powerBackup === true || (pg as any).powerBackup === true,
      description: 'Backup power supply during outages',
      funFact: 'Never worry about power cuts interrupting your work or sleep!'
    },
    {
      id: 'lift',
      name: 'Lift/Elevator',
      icon: <FiArrowUp size={28} />,
      available: pg.amenities?.lift === true || (pg as any).lift === true,
      description: 'Elevator access for convenient movement between floors',
      funFact: 'No more climbing stairs with heavy luggage!'
    },
    {
      id: 'studyArea',
      name: 'Study Area',
      icon: <FiMonitor size={28} />,
      available: false, // Study area is not in the onboarding form, so default to false
      description: 'Dedicated space for studying with proper lighting',
      funFact: 'Ace those exams with our distraction-free study zones!'
    }
  ];

  return (
    <div>
      <div className="bg-white rounded-[30px] p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-primary-800 mb-8 relative inline-block">
          Amenities & Facilities
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary-500 rounded-full"></div>
        </h2>
        
        {/* Available Amenities */}
        <div>
          <h3 className="text-xl font-semibold text-primary-800 mb-6 flex items-center">
            <FiCheck className="mr-2 text-green-500" /> Available Amenities
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {amenities.filter(amenity => amenity.available).map(amenity => (
              <div 
                key={amenity.id}
                className="flex flex-col items-center justify-center group"
                title={amenity.name}
              >
                <div className="p-2 bg-primary-50 text-primary-600 rounded-full h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="text-sm">{amenity.icon}</span>
                </div>
                <span className="text-xs mt-1 text-gray-600">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuirkyAmenities;
