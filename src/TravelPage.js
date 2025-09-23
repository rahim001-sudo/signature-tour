import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the import path as needed
import { useLocation } from "react-router-dom";

const TravelPackagesPage = ({}) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const { search } = useLocation(); // contains query string, e.g. "?name=Paris&id=123"
  const queryy = new URLSearchParams(search);

  const packageQuery = queryy.get("name"); // "Paris"
  const id = queryy.get("id");     // "123"


  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

     

        let packagesQuery

        console.log(packageQuery,"query")

        if (packageQuery!=undefined&&packageQuery && packageQuery.trim() !== '') {
          // Use Firebase query to filter by package field
          packagesQuery = query(
            collection(db, 'features'),
            where('package', '==', packageQuery.trim()),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Fetch all packages if no specific package query
          packagesQuery = query(
            collection(db, 'features'),
            orderBy('createdAt', 'desc')
          );
        }

        const packagesSnapshot = await getDocs(packagesQuery);
        const packagesData = packagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Fetched packages:', packagesData);
        setPackages(packagesData);
        
        // Set visibility for animation
        setTimeout(() => {
          setIsVisible({ packages: true });
        }, 100);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [packageQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          {packageQuery ? `${packageQuery} Packages` : 'Travel Packages'}
        </h1>
        <p className="text-blue-900/70 text-lg max-w-2xl mx-auto">
          {packageQuery 
            ? `Discover amazing ${packageQuery.toLowerCase()} travel experiences with our carefully curated packages` 
            : 'Explore our collection of premium travel packages designed for unforgettable experiences'
          }
        </p>
      </div>

      {/* Packages Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900">
            Available Packages ({packages.length})
          </h2>
          {packageQuery && (
            <div className="bg-yellow-100 text-blue-900 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200">
              Category: {packageQuery}
            </div>
          )}
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-yellow-50 to-blue-50 rounded-2xl border border-yellow-200">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.513-.645-6.371-1.76C5.5 13.151 5.5 13.083 5.5 13V8.5A1.5 1.5 0 017 7h10a1.5 1.5 0 011.5 1.5V13c0 .083 0 .151-.129.24A7.962 7.962 0 0112 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                {packageQuery ? `No ${packageQuery} Packages Yet` : 'No Packages Available'}
              </h3>
              <p className="text-blue-900/70 leading-relaxed">
                {packageQuery 
                  ? `We don't have any packages for "${packageQuery}" at the moment. Check back soon for new exciting travel experiences!`
                  : 'Our travel packages are being updated. Please check back later for amazing destinations and experiences.'
                }
              </p>
              {packageQuery && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-900">
                    Searching for: {packageQuery}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((service, index) => (
              <div 
                key={service.id}
                className={`group relative overflow-hidden rounded-xl bg-white border border-yellow-200 shadow-lg hover:shadow-xl hover:border-yellow-300 transition-all duration-500 transform hover:-translate-y-1 ${
                  isVisible['packages'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-40 overflow-hidden">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-yellow-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-900/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/20 to-transparent"></div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xs">✈️</span>
                  </div>
                  {service.price && (
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-base font-bold">{service.price}</div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gradient-to-b from-white to-yellow-50">
                  <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  {service.subtitle && (
                    <p className="text-blue-900/70 mb-4 leading-relaxed text-sm">
                      {service.subtitle}
                    </p>
                  )}
                  
                  {/* Key Highlights */}
                  {service.focusedFeature && service.focusedFeature.length > 0 && (
                    <div className='space-y-1 mb-3'>
                      {service.focusedFeature.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-blue-900/60">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* WhatsApp and Email buttons */}
                  <div className="flex space-x-2 mb-3">
                    <a 
                      href={`https://wa.me/917383644844?text=Hi, I'm interested in your ${service.title} package. Can you provide more details about pricing and itinerary?`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </a>
                    <a 
                      href={`mailto:signaturewtt@gmail.com?subject=${service.title} Package Inquiry&body=Hi, I'm interested in your ${service.title} package${service.price ? ` (${service.price})` : ''}. Please provide detailed information about the itinerary, accommodation, and booking process.`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                      <span className="text-xs">Email</span>
                    </a>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPackage(service)}
                    className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2.5 rounded-lg font-bold transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                  >
                    VIEW PACKAGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* Simple Package Details Dialog */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">{selectedPackage.title}</h3>
                <p className="text-yellow-600 text-xl font-bold mt-1">{selectedPackage.price}</p>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* All Features Card */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-bold text-blue-900 mb-4">Package Features</h4>
                <div className="space-y-2">
                  {selectedPackage.allFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex space-x-3 mt-6">
                <a 
                  href={`https://wa.me/917383644844?text=Hi, I'm interested in your ${selectedPackage.title} package (${selectedPackage.price}). Please provide more details.`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-center"
                >
                  WhatsApp
                </a>
                <a 
                  href={`mailto:signaturewtt@gmail.com?subject=${selectedPackage.title} Package Inquiry`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-center"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TravelPackagesPage;