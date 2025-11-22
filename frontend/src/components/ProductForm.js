import React, { useState } from 'react';

const ProductForm = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({ name: '', category: '', brand: '', stock: '', unit: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', category: '', brand: '', stock: '', unit: '' }); // Clear after submit
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">Close</button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded" />
        <input required placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border p-2 rounded" />
        <input placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="border p-2 rounded" />
        <input required type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border p-2 rounded" />
        <input required placeholder="Unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="border p-2 rounded" />
        
        <button type="submit" className="col-span-2 md:col-span-5 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold">
          Save Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;