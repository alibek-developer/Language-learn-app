/**
 * ReadScribe Initial Reading Materials
 * Curated texts with graded difficulty for English learners.
 */

import { ReadingItem } from '../types';

export const INITIAL_READINGS: ReadingItem[] = [
  {
    id: 'reading-1',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    category: 'Badiiy adabiyot',
    level: 'B1 Intermediate',
    content: `Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.

In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."

I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One.

I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them. But they answered: "Frighten? Why should any one be frightened by a hat?"

My drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of a boa constrictor, so that the grown-ups could see it clearly. They always need to have things explained.

The grown-ups' response, this time, was to advise me to lay aside my drawings of boa constrictors, whether from the inside or the outside, and devote myself instead to geography, history, arithmetic, and grammar. That is why, at the age of six, I gave up what might have been a magnificent career as a painter.`,
    estimatedReadMinutes: 4,
    lastReadTimestamp: Date.now() - 3600000 * 2,
    scrollProgress: 0.25,
    lastReadParagraph: 1,
    isFinished: false,
    isCustom: false,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'reading-2',
    title: 'A Scandal in Bohemia',
    author: 'Arthur Conan Doyle',
    category: 'Detektiv',
    level: 'B2 Upper-Intermediate',
    content: `To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.

It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention.

One night—it was on the twentieth of March, 1888—I was returning from a journey to a patient, when my way led me through Baker Street. As I passed the well-remembered door, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers.

His rooms were brilliantly lit, and, even as I looked up, I saw his tall, spare figure pass twice in a dark silhouette against the blind. He was pacing the room swiftly, eagerly, with his head sunk upon his chest and his hands clasped behind him.`,
    estimatedReadMinutes: 5,
    lastReadTimestamp: 0,
    scrollProgress: 0,
    lastReadParagraph: 0,
    isFinished: false,
    isCustom: false,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'reading-3',
    title: 'Artificial Intelligence & The Future of Work',
    author: 'Tech Insight Magazine',
    category: 'Texnologiya',
    level: 'B2 Upper-Intermediate',
    content: `Artificial intelligence is rapidly transforming industries across the globe. From healthcare diagnostics to autonomous transportation, intelligent systems are automating complex processes at unprecedented speed.

However, the rise of AI does not simply mean replacing human workers. Instead, it is redefining the nature of collaboration between humans and machines. Routine, repetitive tasks are increasingly handled by algorithms, freeing up human professionals to focus on creative problem-solving, strategic thinking, and emotional intelligence.

In education, adaptive learning platforms personalize instruction according to each student's unique pace and style. In medicine, predictive analytics help physicians identify potential illnesses before symptoms even appear.

To thrive in this evolving landscape, learners must cultivate adaptability and lifelong learning skills. Critical thinking and technological literacy will be paramount in navigating the future job market.`,
    estimatedReadMinutes: 3,
    lastReadTimestamp: 0,
    scrollProgress: 0,
    lastReadParagraph: 0,
    isFinished: false,
    isCustom: false,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'reading-4',
    title: 'The Art of Deep Work',
    author: 'Cal Newport (Adapted)',
    category: 'Shaxsiy rivojlanish',
    level: 'A2-B1 Pre-Intermediate',
    content: `Deep work is the ability to focus without distraction on a cognitively demanding task. It is a superpower in our increasingly competitive twenty-first-century economy.

Most people spend their days in a state of fragmented attention. Constant notifications, emails, and social media updates interrupt our trains of thought. This shallow work prevents us from mastering complicated material or producing truly valuable results.

To cultivate deep work, create dedicated blocks of uninterrupted time. Turn off phone notifications, close unnecessary browser tabs, and communicate your focus hours clearly to friends and colleagues.

When you practice focused concentration consistently, you will accomplish far more in fewer hours and experience greater satisfaction in your daily endeavors.`,
    estimatedReadMinutes: 3,
    lastReadTimestamp: 0,
    scrollProgress: 0,
    lastReadParagraph: 0,
    isFinished: false,
    isCustom: false,
    createdAt: Date.now() - 86400000 * 2,
  },
];
