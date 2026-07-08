import { useState, useEffect } from 'react';
import { getClassesWithCapacity, getEnrollments } from '../services/enrollmentService';

export function useEnrollmentStats() {
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    totalClasses: 0,
    fullClassesCount: 0,
    averageOccupancy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClassesWithCapacity(), getEnrollments()])
      .then(([classes, enrollments]) => {
        const totalClasses = classes.length;
        const totalEnrollments = enrollments.length;
        const fullClassesCount = classes.filter(c => c.currentOccupancy >= c.maxCapacity).length;
        
        let sumOccupancy = 0;
        classes.forEach(c => sumOccupancy += c.currentOccupancy);
        const averageOccupancy = totalClasses > 0 ? Math.round((sumOccupancy / totalClasses)) : 0;

        setStats({
          totalEnrollments,
          totalClasses,
          fullClassesCount,
          averageOccupancy
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
