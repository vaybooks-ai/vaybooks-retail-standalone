'use client';

export default function SalesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sales</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          New Sale
        </button>
      </div>
      
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Invoice #</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No sales found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
