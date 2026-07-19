export type OnboardingSlideId = 'find' | 'plan' | 'charge';

export type TitleSegment = {
  text: string;
  highlight?: boolean;
};

export type OnboardingSlideData = {
  id: OnboardingSlideId;
  /** Each inner array is one visual line of the headline. */
  titleLines: TitleSegment[][];
  subtitle: string;
};

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'find',
    titleLines: [
      [{ text: 'Find.' }],
      [{ text: 'Charge.' }],
      [
        { text: 'Go', highlight: true },
        { text: ' Anywhere.' },
      ],
    ],
    subtitle: 'Find nearby EV chargers, plan your trips and charge with ease.',
  },
  {
    id: 'plan',
    titleLines: [[{ text: 'Plan Smarter.' }]],
    subtitle: 'Plan every trip with intelligent charging stops.',
  },
  {
    id: 'charge',
    titleLines: [[{ text: 'Charge Confidently.' }]],
    subtitle: 'See live charger availability, pricing and verified stations.',
  },
];
