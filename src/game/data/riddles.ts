import type { RiddleDefinition } from './types';

export const RIDDLES: RiddleDefinition[] = [
  {
    id: 'echo',
    prompt: 'I speak without a mouth and hear without ears. What am I?',
    choices: ['An echo', 'A shadow', 'The wind'],
    correctIndex: 0,
  },
  {
    id: 'map',
    prompt: 'I have cities, but no houses; forests, but no trees; rivers, but no water. What am I?',
    choices: ['A dream', 'A map', 'A painting'],
    correctIndex: 1,
  },
  {
    id: 'keyboard',
    prompt: 'I have keys but no locks. I have space but no room. What am I?',
    choices: ['A piano', 'A keyboard', 'A riddle book'],
    correctIndex: 1,
  },
  {
    id: 'clock',
    prompt: 'What has hands but cannot clap?',
    choices: ['A clock', 'A statue', 'A ghost'],
    correctIndex: 0,
  },
  {
    id: 'candle',
    prompt: 'I get shorter as I work. What am I?',
    choices: ['A pencil', 'A candle', 'A battery'],
    correctIndex: 1,
  },
  {
    id: 'towel',
    prompt: 'What gets wetter the more it dries?',
    choices: ['A towel', 'A sponge', 'Rain'],
    correctIndex: 0,
  },
  {
    id: 'stamp',
    prompt: 'What can travel all around the world while staying in one corner?',
    choices: ['A stamp', 'A coin', 'A compass'],
    correctIndex: 0,
  },
  {
    id: 'needle',
    prompt: 'What has one eye, but cannot see?',
    choices: ['A storm', 'A needle', 'A camera'],
    correctIndex: 1,
  },
];
