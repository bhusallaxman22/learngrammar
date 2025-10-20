import type { GrammarLesson, TenseLesson, ConditionalLesson } from '../types/index.ts';

// Subject-Verb-Object Lessons
export const svoLessons: GrammarLesson[] = [
  {
    id: 'svo-1',
    title: 'Introduction to Subject-Verb-Object',
    category: 'subject-verb-object',
    level: 1,
    description: 'Learn the basic building blocks of English sentences',
    requiredLevel: 1,
    xpReward: 50,
    coinReward: 10,
    content: {
      introduction: 'Every complete sentence has three main parts: a subject (who/what), a verb (action), and an object (receives the action).',
      rules: [
        {
          id: 'svo-rule-1',
          title: 'Subject',
          description: 'The subject is who or what the sentence is about. It performs the action.',
          formula: 'Who/What does something?',
        },
        {
          id: 'svo-rule-2',
          title: 'Verb',
          description: 'The verb is the action or state of being in the sentence.',
          formula: 'What action is happening?',
        },
        {
          id: 'svo-rule-3',
          title: 'Object',
          description: 'The object receives the action of the verb.',
          formula: 'Who/What receives the action?',
        },
      ],
      examples: [
        {
          sentence: 'The cat chased the mouse.',
          explanation: 'The cat (subject) performed the action of chasing (verb) the mouse (object).',
          breakdown: {
            subject: 'The cat',
            verb: 'chased',
            object: 'the mouse',
          },
        },
        {
          sentence: 'Sarah reads books.',
          explanation: 'Sarah (subject) performs the action of reading (verb) books (object).',
          breakdown: {
            subject: 'Sarah',
            verb: 'reads',
            object: 'books',
          },
        },
        {
          sentence: 'The teacher explains grammar.',
          explanation: 'The teacher (subject) performs the action of explaining (verb) grammar (object).',
          breakdown: {
            subject: 'The teacher',
            verb: 'explains',
            object: 'grammar',
          },
        },
      ],
      tips: [
        'Ask "Who or what does something?" to find the subject',
        'Ask "What is happening?" to find the verb',
        'Ask "Who or what receives the action?" to find the object',
        'Not all sentences have an object - some only have a subject and verb',
      ],
    },
    exercises: [
      {
        id: 'svo-ex-1',
        type: 'identify-parts',
        question: 'Identify the subject, verb, and object in: "John plays football"',
        correctAnswer: ['subject:John', 'verb:plays', 'object:football'],
        explanation: 'John is the subject (who), plays is the verb (action), football is the object (what is played)',
        difficulty: 'easy',
        points: 10,
        sentenceParts: [
          { id: '1', text: 'John', type: 'subject' },
          { id: '2', text: 'plays', type: 'verb' },
          { id: '3', text: 'football', type: 'object' },
        ],
      },
      {
        id: 'svo-ex-2',
        type: 'multiple-choice',
        question: 'What is the subject in "The dog barks loudly"?',
        options: ['The dog', 'barks', 'loudly', 'dog barks'],
        correctAnswer: 'The dog',
        explanation: 'The dog is who performs the action of barking',
        difficulty: 'easy',
        points: 10,
      },
      {
        id: 'svo-ex-3',
        type: 'drag-drop',
        question: 'Arrange these words to form a proper SVO sentence',
        options: ['the apple', 'ate', 'The boy'],
        correctAnswer: 'The boy ate the apple',
        explanation: 'Subject (The boy) + Verb (ate) + Object (the apple)',
        difficulty: 'medium',
        points: 15,
      },
    ],
  },
  {
    id: 'svo-2',
    title: 'Complex Subjects and Objects',
    category: 'subject-verb-object',
    level: 2,
    description: 'Learn about compound subjects and objects',
    requiredLevel: 2,
    xpReward: 75,
    coinReward: 15,
    content: {
      introduction: 'Sentences can have compound subjects (multiple subjects) or compound objects (multiple objects).',
      rules: [
        {
          id: 'svo-comp-1',
          title: 'Compound Subject',
          description: 'Two or more subjects connected by "and" or "or"',
          formula: 'Subject 1 + and/or + Subject 2 + Verb + Object',
        },
        {
          id: 'svo-comp-2',
          title: 'Compound Object',
          description: 'Two or more objects connected by "and" or "or"',
          formula: 'Subject + Verb + Object 1 + and/or + Object 2',
        },
      ],
      examples: [
        {
          sentence: 'Tom and Jerry watch cartoons.',
          explanation: 'Compound subject: Both Tom and Jerry perform the action.',
          breakdown: {
            subject: 'Tom and Jerry',
            verb: 'watch',
            object: 'cartoons',
          },
        },
        {
          sentence: 'She bought apples and oranges.',
          explanation: 'Compound object: She bought two things.',
          breakdown: {
            subject: 'She',
            verb: 'bought',
            object: 'apples and oranges',
          },
        },
      ],
      tips: [
        'Look for "and" or "or" to spot compound subjects/objects',
        'Each part of a compound subject can perform the action',
        'Compound subjects joined by "and" usually take plural verbs',
      ],
    },
    exercises: [
      {
        id: 'svo-comp-ex-1',
        type: 'multiple-choice',
        question: 'What type of subject is in "The cat and dog play together"?',
        options: ['Simple subject', 'Compound subject', 'Complex subject', 'No subject'],
        correctAnswer: 'Compound subject',
        explanation: 'It has two subjects (cat and dog) joined by "and"',
        difficulty: 'medium',
        points: 15,
      },
    ],
  },
];

// Tense Lessons
export const tenseLessons: TenseLesson[] = [
  {
    id: 'tense-present-simple',
    title: 'Simple Present Tense',
    category: 'tenses',
    level: 1,
    description: 'Express habits, facts, and general truths',
    requiredLevel: 1,
    xpReward: 60,
    coinReward: 12,
    tense: 'simple-present',
    usageScenarios: [
      'Habits and routines (I wake up at 7 AM)',
      'General truths (The sun rises in the east)',
      'Permanent situations (She lives in Paris)',
      'Scheduled events (The train leaves at 9 PM)',
    ],
    signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
    content: {
      introduction: 'The simple present tense describes actions that happen regularly or facts that are always true.',
      rules: [
        {
          id: 'present-rule-1',
          title: 'Formation',
          description: 'Use base form of verb. Add -s/-es for third person singular (he/she/it)',
          formula: 'Subject + Verb (base form) / Verb+s',
        },
        {
          id: 'present-rule-2',
          title: 'Negative',
          description: 'Use do not (don\'t) or does not (doesn\'t) + base verb',
          formula: 'Subject + do/does + not + Verb',
        },
        {
          id: 'present-rule-3',
          title: 'Question',
          description: 'Use Do/Does at the beginning',
          formula: 'Do/Does + Subject + Verb?',
        },
      ],
      examples: [
        {
          sentence: 'I play tennis every weekend.',
          explanation: 'Regular activity - habitual action',
        },
        {
          sentence: 'She works at a hospital.',
          explanation: 'Permanent situation - third person singular adds "s"',
        },
        {
          sentence: 'Water boils at 100°C.',
          explanation: 'Scientific fact - always true',
        },
      ],
      tips: [
        'Add -s or -es to verbs with he/she/it',
        'Use for habits, routines, and facts',
        'Common with time expressions like always, usually, often',
      ],
    },
    exercises: [
      {
        id: 'present-ex-1',
        type: 'fill-blank',
        question: 'She ____ (go) to school every day.',
        correctAnswer: 'goes',
        explanation: 'Third person singular (she) requires "goes" not "go"',
        difficulty: 'easy',
        points: 10,
      },
      {
        id: 'present-ex-2',
        type: 'multiple-choice',
        question: 'Which sentence uses simple present correctly?',
        options: [
          'He go to work by bus',
          'He goes to work by bus',
          'He going to work by bus',
          'He is go to work by bus',
        ],
        correctAnswer: 'He goes to work by bus',
        explanation: 'Third person singular needs "goes" (verb + s)',
        difficulty: 'easy',
        points: 10,
      },
    ],
  },
  {
    id: 'tense-past-simple',
    title: 'Simple Past Tense',
    category: 'tenses',
    level: 2,
    description: 'Talk about completed actions in the past',
    requiredLevel: 2,
    xpReward: 60,
    coinReward: 12,
    tense: 'simple-past',
    usageScenarios: [
      'Completed actions (I visited Paris last year)',
      'Past habits (He always walked to school)',
      'Historical events (World War II ended in 1945)',
    ],
    signalWords: ['yesterday', 'last week', 'ago', 'in 1990', 'last night'],
    content: {
      introduction: 'The simple past tense describes actions that were completed in the past.',
      rules: [
        {
          id: 'past-rule-1',
          title: 'Regular Verbs',
          description: 'Add -ed to the base form',
          formula: 'Subject + Verb+ed',
        },
        {
          id: 'past-rule-2',
          title: 'Irregular Verbs',
          description: 'Use the past form (go→went, eat→ate, see→saw)',
          formula: 'Subject + Irregular Past Form',
        },
      ],
      examples: [
        {
          sentence: 'I walked to school yesterday.',
          explanation: 'Regular verb: walk + ed = walked',
        },
        {
          sentence: 'She went to the store.',
          explanation: 'Irregular verb: go → went',
        },
      ],
      tips: [
        'Most verbs add -ed for past tense',
        'Irregular verbs have special past forms to memorize',
        'Past tense form is the same for all subjects',
      ],
    },
    exercises: [],
  },
];

// Conditional Lessons
export const conditionalLessons: ConditionalLesson[] = [
  {
    id: 'cond-zero',
    title: 'Zero Conditional',
    category: 'conditionals',
    level: 2,
    description: 'Express general truths and scientific facts',
    requiredLevel: 2,
    xpReward: 70,
    coinReward: 14,
    conditionalType: 'zero',
    structure: {
      ifClause: 'If + present simple',
      mainClause: 'present simple',
    },
    content: {
      introduction: 'The zero conditional expresses facts and things that are always true.',
      rules: [
        {
          id: 'zero-rule-1',
          title: 'Structure',
          description: 'If + present simple, present simple',
          formula: 'If you heat water to 100°C, it boils',
        },
      ],
      examples: [
        {
          sentence: 'If you heat ice, it melts.',
          explanation: 'Scientific fact that is always true',
        },
        {
          sentence: 'If it rains, the ground gets wet.',
          explanation: 'General truth about cause and effect',
        },
      ],
      tips: [
        'Both clauses use present simple',
        'Can replace "if" with "when"',
        'Used for facts, not possibilities',
      ],
    },
    exercises: [],
  },
  {
    id: 'cond-first',
    title: 'First Conditional',
    category: 'conditionals',
    level: 3,
    description: 'Talk about real possibilities in the future',
    requiredLevel: 3,
    xpReward: 70,
    coinReward: 14,
    conditionalType: 'first',
    structure: {
      ifClause: 'If + present simple',
      mainClause: 'will + base verb',
    },
    content: {
      introduction: 'The first conditional expresses real possibilities and probable future situations.',
      rules: [
        {
          id: 'first-rule-1',
          title: 'Structure',
          description: 'If + present simple, will + base verb',
          formula: 'If it rains, I will stay home',
        },
      ],
      examples: [
        {
          sentence: 'If you study hard, you will pass the exam.',
          explanation: 'Real possibility - likely to happen if condition is met',
        },
        {
          sentence: 'If she calls, I will answer.',
          explanation: 'Future action depending on a condition',
        },
      ],
      tips: [
        'If-clause: present simple',
        'Main clause: will + base verb',
        'Used for real, likely future situations',
      ],
    },
    exercises: [],
  },
];

// Subject-Verb Agreement Lessons
export const agreementLessons: GrammarLesson[] = [
  {
    id: 'sva-1',
    title: 'Basic Subject-Verb Agreement',
    category: 'subject-verb-agreement',
    level: 2,
    description: 'Make sure subjects and verbs agree in number',
    requiredLevel: 2,
    xpReward: 65,
    coinReward: 13,
    content: {
      introduction: 'Subjects and verbs must agree in number (singular or plural).',
      rules: [
        {
          id: 'sva-rule-1',
          title: 'Singular Subject',
          description: 'Singular subjects take singular verbs (adds -s)',
          formula: 'He/She/It + Verb+s',
        },
        {
          id: 'sva-rule-2',
          title: 'Plural Subject',
          description: 'Plural subjects take plural verbs (no -s)',
          formula: 'They/We + Verb',
        },
      ],
      examples: [
        {
          sentence: 'The dog barks loudly.',
          explanation: 'Singular subject (dog) + singular verb (barks)',
        },
        {
          sentence: 'The dogs bark loudly.',
          explanation: 'Plural subject (dogs) + plural verb (bark)',
        },
      ],
      tips: [
        'Singular subjects: add -s to the verb',
        'Plural subjects: use base form of verb',
        'Be careful with irregular verbs (is/are, has/have)',
      ],
    },
    exercises: [
      {
        id: 'sva-ex-1',
        type: 'multiple-choice',
        question: 'Choose the correct verb: "The cat ____ on the roof."',
        options: ['sit', 'sits', 'sitting', 'sitted'],
        correctAnswer: 'sits',
        explanation: 'Singular subject (cat) requires singular verb (sits)',
        difficulty: 'easy',
        points: 10,
      },
    ],
  },
];

// All lessons combined
export const allLessons: GrammarLesson[] = [
  ...svoLessons,
  ...tenseLessons,
  ...conditionalLessons,
  ...agreementLessons,
];
