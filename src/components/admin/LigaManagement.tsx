'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
  logo_url?: string;
  fecha_registro: string;
  fecha_vencimiento?: string;
  estatus_pago: boolean;
  plan: 'Bronce' | 'Plata' | 'Oro';
  contacto_email?: string;
  contacto_telefono?: string;
  activa: boolean;
}

interface FormData {
  nombre_liga: string;
  slug: string;
  descripcion: string;
  contacto_email: string;
  contacto_telefono: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
}

export default function LigaManagement() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingLiga, setEditingLiga] = useState<Liga | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre_liga: '',
    slug: '',
    descripcion: '',
    contacto_email: '',
    contacto_telefono: '',
    plan: 'Bronce'
  });

  useEffect(() => {
    fetchLigas();
  }, []);

  const fetchLigas = async () => {
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      setLigas(data || []);
    } catch (error) {
      console.error('Error fetching ligas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLiga) {
        // Actualizar liga existente
        const { error } = await supabase
          .from('ligas')
          .update(formData)
          .eq('id', editingLiga.id);

        if (error) throw error;
      } else {
        // Crear nueva liga
        const { error } = await supabase
          .from('ligas')
          .insert([{
            ...formData,
            estatus_pago: false, // Nueva liga inicia sin pago
            activa: true
          }]);

        if (error) throw error;
      }

      await fetchLigas();
      resetForm();
    } catch (error) {
      console.error('Error saving liga:', error);
      alert('Error al guardar la liga');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_liga: '',
      slug: '',
      descripcion: '',
      contacto_email: '',
      contacto_telefono: '',
      plan: 'Bronce'
    });
    setEditingLiga(null);
    setShowForm(false);
  };

  const handleEdit = (liga: Liga) => {
    setEditingLiga(liga);
    setFormData({
      nombre_liga: liga.nombre_liga,
      slug: liga.slug,
      descripcion: liga.descripcion || '',
      contacto_email: liga.contacto_email || '',
      contacto_telefono: liga.contacto_telefono || '',
      plan: liga.plan
    });
    setShowForm(true);
  };

  const toggleStatus = async (liga: Liga, field: 'estatus_pago' | 'activa') => {
    try {
      const { error } = await supabase
        .from('ligas')
        .update({ [field]: !liga[field] })
        .eq('id', liga.id);

      if (error) throw error;
      await fetchLigas();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estatus');
    }
  };

  const deleteLiga = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta liga?')) return;
    
    try {
      const { error } = await supabase
        .from('ligas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLigas();
    } catch (error) {
      console.error('Error deleting liga:', error);
      alert('Error al eliminar la liga');
    }
  };

  const filteredLigas = ligas.filter(liga => {
    const matchesSearch = liga.nombre_liga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liga.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'todos' || liga.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return <div className="p-8">Cargando ligas...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ligas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Liga
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos los planes</option>
            <option value="Bronce">Bronce</option>
            <option value="Plata">Plata</option>
            <option value="Oro">Oro</option>
          </select>
        </div>
      </div>

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLiga ? 'Editar Liga' : 'Nueva Liga'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Liga
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_liga}
                    onChange={(e) => setFormData({...formData, nombre_liga: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL única)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({...formData, contacto_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.contacto_telefono}
                    onChange={(e) => setFormData({...formData, contacto_telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value as 'Bronce' | 'Plata' | 'Oro'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bronce">Bronce - $100/mes</option>
                  <option value="Plata">Plata - $200/mes</option>
                  <option value="Oro">Oro - $500/mes</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingLiga ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de ligas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estatus Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLigas.map((liga) => (
                <tr key={liga.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{liga.nombre_liga}</div>
                      <div className="text-sm text-gray-500">/{liga.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      liga.plan === 'Oro' ? 'bg-yellow-100 text-yellow-800' :
                      liga.plan === 'Plata' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {liga.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(liga, 'estatus_pago')}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        liga.estatus_pago 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {liga.estatus_pago ? 'Pagado' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(liga, 'activa')}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        liga.activa 
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {liga.activa ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(liga.fecha_registro).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(liga)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteLiga(liga.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
