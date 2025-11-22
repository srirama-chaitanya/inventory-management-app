import React, { useState } from 'react';

const ProductTable = ({ products, onEdit, onDelete, onViewHistory, onSaveEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditFormData(product);
  };

  const handleSave = () => {
    onSaveEdit(editingId, editFormData);
    setEditingId(null);
  };

  return (
    // FIX 1: overflow-x-auto allows the table to scroll sideways on phones
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">History</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              {editingId === product.id ? (
                // EDIT MODE
                <>
                  <td className="px-5 py-4"><input defaultValue={product.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="border p-1 w-full rounded"/></td>
                  <td className="px-5 py-4"><input defaultValue={product.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} className="border p-1 w-full rounded"/></td>
                  <td className="px-5 py-4"><input defaultValue={product.stock} type="number" onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})} className="border p-1 w-20 rounded"/></td>
                  <td className="px-5 py-4 text-gray-400">--</td>
                  <td className="px-5 py-4">
                    <button onClick={handleSave} className="text-green-600 font-bold mr-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
                  </td>
                </>
              ) : (
                // VIEW MODE
                <>
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.brand}</div>
                  </td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">
                    {/* FIX 2: Added explicit text status inside the bubble */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock} {product.unit} ({product.stock > 0 ? 'In Stock' : 'Out of Stock'})
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => onViewHistory(product.id, product.name)} className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold">
                      🕒 Logs
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;