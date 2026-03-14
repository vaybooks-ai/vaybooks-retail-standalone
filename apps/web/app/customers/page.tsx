'use client';

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Customer
        </button>
      </div>
      
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No customers found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
