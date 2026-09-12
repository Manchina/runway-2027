import { useContext } from 'react';
import { RunwayContext } from './RunwayContext';

export const useRunway = () => {
  const context = useContext(RunwayContext);
  if (!context) {
    throw new Error('useRunway must be used within a RunwayProvider');
  }
  return context;
};
