import { SiteCopy } from '../types/siteCopy';

const brandStrings: SiteCopy = {
  home: {
    mainTitle: "Test Industry Product Launch Toolkit",
    welcomeLead: "Welcome to your comprehensive toolkit for the successful launch and promotion of our new test product.",
    helpYouIntro: "This toolkit is designed to help you:",
    helpYouList: [
      "Effectively communicate the product's unique features",
      "Coordinate product launch activities across teams",
      "Ensure consistent branding in all communications"
    ],
    quickReferenceIntro: "You'll find guides covering every key stage of the campaign:",
    quickReferenceList: [
      "Launch communication strategy",
      "Coordinating team efforts",
      "Creating impactful promotional materials",
      "Organizing internal launch events",
      "Feedback collection and analysis",
      "Post-launch follow-up activities"
    ],
    guidesDescription: "Each guide includes clear instructions, practical tips, and templates you can use to tailor strategies for your team.",
    journeyTitle: "Launch Process",
    journeySubtitle: "Click any stage to view details",
    journeySteps: {
      launch: {
        title: "Initiation",
        description: "Begin planning and set initial goals for the product launch."
      },
      generateTestRides: {
        title: "Promotion Planning",
        description: "Develop marketing strategies and materials to boost awareness."
      },
      inStore: {
        title: "Internal Communication",
        description: "Ensure all teams are aligned and informed ahead of the launch."
      },
      followUp: {
        title: "Post-Launch Analysis",
        description: "Gather feedback and assess initial impact following the launch."
      },
      welcome: {
        title: "Team Acknowledgment",
        description: "Celebrate launch success and recognize team contributions."
      }
    }
  },
  assets: {
    title: "Resource Hub",
    introParagraph1: "Access a variety of digital assets to support your product launch activities.",
    aboutContentHeading: "About Our Assets",
    aboutContentP1: "Browse and download images, videos, and promotional templates.",
    phase1LeadIn: "<strong>Current assets available:</strong>",
    phase1Details: "Includes initial promotional graphics and video clips for early communications.",
    phase2LeadIn: "<strong>Upcoming assets:</strong>",
    phase2Details: "High-quality photos and videos will be available soon to enhance your marketing efforts.",
    filterHeading: "Filter by:",
  },
  messages: {
    title: "Communication Templates",
    introParagraph1: "These templates are designed to assist you in crafting effective internal communications.",
    introParagraph2: "Feel free to adapt these templates to suit your department's specific needs and tone.",
    filterHeading: "Filter Messages by:",
  },
  guides: {
    title: "Guidance and Best Practices",
    introParagraph1: "Explore comprehensive guides that aid in each phase of the product launch.",
    introParagraph2: "These guides are intended to streamline your processes and enhance team coordination.",
    filterHeading: "Filter Guides by:",
    availableGuidesTitle: "Select a Guide",
    guideContentTitle: "Guide Details",
    selectGuideMessage: "Choose a guide to read its contents."
  },
  help: {
    title: "Support & Resources",
    sections: [
      {
        heading: "Getting Started",
        content: [
          "<strong>Explore resources:</strong> Each guide is easily accessible from the main menu.",
          "<strong>Take action now:</strong> Implement strategies using the templates provided.",
          "<strong>Collaborate effectively:</strong> Share resources across all teams involved.",
          "This toolkit ensures every interaction and communication is impactful."
        ]
      },
      {
        heading: "Need Assistance?",
        content: [
          "For additional support, contact your dedicated team lead for guidance.",
          "Let's make this product launch a landmark success for all teams involved."
        ]
      }
    ],
  },
  navigation: {
    homeTab: "Home",
    assetsTab: "Resources",
    messagesTab: "Templates",
    guidesTab: "Guides",
    helpTab: "Support",
  },
};

export default brandStrings;