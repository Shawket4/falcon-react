import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Shield,
  Search,
  ChevronDown,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit state
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Create new user state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    permission: 1,
    password: '',
    confirmPassword: ''
  });
  
  // Search and mobile state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getPermissionLabel = (permission) => {
    const permissions = {
      1: 'User',
      2: 'Manager',
      3: 'Admin',
      4: 'Super Admin'
    };
    return permissions[permission] || 'Unknown';
  };

  const getPermissionColor = (permission) => {
    const colors = {
      1: 'bg-blue-100 text-blue-700 border-blue-200',
      2: 'bg-green-100 text-green-700 border-green-200',
      3: 'bg-purple-100 text-purple-700 border-purple-200',
      4: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[permission] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-clear success messages
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setEditingUser(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (createSuccess) {
      const timer = setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateForm(false);
        resetForm();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
        setShowDeleteModal(false);
        setUserToDelete(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);
  
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get('/api/FetchUsers');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.permission >= 3).length;
    const managers = users.filter(u => u.permission === 2).length;
    const regularUsers = users.filter(u => u.permission === 1).length;

    return { total, admins, managers, regularUsers };
  }, [users]);
  
  // Start editing a user
  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      permission: user.permission || 1,
      password: '',
      confirmPassword: ''
    });
    setSaveSuccess(false);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingUser(null);
    setSaveSuccess(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      permission: 1,
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  
  // Save user updates
  const saveUser = async () => {
    if (!editingUser) return;
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const updateData = {
        id: editingUser.ID,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        permission: formData.permission
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await apiClient.patch('/api/UpdateUser', updateData);
      
      if (response.status === 200) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.ID === editingUser.ID 
              ? { ...user, ...updateData }
              : user
          )
        );
        
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  // Create new user
  const createUser = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setCreating(true);
    setError('');
    
    try {
      const newUser = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        permission: formData.permission.toString(),
        password: formData.password
      };

      const response = await apiClient.post('/api/RegisterUser', newUser);
      
      if (response.status === 200) {
        // Add the new user to the list
        setUsers(prevUsers => [...prevUsers, response.data]);
        setCreateSuccess(true);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // Toggle card expansion (mobile only)
  const toggleCardExpansion = (userId) => {
    if (!isMobile) return;
    
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteSuccess(false);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteSuccess(false);
  };

  // Delete user
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    setError('');
    
    try {
      const response = await apiClient.delete(`/api/DeleteUser/${userToDelete.ID}`);
      
      if (response.status === 200) {
        // Remove the user from the list
        setUsers(prevUsers => prevUsers.filter(user => user.ID !== userToDelete.ID));
        setDeleteSuccess(true);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-solid rounded-full animate-pulse"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-600 font-medium mt-6 text-lg">Loading users...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex items-center mb-4 lg:mb-0">
              <button 
                onClick={() => navigate('/')} 
                className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  User Management
                </h1>
                <p className="text-gray-600 mt-1">Manage system users and permissions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Add User</span>
              </button>
              
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className={`flex items-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
                }`}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-gray-700">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-xl font-bold text-gray-900">{stats.regularUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-xl font-bold text-gray-900">{stats.managers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users
              {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
            </p>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permission Level</label>
                    <select
                      value={formData.permission}
                      onChange={(e) => setFormData({...formData, permission: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>User</option>
                      <option value={2}>Manager</option>
                      <option value={3}>Admin</option>
                      <option value={4}>Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {createSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center mt-4 animate-fade-in">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700 font-medium">User created successfully!</span>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={createUser}
                    disabled={creating}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  >
                    {creating ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                      <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                      You are about to delete user <span className="font-semibold">{userToDelete?.name}</span> ({userToDelete?.email}).
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      This will permanently remove their account and all associated data.
                    </p>
                  </div>
                </div>

                {deleteSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center mb-4 animate-fade-in">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700 font-medium">User deleted successfully!</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={deleteUser}
                    disabled={deleting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  >
                    {deleting ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete User'}
                  </button>
                  
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const isExpanded = expandedCards.has(user.ID);
            const shouldShowContent = !isMobile || isExpanded;
            
            return (
              <div 
                key={user.ID} 
                className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg ${
                  !isMobile ? 'hover:scale-[1.02]' : ''
                } ${
                  editingUser?.ID === user.ID ? 'ring-2 ring-blue-500 border-blue-200 shadow-lg scale-[1.02]' : 'border-gray-200/50'
                }`}
              >
                {/* User Header */}
                <div 
                  className={`rounded-t-xl p-4 bg-white border-b border-gray-100 ${
                    isMobile ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => toggleCardExpansion(user.ID)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPermissionColor(user.permission)}`}>
                        {getPermissionLabel(user.permission)}
                      </span>
                      {isMobile && (
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* User Details - Collapsible on mobile */}
                {shouldShowContent && (
                  <div className="p-5">
                    {editingUser?.ID === user.ID ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Permission Level</label>
                          <select
                            value={formData.permission}
                            onChange={(e) => setFormData({...formData, permission: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={1}>User</option>
                            <option value={2}>Manager</option>
                            <option value={3}>Admin</option>
                            <option value={4}>Super Admin</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {formData.password && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {saveSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center animate-fade-in">
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-700 font-medium">User updated successfully!</span>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={saveUser}
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                          >
                            {saving ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* User Information */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-500" />
                              Contact Information
                            </h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEdit(user)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => showDeleteConfirmation(user)}
                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Permission Information */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-gray-500" />
                            Permission Level
                          </h4>
                          
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPermissionColor(user.permission)}`}>
                                {getPermissionLabel(user.permission)}
                              </span>
                              <span className="text-xs text-gray-500">Level {user.permission}</span>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        {user.created_at && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              Account Information
                            </h4>
                            
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  Created: {formatDate(user.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No users found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'No users match your current search criteria. Try adjusting your search terms.'
                : 'No users are currently registered in the system. Add some users to get started.'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First User
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement; 