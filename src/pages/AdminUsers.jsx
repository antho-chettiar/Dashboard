import { useState } from 'react'
import { UserPlus, Shield, Eye, Trash2, Search } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'

const INITIAL_USERS = [
  { id: 1, name: 'Manas Mohan',    email: 'manas@digitalabs.com',         role: 'admin',  status: 'active',   joined: '2025-01-10' },
  { id: 2, name: 'Anthony Chettiar',   email: 'antho@client.com',       role: 'admin', status: 'active',   joined: '2025-02-14' },
  { id: 3, name: 'Prateek Advani',      email: 'prateek@client.com',     role: 'viewer',  status: 'active',   joined: '2025-03-01' },
  { id: 4, name: 'Altamash Khan',    email: 'altamash@client.com',       role: 'viewer', status: 'inactive', joined: '2025-01-22' },
  { id: 5, name: 'Ayaz Shaikh',     email: 'ayaz@client.com',       role: 'viewer', status: 'active',   joined: '2025-03-05' },
]

function AdminUsers() {
  const [users, setUsers]         = useState(INITIAL_USERS)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser]     = useState({ name: '', email: '', role: 'viewer' })

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleAddUser() {
    if (!newUser.name || !newUser.email) return
    setUsers(prev => [...prev, {
      id:      prev.length + 1,
      name:    newUser.name,
      email:   newUser.email,
      role:    newUser.role,
      status:  'active',
      joined:  new Date().toISOString().split('T')[0],
    }])
    setNewUser({ name: '', email: '', role: 'viewer' })
    setShowModal(false)
  }

  function toggleStatus(id) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))
  }

  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.filter(u => u.status === 'active').length} active users`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-sm"
        >
          <UserPlus size={15} />
          Add User
        </button>
      </PageHeader>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-6 shadow-sm max-w-md">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',    value: users.length,                                          bg: 'bg-blue-50',   text: 'text-brand-blue'   },
          { label: 'Active',         value: users.filter(u => u.status === 'active').length,       bg: 'bg-green-50',  text: 'text-green-600'    },
          { label: 'Admins',         value: users.filter(u => u.role === 'admin').length,          bg: 'bg-purple-50', text: 'text-purple-600'   },
          { label: 'Viewers',        value: users.filter(u => u.role === 'viewer').length,         bg: 'bg-orange-50', text: 'text-brand-orange' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-4 border border-white`}>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No users found" subtitle="Try adjusting your search" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? <Shield size={11} /> : <Eye size={11} />}
                      {user.role === 'admin' ? 'Admin' : 'Viewer'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-gray-400 text-xs">{user.joined}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-brand-blue hover:text-brand-blue transition"
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-brand-navy mb-4">Add New User</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={newUser.name}
                  onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. priya@company.com"
                  value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-blue transition bg-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 bg-brand-navy text-white text-sm py-2.5 rounded-lg hover:bg-opacity-90 transition"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers