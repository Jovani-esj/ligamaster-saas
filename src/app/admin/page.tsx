'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
export default function SuperAdminPage() {
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');

  const crearLiga = async () => {
    const { data, error } = await supabase
      .from('ligas')
      .insert([{ 
        nombre_liga: nombre, 
        slug: slug, 
        estatus_pago: true, // Por ahora activamos manual para pruebas
        plan: 'Bronce' 
      }]);

    if (error) alert('Error: ' + error.message);
    else alert('¡Liga creada con éxito!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel SuperAdmin - Alta de Ligas</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        <input 
          placeholder="Nombre de la Liga" 
          className="border p-2 rounded text-black"
          onChange={(e) => setNombre(e.target.value)}
        />
        <input 
          placeholder="URL única (slug)" 
          className="border p-2 rounded text-black"
          onChange={(e) => setSlug(e.target.value)}
        />
        <button 
          onClick={crearLiga}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Dar de Alta Liga
        </button>
      </div>
    </div>
  );
}