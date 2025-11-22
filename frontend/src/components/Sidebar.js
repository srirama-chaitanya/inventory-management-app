import React from 'react';

const Sidebar = ({ isOpen, onClose, logs, productName }) => {
  return (
    <>
      {/* Slide-in Panel */}
      {/* FIX: w-full md:w-96 ensures it fits small screens perfectly */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50 overflow-y-auto`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Audit Log</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          
          <h3 className="text-md font-semibold text-indigo-600 mb-4">{productName}</h3>

          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No history found.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="text-xs text-gray-400">{new Date(log.change_date).toLocaleString()}</div>
                  <div className="text-sm font-medium text-gray-800">
                     <span className="text-red-500 line-through">{log.old_quantity}</span> 
                     {' '} ➝ {' '}
                     <span className="text-green-600 font-bold">{log.new_quantity}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Action: {log.action_type || 'Update'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Dark Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black opacity-25 z-40"
        ></div>
      )}
    </>
  );
};

export default Sidebar;