import { useState, useEffect } from 'react';
import { getLeads } from '../services/leadService';

export function useLeadStats() {
  const [stats, setStats] = useState({
    total: 0,
    newLeads: 0,
    consulting: 0,
    converted: 0,
    conversionRate: 0,
    sourceStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads()
      .then((leads) => {
        const total = leads.length;
        const newLeads = leads.filter(l => l.status === 'NEW').length;
        const consulting = leads.filter(l => l.status === 'CONSULTING').length;
        const converted = leads.filter(l => l.status === 'CONVERTED_SUCCESS' || l.status === 'ADMITTED').length;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        // Group by source
        const sourceMap = {};
        leads.forEach(l => {
          sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
        });
        const sourceStats = Object.keys(sourceMap).map(key => ({
          name: key,
          value: sourceMap[key]
        }));

        setStats({
          total,
          newLeads,
          consulting,
          converted,
          conversionRate,
          sourceStats
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
