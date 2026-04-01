import React from 'react';
import { Building } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-bcp-brown">Partners Management</h1>
        <p className="text-grey-600 mt-2">Manage enrollment partners and their details</p>
      </div>

      <div className="card-base p-8 text-center">
        <div className="flex justify-center mb-4">
          <Building className="w-16 h-16 text-bcp-orange opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-bcp-brown mb-2">Coming Soon</h2>
        <p className="text-grey-600">Partner management interface is under development.</p>
        <p className="text-grey-600 mt-2 text-sm">Features: View partners, create, edit, delete, track status</p>
      </div>
    </div>
  );
}
