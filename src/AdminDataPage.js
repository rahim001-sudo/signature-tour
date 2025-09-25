import React, { useState,useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc, updateDoc,deleteDoc } from 'firebase/firestore';
import app, { db, auth } from './firebase';



import { DualImageDialog, FeatureFormDialog, FirebaseDataDisplay, ImageFormDialog,submitToFirebase } from "./App";

export default function AdminDataPage() {
  const [openImage, setOpenImage] = useState(false);
  const [openFeature, setOpenFeature] = useState(false);
  const [openDualImage, setOpenDualImage] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center">Admin Data</h1>

      {/* Button Row */}
      <div className="flex justify-center gap-4">

     <PackageFormDialog
        open={openImage}
        onOpenChange={setOpenImage}
        onSubmit={(data) => submitToFirebase("packages", data)}
      />

     <ImageFormDialog
        open={openImage}
        onOpenChange={setOpenImage}
        onSubmit={(data) => submitToFirebase("products", data)}
      />

      <FeatureFormDialog
        open={openFeature}
        onOpenChange={setOpenFeature}
        onSubmit={(data) => submitToFirebase("features", data)}
      />

      <DualImageDialog
        open={openDualImage}
        onOpenChange={setOpenDualImage}
        onSubmit={(data) => submitToFirebase("galleries", data)}
      />
      </div>

      {/* Firebase Data Below */}
      <div className="mt-6">
        <FirebaseDataDisplayWithEdit  />
      </div>

      {/* Dialogs */}
     
    </div>
  );
}

export const PackageFormDialog = ({ 
  buttonText = "Add Packages", 
  onSubmit = (data) => console.log('Form data:', data),
  buttonClassName = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    setPackages(e.target.value);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!packages.trim()) {
      alert('Please enter package details');
      return;
    }

    // Call onSubmit with the form data
    onSubmit({ packages });

    // Show success message
    setShowSuccess(true);

    // Hide success message after 2 seconds and reset form
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
      setPackages('');
    }, 2000);
  };

  // Handle close dialog
  const handleClose = () => {
    setIsOpen(false);
    setPackages('');
    setShowSuccess(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonText}
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Enter Package Details</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="p-4 mx-6 mt-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Success! Data has been submitted.
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-6">
              {/* Package Input */}
              <div className="mb-6">
                <label htmlFor="packages" className="block text-sm font-medium text-gray-700 mb-2">
                  Packages
                </label>
                <input
                  type="text"
                  id="packages"
                  name="packages"
                  value={packages}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter package details..."
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};





export const FirebaseDataDisplayWithEdit = () => {
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [packages, setPackages] = useState([]);
  const [length,setLength] = useState([])
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImagePreview1, setEditImagePreview1] = useState(null);
  const [editImagePreview2, setEditImagePreview2] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch features
        const featuresQuery = query(collection(db, 'features'), orderBy('createdAt', 'desc'));
        const featuresSnapshot = await getDocs(featuresQuery);
        const featuresData = featuresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
console.log(featuresData)
         const packagesQuery  = query(collection(db, 'packages'), orderBy('createdAt', 'desc'));
        const packagesSnapshot = await getDocs(packagesQuery);
        const packagesData = packagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        
        // Fetch galleries
        const galleriesQuery = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
        const galleriesSnapshot = await getDocs(galleriesQuery);
        const galleriesData = galleriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        
        setFeatures(featuresData);
        setGalleries(galleriesData);
        setPackages(packagesData)
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    

      useEffect(() => {
        fetchData();
      }, []);

 

  // Delete item function (unchanged)
  const deleteItem = async (collectionName, itemId, item) => {
    try {
      setDeleteLoading(itemId);
      await deleteDoc(doc(db, collectionName, itemId));
      
      if (collectionName === 'products') {
        setProducts(prev => prev.filter(p => p.id !== itemId));
      } else if (collectionName === 'features') {
        setFeatures(prev => prev.filter(f => f.id !== itemId));
      } else if (collectionName === 'galleries') {
        setGalleries(prev => prev.filter(g => g.id !== itemId));
      }
      
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Edit functions
  const openEditDialog = (type, item) => {
    if (type === 'features') {
      setEditFormData({
        ...item,
        focusedFeature: item.focusedFeature?.join('\n') || '',
        allFeatures: item.allFeatures?.join('\n') || ''
      });
    } else {
      setEditFormData({ ...item });
    }
    
    setShowEditDialog({ type, item });
    
    // Set image previews
    if (type === 'galleries') {
      setEditImagePreview1(item.image1);
      setEditImagePreview2(item.image2);
    } else {
      setEditImagePreview(item.image);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditImageChange = (e, imageType = 'single') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        
        if (imageType === 'single') {
          setEditFormData(prev => ({ ...prev, image: base64 }));
          setEditImagePreview(base64);
        } else if (imageType === 'image1') {
          setEditFormData(prev => ({ ...prev, image1: base64 }));
          setEditImagePreview1(base64);
        } else if (imageType === 'image2') {
          setEditFormData(prev => ({ ...prev, image2: base64 }));
          setEditImagePreview2(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateItem = async () => {
    try {
      setUpdateLoading(true);
      
      let processedData = { ...editFormData };
      
      // Process features data
      if (showEditDialog.type === 'features') {
        processedData = {
          ...processedData,
          focusedFeature: editFormData.focusedFeature.split('\n').filter(line => line.trim() !== ''),
          allFeatures: editFormData.allFeatures.split('\n').filter(line => line.trim() !== '')
        };
      }
      
      // Remove Firebase-specific fields
      delete processedData.id;
      delete processedData.createdAt;
      
      // Update in Firebase
      await updateDoc(doc(db, showEditDialog.type, showEditDialog.item.id), {
        ...processedData,
        updatedAt: new Date()
      });
      
      // Update local state
      if (showEditDialog.type === 'products') {
        setProducts(prev => prev.map(p => 
          p.id === showEditDialog.item.id 
            ? { ...p, ...processedData }
            : p
        ));
      } else if (showEditDialog.type === 'features') {
        setFeatures(prev => prev.map(f => 
          f.id === showEditDialog.item.id 
            ? { ...f, ...processedData }
            : f
        ));
      } else if (showEditDialog.type === 'galleries') {
        setGalleries(prev => prev.map(g => 
          g.id === showEditDialog.item.id 
            ? { ...g, ...processedData }
            : g
        ));
      }
      
      closeEditDialog();
      alert('Item updated successfully!');
      
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item: ' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const closeEditDialog = () => {
    setShowEditDialog(null);
    setEditFormData({});
    setEditImagePreview(null);
    setEditImagePreview1(null);
    setEditImagePreview2(null);
  };

  const removeEditImage = (imageType) => {
    if (imageType === 'single') {
      setEditImagePreview(null);
      setEditFormData(prev => ({ ...prev, image: null }));
    } else if (imageType === 'image1') {
      setEditImagePreview1(null);
      setEditFormData(prev => ({ ...prev, image1: null }));
    } else if (imageType === 'image2') {
      setEditImagePreview2(null);
      setEditFormData(prev => ({ ...prev, image2: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  console.log(packages)
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Dashboard</h1>
        </div>

          <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Packages ({packages.length})</h2>
          {packages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((product) => (
                <div key={product.id}  className="
      cursor-pointer 
      rounded-2xl 
      bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 
      text-white 
      text-lg font-semibold 
      px-6 py-4 
      shadow-lg 
      hover:shadow-2xl 
      hover:scale-105 
      transition-transform 
      duration-300 
      ease-in-out
    " >
                  {product.packages && (
                      <p className="text-black-600 text-sm mb-2">{product.packages}</p>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Products Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Services ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditDialog('products', product)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteDialog({type: 'products', id: product.id, item: product})}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {product.subtitle && (
                      <p className="text-gray-600 text-sm mb-2">{product.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {product.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Packages ({features.length})</h2>
          {features.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No features found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {feature.image && (
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditDialog('features', feature)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteDialog({type: 'features', id: feature.id, item: feature})}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {feature.subtitle && (
                      <p className="text-gray-600 text-sm mb-3">{feature.subtitle}</p>
                    )}
                    {feature.price && (
                      <p className="text-green-600 font-semibold mb-3">{feature.price}</p>
                    )}
                    
                    {feature.focusedFeature && feature.focusedFeature.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Key Highlights:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {feature.focusedFeature.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-3">
                      {feature.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Galleries Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Certificates ({galleries.length})</h2>
          {galleries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No galleries found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-2 gap-1">
                    {gallery.image1 && (
                      <img 
                        src={gallery.image1} 
                        alt="Gallery Image 1"
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {gallery.image2 && (
                      <img 
                        src={gallery.image2} 
                        alt="Gallery Image 2"
                        className="w-full h-32 object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {gallery.createdAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditDialog('galleries', gallery)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteDialog({type: 'galleries', id: gallery.id, item: gallery})}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteItem(showDeleteDialog.type, showDeleteDialog.id, showDeleteDialog.item)}
                  disabled={deleteLoading === showDeleteDialog.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleteLoading === showDeleteDialog.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit {showEditDialog.type === 'products' ? 'Service' : 
                     showEditDialog.type === 'features' ? 'Package' : 'Certificate'}
              </h2>
              <button
                onClick={closeEditDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Edit Form */}
            <div className="p-6">
              {/* Services/Products Edit Form */}
              {showEditDialog.type === 'products' && (
                <>
                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {editImagePreview ? (
                          <div className="relative">
                            <img src={editImagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeEditImage('single')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload a file</span>
                                <input type="file" accept="image/*" onChange={(e) => handleEditImageChange(e)} className="sr-only" />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                    
                      <select
    name="position"
    value={editFormData.position || ''}
    onChange={handleEditInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select a Position</option>
    {products.map((pkg, index) => (
      <option key={index} value={(index+1)}>
        {index+1}
      </option>
    ))}
  </select>


     
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      All Features <span className="text-xs text-gray-500">(One per line)</span>
                    </label>
                    <textarea
                      name="allFeatures"
                      value={editFormData.allFeatures || ''}
                      onChange={handleEditInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Features/Packages Edit Form */}
              {showEditDialog.type === 'features' && (
                <>
                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {editImagePreview ? (
                          <div className="relative">
                            <img src={editImagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeEditImage('single')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload a file</span>
                                <input type="file" accept="image/*" onChange={(e) => handleEditImageChange(e)} className="sr-only" />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={editFormData.subtitle || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      name="price"
                      value={editFormData.price || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., $2,999, ₹2,50,000..."
                    />
                  </div>


                  <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
  <select
    name="package"
    value={editFormData.package || ''}
    onChange={handleEditInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select a package</option>
    {packages.map((pkg, index) => (
      <option key={index} value={pkg.packages}>
        {pkg.packages}
      </option>
    ))}
  </select>
</div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Highlights <span className="text-xs text-gray-500">(One per line)</span>
                    </label>
                    <textarea
                      name="focusedFeature"
                      value={editFormData.focusedFeature || ''}
                      onChange={handleEditInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      All Features <span className="text-xs text-gray-500">(One per line)</span>
                    </label>
                    <textarea
                      name="allFeatures"
                      value={editFormData.allFeatures || ''}
                      onChange={handleEditInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Galleries/Certificates Edit Form */}
              {showEditDialog.type === 'galleries' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Image 1</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {editImagePreview1 ? (
                          <div className="relative">
                            <img src={editImagePreview1} alt="Preview 1" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeEditImage('image1')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload first image</span>
                                <input type="file" accept="image/*" onChange={(e) => handleEditImageChange(e, 'image1')} className="sr-only" />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Image 2</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {editImagePreview2 ? (
                          <div className="relative">
                            <img src={editImagePreview2} alt="Preview 2" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeEditImage('image2')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload second image</span>
                                <input type="file" accept="image/*" onChange={(e) => handleEditImageChange(e, 'image2')} className="sr-only" />
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditDialog}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateItem}
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {updateLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
  
                  
                