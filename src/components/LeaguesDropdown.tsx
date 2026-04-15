'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronDown } from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
}

export default function LeaguesDropdown() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLigas = async () => {
      try {
        const response = await fetch('/api/ligas');
        const result = await response.json();
        
        if (result.data) {
          setLigas(result.data);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLigas();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <Trophy className="h-4 w-4" />
        <span>Ligas</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Cargando...</div>
            ) : ligas.length > 0 ? (
              ligas.map((liga) => (
                <Link
                  key={liga.id}
                  href={`/liga/${liga.slug}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {liga.nombre_liga}
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No hay ligas disponibles</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
