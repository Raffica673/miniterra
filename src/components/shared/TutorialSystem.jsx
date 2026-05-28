import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interactive Tutorial System
 * Guides users through features with highlighted elements and explanations
 */

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to GridScope! 🌍',
    description: 'Let\'s learn how to build sustainable energy infrastructure. This tutorial will guide you through all the features.',
    target: null,
    position: 'center',
  },
  {
    id: 'regions',
    title: 'Scout Regions',
    description: 'First, explore different regions. Each has unique characteristics for solar, wind, water, and geothermal energy.',
    target: '.scout-panel',
    position: 'right',
  },
  {
    id: 'data-layers',
    title: 'Data Layers',
    description: 'Toggle these layers to see solar potential, wind speeds, temperature, and water resources across the region.',
    target: '.data-layers',
    position: 'right',
  },
  {
    id: 'build-modes',
    title: 'Build Modes',
    description: 'Choose BUILD 1 for sandbox practice, or BUILD 2 to work with real Chilean cities after selecting a region.',
    target: '.build-buttons',
    position: 'right',
  },
  {
    id: 'toolbox',
    title: 'Infrastructure Toolbox',
    description: 'Select power plants and transmission lines here. Click on an infrastructure type to learn about it!',
    target: '.toolbox',
    position: 'right',
  },
  {
    id: 'budget',
    title: 'Budget Management',
    description: 'Keep track of your budget. Each infrastructure costs money. Plan wisely!',
    target: '.budget-section',
    position: 'right',
  },
  {
    id: 'grid',
    title: 'Placement Grid',
    description: 'Click on the grid to place your selected infrastructure. Consider terrain features like water, forests, and settlements.',
    target: '.sandbox-grid',
    position: 'left',
  },
  {
    id: 'score',
    title: 'Feasibility Score',
    description: 'Your score shows how well your energy network performs. Higher is better!',
    target: '.score-panel',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    description: 'Now you know the basics. Start building your sustainable energy network!',
    target: null,
    position: 'center',
  },
];

export default function TutorialSystem({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const seen = localStorage.getItem('gridscope_tutorial_seen');
    if (!seen) {
      setIsActive(true);
    }
    setHasSeenTutorial(!!seen);
  }, []);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem('gridscope_tutorial_seen', 'true');
    setHasSeenTutorial(true);
    onComplete?.();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const step = TUTORIAL_STEPS[currentStep];

  if (!isActive) {
    return (
      <button
        onClick={handleRestart}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #66BB6A, #43A047)',
          border: 'none',
          borderRadius: 20,
          padding: '10px 16px',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 4px 12px rgba(67, 160, 71, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>❓</span>
        <span>Tutorial</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9998,
              pointerEvents: step.target ? 'auto' : 'none',
            }}
            onClick={step.target ? undefined : handleNext}
          />

          {/* Highlight target element */}
          {step.target && (
            <HighlightBox target={step.target} />
          )}

          {/* Tutorial card */}
          <TutorialCard
            step={step}
            currentStep={currentStep}
            totalSteps={TUTORIAL_STEPS.length}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function HighlightBox({ target }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(target);
      if (element) {
        const bounds = element.getBoundingClientRect();
        setRect(bounds);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [target]);

  if (!rect) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        border: '3px solid #66BB6A',
        borderRadius: 12,
        boxShadow: '0 0 0 4px rgba(102, 187, 106, 0.3), 0 0 20px rgba(102, 187, 106, 0.5)',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    />
  );
}

function TutorialCard({ step, currentStep, totalSteps, onNext, onSkip }) {
  const getPosition = () => {
    if (step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
    if (step.position === 'right') {
      return {
        top: '50%',
        right: 40,
        transform: 'translateY(-50%)',
      };
    }
    if (step.position === 'left') {
      return {
        top: '50%',
        left: 40,
        transform: 'translateY(-50%)',
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed',
        ...getPosition(),
        zIndex: 10000,
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '3px solid #2E7D32',
      }}
    >
      {/* Progress */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 16,
      }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= currentStep ? '#2E7D32' : '#A5D6A7',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: '#1B5E20',
        marginBottom: 12,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        lineHeight: 1.6,
        color: '#2E7D32',
        marginBottom: 20,
      }}>
        {step.description}
      </p>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: '2px solid #2E7D32',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#2E7D32',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Skip Tutorial
        </button>

        <button
          onClick={onNext}
          style={{
            background: 'linear-gradient(135deg, #66BB6A, #43A047)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 12px rgba(67, 160, 71, 0.4)',
          }}
        >
          {currentStep === totalSteps - 1 ? 'Get Started!' : 'Next →'}
        </button>
      </div>

      {/* Step counter */}
      <div style={{
        marginTop: 12,
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: '#388E3C',
      }}>
        Step {currentStep + 1} of {totalSteps}
      </div>
    </motion.div>
  );
}
