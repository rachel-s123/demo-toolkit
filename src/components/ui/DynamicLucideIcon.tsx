import React from "react";
import {
  HelpCircle,
  BookOpen,
  Video,
  Settings,
  MessageSquare,
  CheckSquare,
  type LucideProps,
  type LucideIcon,
} from "lucide-react";

interface DynamicLucideIconProps extends LucideProps {
  iconName: string;
}

const iconMap: { [key: string]: LucideIcon } = {
  HelpCircle: HelpCircle,
  BookOpen: BookOpen,
  Video: Video,
  Settings: Settings,
  MessageSquare: MessageSquare,
  CheckSquare: CheckSquare,
  // Add more icons here as needed
  // e.g., 'User': User,
};

const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  iconName,
  ...props
}) => {
  const IconComponent = iconMap[iconName] || HelpCircle; // Default to HelpCircle if icon not found
  return <IconComponent {...props} />;
};

export default DynamicLucideIcon;
