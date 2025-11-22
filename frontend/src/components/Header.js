import React from 'react';

const Header = ({ 
  searchQuery, setSearchQuery, 
  categoryFilter, setCategoryFilter, categories,
  onAddClick, onImportClick, onExportClick, onLogout 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Pro</h1>
      
      {/* SEARCH & FILTER */}
      <div className="flex gap-2 flex-1 max-w-lg">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2 items-center">
        <button onClick={onAddClick} className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition">
          ➕ Add
        </button>
        <button onClick={onImportClick} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition">
          📂 Import
        </button>
        <button onClick={onExportClick} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition">
          ⬇️ Export
        </button>
        <button onClick={onLogout} className="text-red-500 hover:text-red-700 font-bold ml-2 border border-red-200 px-3 py-2 rounded">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;