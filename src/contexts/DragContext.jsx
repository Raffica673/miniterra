import { createContext, useContext, useState, useCallback } from 'react';

const DragContext = createContext(null);

export function DragProvider({ children }) {
  const [dragItem, setDragItem] = useState(null);       // infrastructure type being dragged
  const [dragPosition, setDragPosition] = useState(null); // current screen position
  const [dropTarget, setDropTarget] = useState(null);    // grid cell currently hovered
  const [dropValidity, setDropValidity] = useState(null); // { valid, suboptimal, reason }

  const startDrag = useCallback((infraType) => {
    setDragItem(infraType);
  }, []);

  const updateDrag = useCallback((pos, target, validity) => {
    setDragPosition(pos);
    setDropTarget(target);
    setDropValidity(validity);
  }, []);

  const endDrag = useCallback(() => {
    setDragItem(null);
    setDragPosition(null);
    setDropTarget(null);
    setDropValidity(null);
  }, []);

  return (
    <DragContext.Provider value={{
      dragItem, dragPosition, dropTarget, dropValidity,
      startDrag, updateDrag, endDrag,
    }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag must be inside DragProvider');
  return ctx;
}
