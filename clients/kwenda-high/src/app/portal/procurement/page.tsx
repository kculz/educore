'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';
import { getProcurementDashboard } from '@/lib/api';
import { ShoppingCart, FileText, PackageCheck, Users, FileCheck, Truck, Loader2, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

type DashboardData = {
  totalPoValue: number;
  openPoCount: number;
  pendingPrCount: number;
  activeSupplierCount: number;
  quotationCount: number;
  contractCount: number;
  overduePoCount: number;
  prConversionRate: number;
};

export default function ProcurementDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = getAccessToken();
      if (!token) { setError('Not authenticated'); setLoading(false); return; }
      try {
        const res = await getProcurementDashboard(token) as DashboardData;
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load procurement dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatKES(val?: number) {
    return `KES ${(val ?? 0).toLocaleString('en-KE')}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Procurement Overview</h1>
          <p className="text-white/40 text-xs mt-1">Manage purchase requests, orders, suppliers, and contracts.</p>
        </div>
        <Link
          href="/portal/procurement/requests"
          className="px-5 py-2.5 rounded-xl font-semibold gold-gradient text-xs hover:opacity-90 transition-opacity"
          style={{ color: '#0a1628' }}
        >
          + New Purchase Request
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-gold animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-navy-800 rounded-2xl border border-white/5 p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between text-white/40 text-xs mb-2">
                <span>Total PO Commitment</span>
                <DollarSign size={16} className="text-gold" />
              </div>
              <p className="font-serif text-2xl font-bold text-gold">{formatKES(data.totalPoValue)}</p>
              <p className="text-white/30 text-[10px] mt-1">{data.openPoCount} active purchase orders</p>
            </div>

            <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between text-white/40 text-xs mb-2">
                <span>Pending Requests</span>
                <FileText size={16} className="text-blue-400" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">{data.pendingPrCount}</p>
              <p className="text-white/30 text-[10px] mt-1">Awaiting approval</p>
            </div>

            <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between text-white/40 text-xs mb-2">
                <span>Active Suppliers</span>
                <Users size={16} className="text-green-400" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">{data.activeSupplierCount}</p>
              <p className="text-white/30 text-[10px] mt-1">{data.contractCount} active contracts</p>
            </div>

            <div className="bg-navy-800 rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between text-white/40 text-xs mb-2">
                <span>Conversion Rate</span>
                <TrendingUp size={16} className="text-purple-400" />
              </div>
              <p className="font-serif text-2xl font-bold text-white">{(data.prConversionRate ?? 0).toFixed(0)}%</p>
              <p className="text-white/30 text-[10px] mt-1">PR to PO fulfillment</p>
            </div>
          </div>

          {/* Module Navigation Grid */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Procurement Modules</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { href: '/portal/procurement/requests', title: 'Purchase Requests', desc: 'Create, review, and approve departmental requisitions.', icon: FileText, count: `${data.pendingPrCount} Pending` },
                { href: '/portal/procurement/orders', title: 'Purchase Orders', desc: 'Issue purchase orders and track expected delivery dates.', icon: PackageCheck, count: `${data.openPoCount} Active` },
                { href: '/portal/procurement/suppliers', title: 'Suppliers Directory', desc: 'Manage vetted vendor profiles and ratings.', icon: Users, count: `${data.activeSupplierCount} Active` },
                { href: '/portal/procurement/quotations', title: 'Quotations', desc: 'Compare competitive bids and accept quotes.', icon: FileText, count: `${data.quotationCount} Quotes` },
                { href: '/portal/procurement/contracts', title: 'Contracts', desc: 'Monitor long-term vendor agreements and terms.', icon: FileCheck, count: `${data.contractCount} Contracts` },
                { href: '/portal/procurement/grns', title: 'Goods Received (GRN)', desc: 'Record goods receipt notes against purchase orders.', icon: Truck, count: 'Deliveries' },
              ].map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="bg-navy-800 rounded-2xl p-6 border border-white/5 hover:border-gold/30 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-navy-900 group-hover:scale-105 transition-transform" style={{ color: '#0a1628' }}>
                      <mod.icon size={20} />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gold/10 text-gold">
                      {mod.count}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-gold transition-colors">{mod.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
