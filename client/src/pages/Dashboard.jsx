export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">My Tasks</h1>

      <button className="mb-4 px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Add new task"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Add
        </button>
      </div>
    </div>
  );
}
