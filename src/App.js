import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';

// About Us Component
function AboutUs() {
  return (
    <div className="min-h-screen brand-pattern pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#063955] mb-6">About Signature world tour and travels</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for unforgettable travel experiences since 2010
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-[#063955] mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Signature world tour and travels was founded with a vision to make travel accessible, comfortable, and memorable for everyone. With over a decade of experience in the travel industry, we have helped thousands of travelers explore the world with confidence.
            </p>
            <p className="text-gray-600 mb-4">
              We specialize in providing comprehensive travel solutions including flight bookings, hotel reservations, tour packages, and specialized religious pilgrimage services like Hajj and Umrah.
            </p>
            <p className="text-gray-600">
              Our team of experienced travel consultants ensures that every journey is planned to perfection, taking care of all the details so you can focus on creating memories.
            </p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="About Us" className="rounded-lg shadow-lg" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="text-4xl text-[#F8F4E5] mb-4">10+</div>
            <h3 className="text-xl font-semibold text-[#063955] mb-2">Years Experience</h3>
            <p className="text-gray-600">Serving travelers with excellence</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="text-4xl text-[#F8F4E5] mb-4">5000+</div>
            <h3 className="text-xl font-semibold text-[#063955] mb-2">Happy Customers</h3>
            <p className="text-gray-600">Satisfied travelers worldwide</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="text-4xl text-[#F8F4E5] mb-4">50+</div>
            <h3 className="text-xl font-semibold text-[#063955] mb-2">Destinations</h3>
            <p className="text-gray-600">Countries we serve</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#063955] mb-6">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="font-semibold text-[#063955] mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Competitive pricing with no hidden costs</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="font-semibold text-[#063955] mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Round-the-clock customer assistance</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="font-semibold text-[#063955] mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">Professional travel consultants</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="font-semibold text-[#063955] mb-2">Trusted Service</h3>
              <p className="text-gray-600 text-sm">Licensed and certified travel agency</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="bg-[#F8F4E5] hover:bg-[#F6FEFE] text-white px-8 py-3 rounded-full font-semibold inline-flex items-center transform hover:scale-105 transition-all duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Admin Login Component
function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // SIMPLE TEST: Just check for basic credentials
    if (credentials.email === 'admin@test.com' && credentials.password === 'admin123') {
      console.log('✅ Using test credentials - access granted!');
      // Set a fake auth state for testing
      setTimeout(() => {
        setLoading(false);
        window.location.href = '#admin-dashboard';
      }, 1000);
      return;
    }

    console.log('🔐 Starting login process...');
    console.log('📧 Email:', credentials.email);

    try {
      // Sign in with Firebase Auth
      console.log('🚀 Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;
      console.log('✅ Firebase auth successful, UID:', user.uid);

      // SECURE: Check if user is admin in Firestore
      console.log('🔍 Checking admin status in Firestore...');
      try {
        const adminDoc = await getDoc(doc(db, 'admin', user.uid));
        console.log('📄 Admin doc exists:', adminDoc.exists());
        
        if (!adminDoc.exists()) {
          console.log('❌ User is not an admin, signing out...');
          await signOut(auth);
          setError('Access denied. You are not authorized as an admin.');
          return;
        }
        
        const adminData = adminDoc.data();
        if (adminData.role !== 'admin') {
          console.log('❌ User does not have admin role, signing out...');
          await signOut(auth);
          setError('Access denied. Insufficient privileges.');
          return;
        }
        
        console.log('✅ Admin verification successful');
      } catch (firestoreError) {
        console.error('🚨 Firestore security check failed:', firestoreError.message);
        await signOut(auth);
        setError('Security verification failed. Please try again.');
        return;
      }

      // Login successful - the route will handle redirect
      console.log('🎉 Admin logged in successfully');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen brand-pattern flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Signature world tour and travels" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#063955]">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent transition-colors duration-300"
                placeholder="admin@signaturetours.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent transition-colors duration-300"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] hover:from-[#F6FEFE] hover:to-[#F8F4E5] text-[#063955] px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-signature-navy border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-[#2B4B5C] hover:text-[#063955] transition-colors duration-300"
            >
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protected Admin Enquiries Component
function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    service: 'all',
    dateRange: 'all',
    priority: 'all',
    customDateFrom: '',
    customDateTo: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState({
    field: 'timestamp',
    direction: 'desc'
  });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Filter enquiries when filters change
  useEffect(() => {
    let filtered = [...enquiries];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(enquiry => (enquiry.status || 'new') === filters.status);
    }

    // Service filter  
    if (filters.service !== 'all') {
      filtered = filtered.filter(enquiry => enquiry.service === filters.service);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(enquiry => {
        if (!enquiry.timestamp) return false;
        try {
          const enquiryDate = enquiry.timestamp.toDate();
          return enquiryDate >= filterDate;
        } catch {
          return false;
        }
      });
    }

    // Custom date range filter
    if (filters.customDateFrom || filters.customDateTo) {
      filtered = filtered.filter(enquiry => {
        if (!enquiry.timestamp) return false;
        try {
          const enquiryDate = enquiry.timestamp.toDate();
          const fromDate = filters.customDateFrom ? new Date(filters.customDateFrom) : new Date('1900-01-01');
          const toDate = filters.customDateTo ? new Date(filters.customDateTo + 'T23:59:59') : new Date();
          
          return enquiryDate >= fromDate && enquiryDate <= toDate;
        } catch {
          return false;
        }
      });
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(enquiry => (enquiry.priority || 'normal') === filters.priority);
    }

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(enquiry => 
        enquiry.name?.toLowerCase().includes(searchTerm) ||
        enquiry.email?.toLowerCase().includes(searchTerm) ||
        enquiry.phone?.includes(searchTerm) ||
        enquiry.message?.toLowerCase().includes(searchTerm) ||
        enquiry.service?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy.field) {
        case 'timestamp':
          aValue = a.timestamp ? a.timestamp.toDate() : new Date(0);
          bValue = b.timestamp ? b.timestamp.toDate() : new Date(0);
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'service':
          aValue = (a.service || '').toLowerCase();
          bValue = (b.service || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status || 'new').toLowerCase();
          bValue = (b.status || 'new').toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
          aValue = priorityOrder[a.priority || 'normal'];
          bValue = priorityOrder[b.priority || 'normal'];
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortBy.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEnquiries(filtered);
  }, [enquiries, filters, sortBy]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'enquiries'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const enquiriesData = [];
      querySnapshot.forEach((doc) => {
        enquiriesData.push({ id: doc.id, ...doc.data() });
      });
      setEnquiries(enquiriesData);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const updateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      await updateDoc(doc(db, 'enquiries', enquiryId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setEnquiries(prevEnquiries => 
        prevEnquiries.map(enquiry => 
          enquiry.id === enquiryId 
            ? { ...enquiry, status: newStatus }
            : enquiry
        )
      );
      
      console.log(`Enquiry ${enquiryId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const updateEnquiryPriority = async (enquiryId, newPriority) => {
    try {
      await updateDoc(doc(db, 'enquiries', enquiryId), {
        priority: newPriority,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setEnquiries(prevEnquiries => 
        prevEnquiries.map(enquiry => 
          enquiry.id === enquiryId 
            ? { ...enquiry, priority: newPriority }
            : enquiry
        )
      );
      
      console.log(`Enquiry ${enquiryId} priority updated to ${newPriority}`);
    } catch (error) {
      console.error('Error updating enquiry priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getUniqueServices = () => {
    const services = [...new Set(enquiries.map(e => e.service).filter(Boolean))];
    return services.sort();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Admin logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen brand-pattern pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#063955] mb-2">Customer Enquiries</h1>
            <p className="text-gray-600">Manage and track customer inquiries ({filteredEnquiries.length} of {enquiries.length})</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={fetchEnquiries}
              className="bg-[#2B4B5C] hover:bg-[#063955] text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Logout
            </button>
            <Link
              to="/"
              className="bg-[#F8F4E5] hover:bg-[#F6FEFE] text-[#063955] px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              Back to Website
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#F8F4E5] rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Sort by:</label>
              <select
                value={sortBy.field}
                onChange={(e) => setSortBy(prev => ({ ...prev, field: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent text-sm"
              >
                <option value="timestamp">Date</option>
                <option value="name">Name</option>
                <option value="service">Service</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Order:</label>
              <select
                value={sortBy.direction}
                onChange={(e) => setSortBy(prev => ({ ...prev, direction: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Service Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
              <select
                value={filters.service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              >
                <option value="all">All Services</option>
                {getUniqueServices().map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Custom Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.customDateFrom}
                onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              />
            </div>

            {/* Custom Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.customDateTo}
                onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
              />
            </div>
          </div>

          {/* Search - Full Width Row */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search name, email, phone, message, service..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-transparent"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ status: 'all', service: 'all', dateRange: 'all', priority: 'all', customDateFrom: '', customDateTo: '', search: '' })}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-full transition-colors duration-300"
            >
              Clear All
            </button>
            <button
              onClick={() => handleFilterChange('status', 'new')}
              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-full transition-colors duration-300"
            >
              New Only
            </button>
            <button
              onClick={() => handleFilterChange('dateRange', 'today')}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors duration-300"
            >
              Today
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F8F4E5] border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#063955] to-[#2B4B5C] text-white">
              <h2 className="text-xl font-semibold">Total Enquiries: {enquiries.length}</h2>
            </div>
            
            {enquiries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl text-gray-600 mb-2">No enquiries yet</h3>
                <p className="text-gray-500">Customer enquiries will appear here when submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(enquiry.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                            <div className="text-sm text-gray-500">{enquiry.email}</div>
                            <div className="text-sm text-gray-500">{enquiry.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{enquiry.service || 'General Inquiry'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={enquiry.priority || 'normal'}
                            onChange={(e) => updateEnquiryPriority(enquiry.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-[#063955] ${getPriorityColor(enquiry.priority)}`}
                          >
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={enquiry.status || 'new'}
                            onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-[#063955] ${getStatusColor(enquiry.status)}`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="text-[#2B4B5C] hover:text-[#063955] transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Enquiry Detail Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#063955]">Enquiry Details</h3>
                    <p className="text-gray-600 text-sm mt-1">{formatDate(selectedEnquiry.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Interest</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEnquiry.service || 'General Inquiry'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded min-h-[100px]">
                    {selectedEnquiry.message || 'No message provided'}
                  </p>
                </div>
                
                <div className="flex space-x-4 pt-4 border-t">
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Re: Your Travel Inquiry&body=Dear ${selectedEnquiry.name},%0D%0A%0D%0AThank you for your inquiry about ${selectedEnquiry.service || 'our travel services'}...`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    📧 Send Email
                  </a>
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone?.replace(/\D/g, '')}?text=Hello ${selectedEnquiry.name}, thank you for your inquiry about ${selectedEnquiry.service || 'our travel services'}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Privacy Policy Component
function PrivacyPolicy() {
  return (
    <div className="min-h-screen brand-pattern pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#063955] mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us. This policy explains how we handle your information.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#063955] mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This may include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Personal information (name, email, phone number)</li>
              <li>Travel preferences and booking details</li>
              <li>Payment information (processed securely)</li>
              <li>Communication records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#063955] mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Process your bookings and provide travel services</li>
              <li>Communicate with you about your trips and our services</li>
              <li>Improve our services and customer experience</li>
              <li>Comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#063955] mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Travel service providers (airlines, hotels, etc.) to complete your bookings</li>
              <li>Payment processors to handle transactions securely</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#063955] mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#063955] mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="text-gray-600 mt-4">
              <p>Email: signaturewtt@gmail.com</p>
              <p>Phone: +91 7383644844</p>
              <p>Address: 3rd Floor Aazan complex Opp.Abu bhai kapadwala, Juhapura, Ahmedabad Gujarat 380051</p>
              <p>Registered Office: 26 Noor-e-Mohmadi society Dholka, Ahmedabad Gujarat 382225</p>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="bg-[#F8F4E5] hover:bg-[#F6FEFE] text-white px-8 py-3 rounded-full font-semibold inline-flex items-center transform hover:scale-105 transition-all duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main Home Component
function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const certificates = [
    {
      id: 1,
      image: "https://lh3.googleusercontent.com/d/12Vzw5pl32xUI6X79lt7n1BLnukOuOdUD"
    },
    {
      id: 2,
      image: "https://lh3.googleusercontent.com/d/1D9hgLCJtQdKa04zYZ_--SqtaxyOlFwyI"
    },
    {
      id: 3,
      image: "https://lh3.googleusercontent.com/d/1I1GKmHWnFpduhiBky6Byw1h6DF-a7ahu"
    },
    {
      id: 4,
      image: "https://lh3.googleusercontent.com/d/1Imu1JpDl-IRM01rHZ9v0KUReeX-ssBei"
    },
    {
      id: 5,
      image: "https://lh3.googleusercontent.com/d/1TSf6NijtQSrPVIyUOp0q_ufgioJGWhpn"
    },
    {
      id: 6,
      image: "https://lh3.googleusercontent.com/d/1bf2FNWsgYU2mBG65mww-Z7vbbRrMqm7V"
    },
    {
      id: 7,
      image: "https://lh3.googleusercontent.com/d/1fB9RWqA3SZvPsoySzrJ_yDyJxC2B7ga-"
    },
    {
      id: 8,
      image: "https://lh3.googleusercontent.com/d/1qoqmIcrjryFJ6nKlhJW9XxaHZ_wHB6uP"
    },
    {
      id: 9,
      image: "https://lh3.googleusercontent.com/d/1w6xVbQawB-vANIbI5uK57m4XXHkDDtrS"
    },
    {
      id: 10,
      image: "https://lh3.googleusercontent.com/d/1yI3RfU0GR9_AQi2xiIredgWWPMmX8sw6"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-rotate certificates carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCertificate((prev) => (prev + 1) % certificates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [certificates.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Add form data to Firestore
      await addDoc(collection(db, 'enquiries'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'new'
      });
      
      console.log('Form submitted successfully to Firebase:', formData);
      
      // Show success modal instead of alert
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your enquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const hajjUmrahServices = [
    {
      image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Hajj Packages',
      description: 'Complete Hajj pilgrimage with accommodation, meals, and guided rituals',
      price: 'Starting from ₹3,50,000',
      buttonColor: 'bg-[#F8F4E5] hover:bg-[#F6FEFE]'
    },
    {
      image: 'https://images.unsplash.com/photo-1693590614566-1d3ea9ef32f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Umrah Premium',
      description: 'Luxury Umrah experience with 5-star hotels and VIP services',
      price: 'Starting from ₹1,20,000',
      buttonColor: 'bg-[#063955] hover:bg-[#2B4B5C]'
    },
    {
      image: 'https://images.unsplash.com/photo-1627728734379-a5f8c099763e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Umrah Economy',
      description: 'Budget-friendly Umrah packages with comfortable accommodation',
      price: 'Starting from ₹80,000',
      buttonColor: 'bg-[#F6FEFE] hover:bg-[#F8F4E5]'
    },
    {
      image: 'https://images.unsplash.com/photo-1693590614566-1d3ea9ef32f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Family Packages',
      description: 'Special family packages with child care and group facilities',
      price: 'Starting from ₹2,50,000',
      buttonColor: 'bg-[#2B4B5C] hover:bg-[#063955]'
    },
    {
      image: 'https://images.unsplash.com/photo-1627728734379-a5f8c099763e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Ramadan Umrah',
      description: 'Special Ramadan Umrah packages with spiritual programs',
      price: 'Starting from ₹1,50,000',
      buttonColor: 'bg-[#F8F4E5] hover:bg-[#F6FEFE]'
    },
    {
      image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Group Tours',
      description: 'Organized group tours with religious scholars and guides',
      price: 'Starting from ₹95,000',
      buttonColor: 'bg-[#063955] hover:bg-[#2B4B5C]'
    }
  ];

  const services = [
    {
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Flight Booking',
      description: 'Book domestic and international flights at the best prices',
      buttonColor: 'bg-[#2B4B5C] hover:bg-[#063955]'
    },
    {
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Train Booking', 
      description: 'Comfortable train journeys across the country',
      buttonColor: 'bg-[#F8F4E5] hover:bg-[#F6FEFE]'
    },
    {
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Bus Booking',
      description: 'Convenient bus travel with premium amenities',
      buttonColor: 'bg-[#063955] hover:bg-[#2B4B5C]'
    },
    {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Hotel Booking',
      description: 'Luxury accommodations worldwide',
      buttonColor: 'bg-[#F6FEFE] hover:bg-[#F8F4E5]'
    },
    {
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      title: 'Cruise Booking',
      description: 'Luxurious cruise experiences on the high seas',
      buttonColor: 'bg-[#F8F4E5] hover:bg-[#F6FEFE]'
    }
  ];

  return (
    <div className="min-h-screen brand-pattern">
      {/* Header */}
      <header className="bg-[#063955] shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Signature world tour and travels" 
                className="h-16 w-auto"
              />
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-white">Signature world tour</h1>
                <p className="text-sm text-[#F8F4E5]">and travels</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#home" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Home</a>
              <a href="#services" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Services</a>
              <a href="#hajj-umrah" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Hajj & Umrah</a>
              <a href="#packages" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Packages</a>
              <Link to="/about" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">About</Link>
              <Link to="/privacy" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Privacy</Link>
              <a href="#contact" className="text-white hover:text-[#F8F4E5] transition-colors duration-300">Contact</a>
              
              {/* WhatsApp and Email in Header */}
              <div className="flex space-x-2 ml-4 pl-4 border-l border-signature-blue">
                <a 
                  href="https://wa.me/917383644844?text=Hello, I'm interested in your travel services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                <a 
                  href="mailto:signaturewtt@gmail.com?subject=Travel Inquiry&body=Hello, I'm interested in your travel services."
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                  title="Email"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              </div>
            </nav>

            <button 
              className="md:hidden text-white text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-signature-blue pt-4">
              <div className="flex flex-col space-y-3">
                <a href="#home" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Home</a>
                <a href="#services" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Services</a>
                <a href="#hajj-umrah" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Hajj & Umrah</a>
                <a href="#packages" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Packages</a>
                <Link to="/about" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/privacy" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Privacy</Link>
                <a href="#contact" className="text-white hover:text-[#F8F4E5] transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Contact</a>
                
                {/* WhatsApp and Email in Mobile Menu */}
                <div className="flex space-x-4 pt-4 border-t border-signature-blue mt-4">
                  <a 
                    href="https://wa.me/917383644844?text=Hello, I'm interested in your travel services" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                  <a 
                    href="mailto:signaturewtt@gmail.com?subject=Travel Inquiry&body=Hello, I'm interested in your travel services."
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[70vh] flex items-center justify-center py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 28, 61, 0.8), rgba(30, 58, 138, 0.8)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center text-white max-w-4xl mx-auto transition-all duration-1000 ${isVisible.home ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Signature world tour and travels" 
                className="h-20 w-auto opacity-90 animate-pulse-slow"
              />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fadeIn leading-tight">
              Discover Amazing <span className="text-[#F8F4E5]">Places</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 animate-fadeIn animation-delay-300 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Your dream vacation awaits with our premium travel packages
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-[#F8F4E5] hover:bg-[#F6FEFE] text-[#063955] px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                EXPLORE NOW
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#063955] px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105">
                VIEW PACKAGES
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-[#F8F4E5]/30">
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#F8F4E5]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F8F4E5]/30 transition-colors duration-300">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#F8F4E5] mb-2">50K+</div>
                <div className="text-sm md:text-base text-gray-300">Happy Travelers</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#F8F4E5]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F8F4E5]/30 transition-colors duration-300">
                  <span className="text-2xl">🌍</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#F8F4E5] mb-2">200+</div>
                <div className="text-sm md:text-base text-gray-300">Destinations</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#F8F4E5]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F8F4E5]/30 transition-colors duration-300">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#F8F4E5] mb-2">15+</div>
                <div className="text-sm md:text-base text-gray-300">Years Experience</div>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#F8F4E5]/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F8F4E5]/30 transition-colors duration-300">
                  <span className="text-2xl">🕒</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#F8F4E5] mb-2">24/7</div>
                <div className="text-sm md:text-base text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="pt-20 pb-12 bg-gradient-to-b from-[#F8F4E5] to-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-0.5 bg-[#F8F4E5] mr-4"></div>
              <img src="/logo.png" alt="Signature world tour and travels" className="h-12 w-auto opacity-80" />
              <div className="w-16 h-0.5 bg-[#F8F4E5] ml-4"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#063955] mb-4">
              Our Booking Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from our wide range of travel booking options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-2xl bg-white border border-[#F8F4E5]/20 shadow-lg hover:shadow-2xl hover:border-[#F8F4E5]/40 transition-all duration-500 transform hover:-translate-y-2 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-signature-navy/70 via-signature-navy/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#F8F4E5] rounded-full flex items-center justify-center">
                    <span className="text-[#063955] font-bold text-sm">★</span>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-b from-white to-[#F8F4E5]/30">
                  <h3 className="text-2xl font-bold text-[#063955] mb-3 group-hover:text-[#F8F4E5] transition-colors duration-300">{service.title}</h3>
                  <p className="text-[#063955]/70 mb-4 leading-relaxed">{service.description}</p>
                  
                  {/* WhatsApp and Email buttons for service cards */}
                  <div className="flex space-x-2 mb-4">
                    <a 
                      href={`https://wa.me/917383644844?text=Hi, I'm interested in ${service.title}. Can you provide more details?`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <a 
                      href={`mailto:signaturewtt@gmail.com?subject=${service.title} Inquiry&body=Hi, I'm interested in ${service.title}. Please provide more information about pricing and availability.`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                      <span>Email</span>
                    </a>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] hover:from-[#F6FEFE] hover:to-[#F8F4E5] text-[#063955] px-6 py-3 rounded-full font-bold transition-all duration-300 transform group-hover:scale-105 shadow-md">
                    BOOK NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hajj & Umrah Section */}
      <section id="hajj-umrah" className="pt-4 pb-12 bg-gradient-to-b from-white to-[#F8F4E5]/50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible.hajj ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-0.5 bg-[#F8F4E5] mr-4"></div>
              <img src="/logo.png" alt="Signature world tour and travels" className="h-12 w-auto opacity-80" />
              <div className="w-16 h-0.5 bg-[#F8F4E5] ml-4"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#063955] mb-4">
              Hajj & Umrah Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Embark on your spiritual journey with our premium Hajj and Umrah packages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hajjUmrahServices.map((service, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-2xl bg-white border border-[#F8F4E5]/20 shadow-lg hover:shadow-2xl hover:border-[#F8F4E5]/40 transition-all duration-500 transform hover:-translate-y-2 ${isVisible['hajj-umrah'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-signature-navy/70 via-signature-navy/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#F8F4E5] rounded-full flex items-center justify-center">
                    <span className="text-[#063955] font-bold text-sm">🕌</span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-lg font-bold">{service.price}</div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-b from-white to-[#F8F4E5]/30">
                  <h3 className="text-2xl font-bold text-[#063955] mb-3 group-hover:text-[#F8F4E5] transition-colors duration-300">{service.title}</h3>
                  <p className="text-[#063955]/70 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-[#063955]/60">
                      <div className="w-1.5 h-1.5 bg-[#F8F4E5] rounded-full"></div>
                      <span>Visa Processing Included</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-[#063955]/60">
                      <div className="w-1.5 h-1.5 bg-[#F8F4E5] rounded-full"></div>
                      <span>24/7 Local Support</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-[#063955]/60">
                      <div className="w-1.5 h-1.5 bg-[#F8F4E5] rounded-full"></div>
                      <span>Religious Guide Included</span>
                    </div>
                  </div>
                  
                  {/* WhatsApp and Email buttons for Hajj & Umrah cards */}
                  <div className="flex space-x-2 mb-4">
                    <a 
                      href={`https://wa.me/917383644844?text=Hi, I'm interested in your ${service.title} package. Can you provide more details about pricing and itinerary?`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </a>
                    <a 
                      href={`mailto:signaturewtt@gmail.com?subject=${service.title} Package Inquiry&body=Hi, I'm interested in your ${service.title} package (${service.price}). Please provide detailed information about the itinerary, accommodation, and booking process.`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                      <span className="text-xs">Email</span>
                    </a>
                  </div>
                  
                  <button className={`w-full ${service.buttonColor} text-white px-6 py-3 rounded-full font-bold transition-all duration-300 transform group-hover:scale-105 shadow-md`}>
                    VIEW PACKAGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-signature-navy via-signature-blue to-signature-navy relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[#F8F4E5] rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-[#F6FEFE] rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-[#F8F4E5] rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`text-white transition-all duration-1000 ${isVisible.contact ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Plan Your Perfect Trip
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Let us help you create unforgettable memories. Fill out the form and our travel experts will get back to you with personalized recommendations.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-center space-x-4 group hover:bg-white/10 p-3 rounded-lg transition-colors duration-300">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#063955] text-xl font-bold">📞</span>
                  </div>
                  <div>
                    <div className="text-[#F8F4E5] font-semibold text-sm">Call Us</div>
                    <span className="text-lg">+91 7383644844</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group hover:bg-white/10 p-3 rounded-lg transition-colors duration-300">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#063955] text-xl font-bold">📧</span>
                  </div>
                  <div>
                    <div className="text-[#F8F4E5] font-semibold text-sm">Email Us</div>
                    <span className="text-lg">signaturewtt@gmail.com</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group hover:bg-white/10 p-3 rounded-lg transition-colors duration-300">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#063955] text-xl font-bold">📍</span>
                  </div>
                  <div>
                    <div className="text-[#F8F4E5] font-semibold text-sm">Visit Us</div>
                    <span className="text-lg">3rd Floor Aazan complex Opp.Abu bhai kapadwala, Juhapura, Ahmedabad Gujarat 380051</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group hover:bg-white/10 p-3 rounded-lg transition-colors duration-300">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[#063955] text-xl font-bold">🏢</span>
                  </div>
                  <div>
                    <div className="text-[#F8F4E5] font-semibold text-sm">Registered Office</div>
                    <span className="text-base">26 Noor-e-Mohmadi society Dholka, Ahmedabad Gujarat 382225</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://wa.me/917383644844?text=Hi! I'm interested in your travel packages. Can you help me plan my trip?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span>💬</span>
                  <span className="font-semibold">WhatsApp Us</span>
                </a>
                <a 
                  href="mailto:signaturewtt@gmail.com?subject=Travel Inquiry&body=Hi! I would like to inquire about your travel packages. Please contact me."
                  className="bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] hover:from-[#F6FEFE] hover:to-[#F8F4E5] text-[#063955] px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span>📧</span>
                  <span className="font-semibold">Email Us</span>
                </a>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-white to-[#F8F4E5]/50 rounded-2xl p-8 shadow-2xl border border-[#F8F4E5]/20 transition-all duration-1000 ${isVisible.contact ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="text-center mb-6">
                <img src="/logo.png" alt="Signature world tour and travels" className="h-10 w-auto mx-auto mb-4 opacity-60" />
                <h3 className="text-2xl font-bold text-[#063955]">Send us an Enquiry</h3>
                <div className="w-16 h-0.5 bg-[#F8F4E5] mx-auto mt-2"></div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-signature-navy/20 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-[#F8F4E5] bg-white/80 transition-all duration-300"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-signature-navy/20 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-[#F8F4E5] bg-white/80 transition-all duration-300"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-signature-navy/20 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-[#F8F4E5] bg-white/80 transition-all duration-300"
                  required
                />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-signature-navy/20 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-[#F8F4E5] bg-white/80 transition-all duration-300"
                  required
                >
                  <option value="">Select Service</option>
                  <option value="flight">Flight Booking</option>
                  <option value="train">Train Booking</option>
                  <option value="bus">Bus Booking</option>
                  <option value="hotel">Hotel Booking</option>
                  <option value="cruise">Cruise Booking</option>
                </select>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-signature-navy/20 rounded-lg focus:ring-2 focus:ring-[#063955] focus:border-[#F8F4E5] bg-white/80 transition-all duration-300"
                ></textarea>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#F8F4E5] hover:bg-[#F6FEFE] disabled:opacity-50 disabled:cursor-not-allowed text-[#063955] py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-signature-navy"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Carousel Section */}
      <section className="py-16 bg-gradient-to-r from-signature-navy via-signature-blue to-signature-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <img src="/logo.png" alt="Signature world tour and travels" className="h-12 w-auto mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Certifications & Accreditations
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Trusted by thousands of travelers worldwide with verified certifications and industry recognition
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Main Carousel */}
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentCertificate * 100}%)` }}
              >
                {certificates.map((cert, index) => (
                  <div key={cert.id} className="w-full flex-shrink-0">
                    <div className="bg-white rounded-2xl p-4 mx-4 shadow-2xl">
                      <img 
                        src={cert.image} 
                        alt={`Certificate ${cert.id}`}
                        className="w-full h-80 object-contain rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentCertificate((prev) => (prev - 1 + certificates.length) % certificates.length)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 bg-[#F8F4E5] hover:bg-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group"
            >
              <span className="text-[#063955] text-xl group-hover:scale-110 transition-transform duration-300">‹</span>
            </button>
            <button 
              onClick={() => setCurrentCertificate((prev) => (prev + 1) % certificates.length)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 bg-[#F8F4E5] hover:bg-[#F6FEFE] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group"
            >
              <span className="text-[#063955] text-xl group-hover:scale-110 transition-transform duration-300">›</span>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {certificates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCertificate(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentCertificate === index 
                      ? 'bg-[#F8F4E5] scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-signature-navy to-signature-blue text-white py-16 relative overflow-hidden">
        {/* Footer Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 right-10 w-40 h-40 border border-[#F8F4E5] rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-28 h-28 border border-[#F6FEFE] rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="Signature world tour and travels" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-300">
                Your trusted partner for unforgettable travel experiences. We create memories that last a lifetime.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://wa.me/917383644844?text=Hello, I'm interested in your travel services"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-300"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                <a 
                  href="mailto:signaturewtt@gmail.com?subject=Travel Inquiry&body=Hello, I'm interested in your travel services."
                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300"
                  title="Email"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="mailto:signaturewtt@gmail.com?subject=Travel Inquiry&body=Hello, I'm interested in your travel services." className="w-10 h-10 bg-[#2B4B5C] hover:bg-[#F8F4E5] rounded-full flex items-center justify-center transition-colors duration-300">📧</a>
                <a href="#" className="w-10 h-10 bg-[#2B4B5C] hover:bg-[#F8F4E5] rounded-full flex items-center justify-center transition-colors duration-300">📷</a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-[#F8F4E5] border-b border-[#F8F4E5]/30 pb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Home</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Services</a></li>
                <li><a href="#hajj-umrah" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Hajj & Umrah</a></li>
                <li><Link to="/about" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">About Us</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Privacy Policy</Link></li>
                <li><a href="#contact" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-[#F8F4E5] border-b border-[#F8F4E5]/30 pb-2">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Flight Booking</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Train Booking</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Bus Booking</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Hotel Booking</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#F8F4E5] transition-colors duration-300">Cruise Booking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-4 text-[#F8F4E5] border-b border-[#F8F4E5]/30 pb-2">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+91 7383644844</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>signaturewtt@gmail.com</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>3rd Floor Aazan complex Opp.Abu bhai kapadwala, Juhapura, Ahmedabad Gujarat 380051</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🏢</span>
                  <span className="text-sm">Registered Office: 26 Noor-e-Mohmadi society Dholka, Ahmedabad Gujarat 382225</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F8F4E5]/30 pt-8 text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Signature world tour and travels" className="h-8 w-auto opacity-70" />
            </div>
            <p className="text-gray-300">&copy; 2025 <span className="text-[#F8F4E5] font-semibold">Signature world tour and travels</span>. All rights reserved.</p>
            <p className="text-[#F8F4E5]/60 text-sm mt-2">Your trusted partner for unforgettable travel experiences</p>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#063955]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#063955] text-2xl">✓</span>
              </div>
              <img src="/logo.png" alt="Signature world tour and travels" className="h-10 w-auto mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold text-[#063955] mb-4">
                Thank You for Your Enquiry!
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We have received your travel enquiry successfully. Our expert team will review your requirements and get back to you within 24 hours with personalized travel recommendations.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-[#063955]">
                  <div className="w-2 h-2 bg-[#F8F4E5] rounded-full"></div>
                  <span>Expert consultation within 24 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-[#063955]">
                  <div className="w-2 h-2 bg-[#F8F4E5] rounded-full"></div>
                  <span>Personalized travel packages</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-[#063955]">
                  <div className="w-2 h-2 bg-[#F8F4E5] rounded-full"></div>
                  <span>Best price guarantee</span>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-[#F8F4E5] to-[#F6FEFE] hover:from-[#F6FEFE] hover:to-[#F8F4E5] text-[#063955] py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Protected Route Component
function ProtectedAdminRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for test mode first
    if (window.location.hash === '#admin-dashboard') {
      setUser({ email: 'admin@test.com' });
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // SECURE: Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'admin', currentUser.uid));
          if (adminDoc.exists() && adminDoc.data().role === 'admin') {
            console.log('🔐 Admin access verified');
            setUser(currentUser);
            setIsAdmin(true);
          } else {
            console.log('🚨 Unauthorized access attempt blocked');
            setUser(null);
            setIsAdmin(false);
            await signOut(auth);
          }
        } catch (error) {
          console.error('🚨 Security check failed:', error);
          setUser(null);
          setIsAdmin(false);
          await signOut(auth);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen brand-pattern flex items-center justify-center">
        <div className="flex items-center space-x-3 text-[#063955]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F8F4E5] border-t-transparent"></div>
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminEnquiries />;
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
