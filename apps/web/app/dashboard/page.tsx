'use client';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium text-gray-600">Inventory Value</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
      </div>
    </div>
  );
}
