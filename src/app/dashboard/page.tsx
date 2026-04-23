'use client';

import DynamicDashboard from '@/components/dashboard/DynamicDashboard';
import RouteProtection from '@/components/auth/RouteProtection';

// Roles que pueden acceder al dashboard
const DASHBOARD_ALLOWED_ROLES = [
  'superadmin',
  'adminadmin', 
  'admin_liga',
  'capitan_equipo',
  'usuario'
];

export default function DashboardPage() {
  return (
    <RouteProtection 
      allowedRoles={DASHBOARD_ALLOWED_ROLES}
      requireAuth={true}
    >
      <DynamicDashboard />
    </RouteProtection>
  );
}
