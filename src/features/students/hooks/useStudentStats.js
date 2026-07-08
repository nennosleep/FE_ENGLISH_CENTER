import { useState, useEffect } from 'react';
import { getStudents } from '../services/studentService';

export function useStudentStats() {
  const [stats, setStats] = useState({
    total: 0,
    studying: 0,
    completed: 0,
    reserved: 0,
    courseDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents()
      .then((students) => {
        const total = students.length;
        const studying = students.filter(s => s.status === 'STUDYING').length;
        const completed = students.filter(s => s.status === 'COMPLETED').length;
        const reserved = students.filter(s => s.status === 'RESERVED').length;

        // Group by course
        const courseMap = {};
        students.forEach(s => {
          courseMap[s.course] = (courseMap[s.course] || 0) + 1;
        });
        const courseDistribution = Object.keys(courseMap).map(key => ({
          name: key,
          value: courseMap[key]
        }));

        setStats({
          total,
          studying,
          completed,
          reserved,
          courseDistribution
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { stats, loading };
}
