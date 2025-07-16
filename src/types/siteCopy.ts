export interface JourneyStepCopy {
  title: string;
  description: string;
}

export interface HomePageCopy {
  mainTitle: string;
  welcomeLead: string;
  helpYouIntro: string;
  helpYouList: string[];
  quickReferenceIntro: string;
  quickReferenceList: string[];
  guidesDescription: string;
  journeyTitle: string;
  journeySubtitle: string;
  journeySteps: {
    launch: JourneyStepCopy;
    generateTestRides: JourneyStepCopy;
    inStore: JourneyStepCopy;
    followUp: JourneyStepCopy;
    welcome: JourneyStepCopy;
  };
}

export interface AssetsPageCopy {
  title: string;
  introParagraph1: string;
  aboutContentHeading: string;
  aboutContentP1: string;
  phase1LeadIn: string;
  phase1Details: string;
  phase2LeadIn: string;
  phase2Details: string;
  filterHeading: string;
}

export interface MessagesPageCopy {
  title: string;
  introParagraph1: string;
  introParagraph2: string;
  filterHeading: string;
}

export interface GuidesPageCopy {
  title: string;
  introParagraph1: string;
  introParagraph2: string;
  filterHeading: string;
  availableGuidesTitle: string;
  guideContentTitle: string;
  selectGuideMessage: string;
}

export interface HelpSectionCopy {
  heading: string;
  // Content could be a simple string, or an array of strings/objects for more structure
  content: string | string[]; 
}

export interface HelpPageCopy {
  title: string;
  sections: HelpSectionCopy[];
}

// Added for navigation tab labels
export interface NavigationCopy {
  homeTab: string;
  assetsTab: string;
  messagesTab: string;
  guidesTab: string;
  helpTab: string;
}

export interface SiteCopy {
  home: HomePageCopy;
  assets: AssetsPageCopy;
  messages: MessagesPageCopy;
  guides: GuidesPageCopy;
  help: HelpPageCopy;
  navigation?: NavigationCopy; // Added navigation
} 