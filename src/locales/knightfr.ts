import { SiteCopy } from '../types/siteCopy';

const brandStrings: SiteCopy = {
  home: {
    mainTitle: "Knight Frank IPAS Toolkit",
    welcomeLead: "Welcome to your digital toolkit for leveraging the Infinite Personalisation at Scale (IPAS) platform at Knight Frank.",
    helpYouIntro: "This toolkit is designed to help you:",
    helpYouList: [
      "Deliver highly personalised content and insights to clients",
      "Create bespoke emails tailored to each client's specific needs",
      "Generate insightful, client-focused reports and meeting points quickly",
    ],
    quickReferenceIntro: "You'll find quick-reference materials addressing every key stage of client engagement:",
    quickReferenceList: [
      "Personalised email strategies",
      "Client meeting preparation guidelines",
      "Follow-up content creation",
      "Tailored report generation",
      "Event-driven communication tips",
      "Client onboarding excellence",
    ],
    guidesDescription: "Every guide includes step-by-step instructions, detailed insights, and templates that are adaptable to your client's preferences.",
    journeyTitle: "Client Engagement Journey",
    journeySubtitle: "Select any stage to view strategic approaches",
    journeySteps: {
      launch: {
        title: "Discovery",
        description: "Understanding client preferences and initial setup"
      },
      generateTestRides: {
        title: "Engagement",
        description: "Providing personalised insights and communication"
      },
      inStore: {
        title: "Meetings",
        description: "Delivering bespoke meeting agendas and points"
      },
      followUp: {
        title: "Follow-Up",
        description: "Tailored post-meeting communication and insights"
      },
      welcome: {
        title: "Onboarding",
        description: "Ensuring a seamless introduction to our services"
      }
    }
  },
  assets: {
    title: "Assets Hub",
    introParagraph1: "Welcome to the central resource for all IPAS platform assets, enabling customised client communications.",
    aboutContentHeading: "Content Overview",
    aboutContentP1: "Browse and download materials sorted by client interests, location, and property profile.",
    phase1LeadIn: "<strong>Current Assets:</strong>",
    phase1Details: "Includes AI-generated templates and insights designed to enhance early-stage client communication.",
    phase2LeadIn: "<strong>Upcoming Assets:</strong>",
    phase2Details: "High-detail personalised reports, and strategic communication guides for client engagement and services.",
    filterHeading: "Filter Assets by:",
  },
  messages: {
    title: "Personalised Communications",
    introParagraph1: "All communications are crafted to support client-specific engagement by leveraging Knight Frank's insights.",
    introParagraph2: "These templates are flexible and can be tailored to reflect client needs and your unique advisory style.",
    filterHeading: "Filter Communications by:",
  },
  guides: {
    title: "Strategy Guides",
    introParagraph1: "These guides help streamline your client engagement process using IPAS capabilities.",
    introParagraph2: "Every guide provides actionable strategies and personalisation techniques.",
    filterHeading: "Filter Guides by:",
    availableGuidesTitle: "Available Strategy Guides",
    guideContentTitle: "Guide Content Details",
    selectGuideMessage: "Select a guide to view its comprehensive content.",
  },
  help: {
    title: "Help & Support",
    sections: [
      {
        heading: "Toolkit Usage Instructions",
        content: [
          "<strong>Explore by category:</strong> Each resource is accessible through the main menu.",
          "<strong>Implement immediately:</strong> Use templates and checklists to start enhancing client relationships today.",
          "<strong>Collaborate with your team:</strong> Resources are designed for collaborative use across advisory and client services teams."
        ]
      },
      {
        heading: "Need Assistance?",
        content: [
          "For questions or additional support, please contact your Knight Frank advisory representative.",
          "Our team is here to ensure your success with every client engagement."
        ]
      }
    ],
  },
  navigation: {
    homeTab: "Home",
    assetsTab: "Assets",
    messagesTab: "Communications",
    guidesTab: "Guides",
    helpTab: "Help",
  },
};

export default brandStrings;