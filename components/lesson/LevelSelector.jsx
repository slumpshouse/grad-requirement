'use client';

const LEVELS = [
  { id: 'beginner', label: 'Beginner', color: 'green' },
  { id: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { id: 'advanced', label: 'Advanced', color: 'red' },
];

const COLOR_MAP = {
  green: {
    active: 'lp-level-btn lp-level-btn--green lp-level-btn--active',
    inactive: 'lp-level-btn lp-level-btn--green',
  },
  yellow: {
    active: 'lp-level-btn lp-level-btn--yellow lp-level-btn--active',
    inactive: 'lp-level-btn lp-level-btn--yellow',
  },
  red: {
    active: 'lp-level-btn lp-level-btn--red lp-level-btn--active',
    inactive: 'lp-level-btn lp-level-btn--red',
  },
};

export default function LevelSelector({ selectedLevel, onSelect }) {
  return (
    <div className="lp-level-selector" role="tablist" aria-label="Select lesson level">
      {LEVELS.map(({ id, label, color }) => {
        const isActive = selectedLevel === id;
        const cls = COLOR_MAP[color][isActive ? 'active' : 'inactive'];
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            className={cls}
            onClick={() => onSelect(id)}
            data-testid={`level-btn-${id}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
