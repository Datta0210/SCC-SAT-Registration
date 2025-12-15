import React from 'react';
import { BRANCHES, OFFERINGS, ACHIEVEMENTS } from '../constants';
import { LocationEnum } from '../types';
import { Trophy, Star, MapPin, ExternalLink, Rocket, PhoneCall } from 'lucide-react';

// Helper to map string icon names to Lucide components
const IconMap: Record<string, React.ElementType> = {
  Trophy,
  Rocket,
  Star
};

const InfoSection: React.FC = () => {
  return (
    <div className="space-y-6 py-4 animate-in slide-in-from-right duration-700">
      
      {/* Why Choose Us */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-8">
        <h3 className="text-xl font-bold font-serif text-gray-900 mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-red-600" />
            Why Choose SCC?
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((item: any, idx) => {
            const IconComponent = IconMap[item.icon] || Star;
            return (
              <div 
                key={idx} 
                className="group p-4 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors duration-300 flex flex-col items-center text-center border border-gray-100 hover:border-red-100"
              >
                <div className="mb-3 p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-6 h-6 text-gray-700 group-hover:text-red-600" strokeWidth={2} />
                </div>
                <h4 className="text-gray-900 font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-red-400">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courses */}
      <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-20 transition-opacity duration-500"></div>
        <h3 className="text-xl font-bold font-serif mb-6 flex items-center relative z-10">
          <Rocket className="w-6 h-6 mr-3 text-yellow-400" />
          Courses Offered
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {OFFERINGS.map((offer, idx) => (
            <div key={idx} className="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              <span className="font-medium text-gray-200">{offer}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
         <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold font-serif text-gray-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Contact Centers
            </h2>
         </div>
        
        <div className="p-6 space-y-8">
          {[LocationEnum.SATPUR, LocationEnum.MERI].map((loc, idx) => (
            <div key={loc} className={`relative ${idx === 0 ? 'pb-8 border-b border-gray-100' : ''}`}>
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-gray-900">{BRANCHES[loc].name}</h4>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        {BRANCHES[loc].address}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {BRANCHES[loc].phones.map(phone => (
                            <a key={phone} href={`tel:${phone}`} className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full hover:bg-red-100 transition-colors">
                                <PhoneCall className="w-3 h-3 mr-1.5" />
                                {phone}
                            </a>
                        ))}
                         <a 
                            href={BRANCHES[loc].mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Directions <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoSection;