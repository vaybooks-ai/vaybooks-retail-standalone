'use client';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Generate Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Sales Report</h3>
          <p className="text-gray-600">View sales performance and trends</p>
        </div>
        <div className="bg-white rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Inventory Report</h3>
          <p className="text-gray-600">Stock levels and movements</p>
        </div>
        <div className="bg-white rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Customer Report</h3>
          <p className="text-gray-600">Customer activity and purchases</p>
        </div>
        <div className="bg-white rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Financial Report</h3>
          <p className="text-gray-600">Revenue and expense analysis</p>
        </div>
      </div>
    </div>
  );
}
