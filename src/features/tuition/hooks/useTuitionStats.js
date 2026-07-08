import { useState, useEffect } from 'react';
import { getInvoices } from '../services/tuitionService';

export function useTuitionStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    collectedRevenue: 0,
    debtRevenue: 0,
    totalInvoices: 0,
    paidCount: 0,
    unpaidCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then((invoices) => {
        let totalRevenue = 0;
        let collectedRevenue = 0;
        let debtRevenue = 0;
        const totalInvoices = invoices.length;
        
        const paidCount = invoices.filter(i => i.status === 'PAID').length;
        const unpaidCount = invoices.filter(i => i.status === 'UNPAID').length;
        const overdueCount = invoices.filter(i => i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID').length;

        invoices.forEach(i => {
          totalRevenue += i.amount;
          collectedRevenue += i.paidAmount;
          debtRevenue += (i.amount - i.paidAmount);
        });

        setStats({
          totalRevenue,
          collectedRevenue,
          debtRevenue,
          totalInvoices,
          paidCount,
          unpaidCount,
          overdueCount
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
