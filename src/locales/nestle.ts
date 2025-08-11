import { SiteCopy } from '../types/siteCopy';

const brandStrings: SiteCopy = {
  home: {
    mainTitle: "Nestlé Plant-Based Product Launch Toolkit",
    welcomeLead: "Welcome to your comprehensive toolkit for the successful launch and internal activation of Nestlé's latest plant-based product.",
    helpYouIntro: "This toolkit is here to assist you in:",
    helpYouList: [
      "Understanding the product's benefits and features",
      "Implementing consistent messaging across all communication channels",
      "Engaging and empowering internal teams with knowledge and resources",
    ],
    quickReferenceIntro: "You'll find quick-reference guides covering every key stage of the launch:",
    quickReferenceList: [
      "Product introduction and key messages",
      "Creating engaging internal presentations",
      "Using digital assets effectively",
      "Internal team training and empowerment",
      "Post-launch evaluation and feedback collection",
    ],
    guidesDescription: "Each guide includes clear instructions, practical tips, and messaging templates tailored to ensure a successful internal rollout of the new product.",
    journeyTitle: "Launch Process",
    journeySubtitle: "Explore each stage for detailed guidance",
    journeySteps: {
      launch: {
        title: "Launch Preparation",
        description: "Preparing teams and resources for the launch of the new product"
      },
      generateTestRides: {
        title: "Internal Training",
        description: "Training teams on product knowledge and messaging"
      },
      inStore: {
        title: "Internal Engagement",
        description: "Engaging teams with interactive workshops and materials"
      },
      followUp: {
        title: "Feedback Collection",
        description: "Gathering feedback and insights post-launch"
      },
      welcome: {
        title: "Continuous Support",
        description: "Providing ongoing resources and support to teams"
      }
    }
  },
  assets: {
    title: "Assets Hub",
    introParagraph1: "Welcome to the central hub for all digital assets related to the launch of Nestlé's new plant-based product.",
    aboutContentHeading: "About the Assets",
    aboutContentP1: "Explore and download digital materials by type, usage, and campaign phase.",
    phase1LeadIn: "<strong>Phase 1 assets (available now):</strong>",
    phase1Details: "Includes visual and informational materials designed to support the initial communications and internal training.",
    phase2LeadIn: "<strong>Phase 2 assets (coming soon):</strong>",
    phase2Details: "Enhanced digital content and engagement tools will be available as we progress through the launch stages.",
    filterHeading: "Filter Assets by:",
  },
  messages: {
    title: "Messaging Toolkit",
    introParagraph1: "All messages serve as a foundation for you to communicate the unique features and values of the new product consistently across internal channels.",
    introParagraph2: "These templates are editable and adaptable to fit your team's communication style and the specific needs of your department.",
    filterHeading: "Filter Messages by:",
  },
  guides: {
    title: "Guides",
    introParagraph1: "Comprehensive guides to ensure a successful product launch.",
    introParagraph2: "Find step-by-step instructions and best practices.",
    filterHeading: "Filter Guides by:",
    availableGuidesTitle: "Available Guides",
    guideContentTitle: "Guide Content",
    selectGuideMessage: "Select a guide to view its content."
  },
  help: {
    title: "Help & Support",
    sections: [
      {
        heading: "Utilizing This Toolkit",
        content: [
          "<strong>Access by topic:</strong> Each guide is organized by key launch topics accessible through the main menu.",
          "<strong>Actionable insights:</strong> Use the provided templates and checklists to implement strategies immediately.",
          "<strong>Collaborate with your team:</strong> Resources are designed to foster teamwork and knowledge sharing across departments.",
          "From team briefings to post-launch reviews, this toolkit supports each step of the internal roll-out."
        ]
      },
      {
        heading: "Need Assistance?",
        content: [
          "For questions or further support during the launch, please contact your internal Nestlé communication coordinator.",
          "We're committed to supporting you throughout the process to achieve a successful product launch."
        ]
      }
    ],
  },
  navigation: {
    homeTab: "Home",
    assetsTab: "Assets",
    messagesTab: "Messages",
    guidesTab: "Guides",
    helpTab: "Help",
  },
};

export default brandStrings;