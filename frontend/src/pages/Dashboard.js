import React, { useState, useEffect } from 'react';
import API from '../api'; // Uses the interceptor for Tokens
import Header from '../components/Header';
import ProductTable from '../components/ProductTable';
import Sidebar from '../components/Sidebar';
import ProductForm from '../components/ProductForm';

const Dashboard = () => {
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);
  
  // UI Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Data for Sidebars
  const [historyLogs, setHistoryLogs] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState('');

  // Load Data
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [products, searchQuery, categoryFilter]);

  // --- API ACTIONS ---
  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
      const uniqueCats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const filterData = () => {
    let result = products;
    if (searchQuery) {
       result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    setFilteredProducts(result);
  };

  // --- HANDLERS ---
  const handleAddProduct = async (newProduct) => {
    try {
      await API.post('/products', newProduct);
      alert("Product Added!");
      setIsAddOpen(false);
      fetchProducts();
    } catch (err) { alert("Failed to add (Check duplicates)"); }
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
      await API.put(`/products/${id}`, updatedData);
      fetchProducts();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await API.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const handleViewHistory = async (id, name) => {
    try {
      const { data } = await API.get(`/products/${id}/history`);
      setHistoryLogs(data);
      setSelectedProductName(name);
      setIsSidebarOpen(true);
    } catch (err) { console.error(err); }
  };

  const handleImport = () => document.getElementById('fileInput').click();
  
  const handleFileChange = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await API.post('/products/import', formData);
      alert("Import Successful!");
      fetchProducts();
    } catch (err) { alert("Import failed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hidden Import Input */}
        <input type="file" id="fileInput" className="hidden" accept=".csv" onChange={handleFileChange} />

        <Header 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
          categories={categories}
          onAddClick={() => setIsAddOpen(!isAddOpen)}
          onImportClick={handleImport}
          onExportClick={() => window.open('http://localhost:5000/api/products/export')}
          onLogout={handleLogout}
        />

        {isAddOpen && (
          <ProductForm 
            onSubmit={handleAddProduct} 
            onClose={() => setIsAddOpen(false)} 
          />
        )}

        <ProductTable 
          products={filteredProducts}
          onEdit={() => {}} // Handled inside table via inline state
          onSaveEdit={handleSaveEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
        />
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        logs={historyLogs} 
        productName={selectedProductName}
      />
    </div>
  );
};

export default Dashboard;