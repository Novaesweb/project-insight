import { useState, useEffect } from 'react';

export function useCompanyCounter() {
  const [companyCount, setCompanyCount] = useState(36);

  useEffect(() => {
    // Data de início (1º de janeiro de 2024)
    const startDate = new Date('2024-01-01');
    const today = new Date();
    
    // Calcular dias desde a data de início
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base de 36 empresas + 1 por dia
    const calculatedCount = 36 + daysSinceStart;
    
    setCompanyCount(calculatedCount);
  }, []);

  return companyCount;
}
