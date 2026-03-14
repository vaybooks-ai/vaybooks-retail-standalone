'use client';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Enter company name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2" placeholder="Enter email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input type="tel" className="w-full border rounded-lg px-3 py-2" placeholder="Enter phone number" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Business Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select className="w-full border rounded-lg px-3 py-2">
                <option>USD</option>
                <option>EUR</option>
                <option>INR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Enter tax rate" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Settings
          </button>
          <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
