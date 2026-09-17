import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getTable, updateRecord } from '../../lib/localDb';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { Shield, Users } from 'lucide-react';

export default function UserManagementPage() {
  const toast = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadProfiles(); }, [search, roleFilter]);

  const loadProfiles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      let data = getTable('profiles');
      
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(p => p.full_name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s));
      }
      if (roleFilter) {
        data = data.filter(p => p.role === roleFilter);
      }
      
      setProfiles(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      updateRecord('profiles', userId, { role: newRole });
      toast.success('User role updated');
      loadProfiles();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    operator: 'bg-blue-100 text-blue-700',
    pilot: 'bg-green-100 text-green-700',
  };

  const roleLabels = { admin: 'Administrator', operator: 'Flight Operator', pilot: 'Pilot' };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="page-container">
      <PageHeader title="User Management" subtitle={`${profiles.length} registered users`} />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by name or email..."
        filters={[{
          key: 'role', label: 'All Roles', value: roleFilter, onChange: setRoleFilter,
          options: [
            { value: 'admin', label: 'Administrator' },
            { value: 'operator', label: 'Flight Operator' },
            { value: 'pilot', label: 'Pilot' },
          ]
        }]}
        className="mb-4"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-gray-900">{p.full_name}</td>
                    <td className="text-gray-600">{p.email}</td>
                    <td>
                      <span className={`badge ${roleColors[p.role]}`}>
                        <Shield size={12} className="mr-1" />
                        {roleLabels[p.role]}
                      </span>
                    </td>
                    <td className="text-gray-500">{formatDate(p.created_at)}</td>
                    <td className="text-right">
                      <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="form-input py-1 px-2 text-xs w-auto inline-block"
                      >
                        <option value="admin">Administrator</option>
                        <option value="operator">Flight Operator</option>
                        <option value="pilot">Pilot</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
