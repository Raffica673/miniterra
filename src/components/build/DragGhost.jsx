import InfrastructureIcon from '../map/InfrastructureIcon';
import { getInfraDefinition } from '../../data/infrastructure';

export default function DragGhost({ type, position }) {
  if (!type || !position) return null;
  const def = getInfraDefinition(type);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - 20,
        top: position.y - 20,
        width: 40,
        height: 40,
        pointerEvents: 'none',
        zIndex: 1000,
        filter: `drop-shadow(0 0 10px ${def.glowColor})`,
        opacity: 0.8,
      }}
    >
      <svg viewBox="-20 -25 40 40" width={40} height={40}>
        <InfrastructureIcon type={type} cell={{ windIndex: 50 }} />
      </svg>
    </div>
  );
}
