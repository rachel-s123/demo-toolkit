import React from 'react';
import Button from '../../ui/Button';
import { ActionButtonType } from '../../../types';
import { Rocket, Calendar, Store, MessageSquare, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onActionSelect: (action: ActionButtonType) => void;
  selectedAction: ActionButtonType | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onActionSelect,
  selectedAction,
}) => {
  const actions: { type: ActionButtonType; icon: React.ReactNode }[] = [
    { type: 'LAUNCH', icon: <Rocket className="h-6 w-6" /> },
    { type: 'GENERATE TEST RIDES', icon: <Calendar className="h-6 w-6" /> },
    { type: 'IN-STORE', icon: <Store className="h-6 w-6" /> },
    { type: 'FOLLOW-UP', icon: <MessageSquare className="h-6 w-6" /> },
    { type: 'WELCOME', icon: <UserPlus className="h-6 w-6" /> },
  ];

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-secondary-900">Actions</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {actions.map((action, index) => (
          <motion.div
            key={action.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="action"
              isActive={selectedAction === action.type}
              icon={action.icon}
              onClick={() => onActionSelect(action.type)}
              className="w-full"
            >
              {action.type}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;