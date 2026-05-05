import { useState, useCallback } from 'react';
import { getInfraDefinition } from '../data/infrastructure';

const DEFAULT_BUDGET = 1000;

export function useBudget() {
  const [totalBudget, setTotalBudget] = useState(DEFAULT_BUDGET);
  const [spent, setSpent] = useState(0);

  const budget = totalBudget - spent;

  const spend = useCallback((type) => {
    const def = getInfraDefinition(type);
    if (def) setSpent(prev => prev + def.cost);
  }, []);

  const refund = useCallback((type) => {
    const def = getInfraDefinition(type);
    if (def) setSpent(prev => Math.max(0, prev - def.cost));
  }, []);

  const canAfford = useCallback((type) => {
    const def = getInfraDefinition(type);
    return def && budget >= def.cost;
  }, [budget]);

  const reset = useCallback(() => {
    setSpent(0);
  }, []);

  const changeTotalBudget = useCallback((newTotal) => {
    setTotalBudget(newTotal);
  }, []);

  return { budget, totalBudget, spent, spend, refund, canAfford, reset, changeTotalBudget };
}
