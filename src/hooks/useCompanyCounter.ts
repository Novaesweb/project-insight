import { useState, useEffect } from 'react';

export function useCompanyCounter() {
  const [companyCount, setCompanyCount] = useState(64);

  useEffect(() => {
    // Data de início (1º de janeiro de 2024)
    const startDate = new Date('2024-01-01');
    const today = new Date();
    
    // Calcular dias desde a data de início
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base de 64 empresas + 1 por dia
    const calculatedCount = 64 + daysSinceStart;
    
    setCompanyCount(calculatedCount);
  }, []);

  return companyCount;
}
