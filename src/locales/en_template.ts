import { SiteCopy } from '../types/siteCopy';

const siteCopy: SiteCopy = {
  home: {
    mainTitle: "BMW Motorrad R Series Dealership Toolkit",
    welcomeLead: "Welcome to your digital toolkit for the successful launch and retail activation of the all-new BMW R Series.",
    helpYouIntro: "This toolkit is here to help you:",
    helpYouList: [
      "Engage and nurture leads",
      "Maximise test ride and sales conversions",
      "Deliver consistent messaging across all marketing touchpoints",
    ],
    quickReferenceIntro: "You\'ll find quick-reference guides covering every key stage of the campaign:",
    quickReferenceList: [
      "Retail launch communication strategy",
      "Filming and editing walkaround videos",
      "Creating high-impact social clips",
      "Generating and converting test rides",
      "In-store customer communication tips",
      "Post-visit follow-up tactics",
      "New owner welcome steps",
    ],
    guidesDescription: "Each guide includes clear instructions, practical tips, and messaging templates you can use as-is or tailor to your dealership\'s needs.",
    journeyTitle: "Customer Journey",
    journeySubtitle: "Click any stage to view messages",
    journeySteps: {
      launch: {
        title: "Launch",
        description: "Initial campaign launch and awareness building"
      },
      generateTestRides: {
        title: "Generate Test Rides",
        description: "Convert interest into test ride bookings"
      },
      inStore: {
        title: "In-Store",
        description: "Dealership experience and product showcase"
      },
      followUp: {
        title: "Follow-Up",
        description: "Post-purchase communication and satisfaction"
      },
      welcome: {
        title: "Welcome",
        description: "Onboarding new owners to the BMW family"
      }
    }
  },
  assets: {
    title: "Assets Bank",
    introParagraph1: "Welcome to the central hub for all campaign photography and video assets for the BMW R 1300 RT, R 1300 R, and R 1300 RS launch.",
    aboutContentHeading: "About the Content",
    aboutContentP1: "You can browse and download visual assets by model, content type, and campaign phase.",
    phase1LeadIn: "<strong>Phase 1 assets (available now):</strong>",
    phase1Details: "Includes AI-generated background imagery and CGI video assets created to support your early launch communications.",
    phase2LeadIn: "<strong>Phase 2 assets (coming soon):</strong>",
    phase2Details: "High-quality photography and video from the official BMW Motorrad shoot will be available from 29 July 2025.",
    filterHeading: "Filter Assets by:",
  },
  messages: {
    title: "Messages",
    introParagraph1: "All messaging here is designed as a starting point for you to communicate the unique features and key messages of these models consistently across your marketing touch points.",
    introParagraph2: "It\'s all flexible, editable, and made to be tailored by your dealership. Use these templates as-is or tweak the tone, language, and details to suit your customers and your style.",
    filterHeading: "Filter Messages by:",
  },
  guides: {
    title: "Guides",
    introParagraph1: "",
    introParagraph2: "",
    filterHeading: "Filter Guides by:",
    availableGuidesTitle: "Available Guides",
    guideContentTitle: "Guide Content",
    selectGuideMessage: "Select a guide to view its content."
  },
  help: {
    title: "Help & Support",
    sections: [
      {
        heading: "How to Use This Toolkit",
        content: [
          "<strong>Browse by topic:</strong> Each guide is self-contained and accessible from the main menu.",
          "<strong>Take action:</strong> Use the checklists and templates to start implementing activities immediately.",
          "<strong>Share with your team:</strong> These resources are designed to be collaborative and can be used across sales, marketing, and service teams.",
          "Whether you\'re preparing in-store materials, posting on social, or hosting test rides, this toolkit helps make every customer interaction count."
        ]
      },
      {
        heading: "Need Help?",
        content: [
          "If you have any questions or need support during the campaign, please get in touch with your BMW marketing contact.",
          "We\'re here to support you every step of the way — now let\'s make this launch unforgettable."
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

export default siteCopy; 