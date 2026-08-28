import { ILevelConfig } from "./level.types.js";

export const LEVEL_CONFIG: ILevelConfig[] = [
  {
    level: 1,
    requirements: {
      coinsEarned: 0,
      presentations: 0,
      debates: 0,
      followers: 0,
      posts: 0,
      comments: 0,
      achievements: 0,
    },
    unlocks: {
      textMaxCharacters: 1000,
      videoMaxSeconds: 180,
      maxImages: 6,
    },
  },

  {
    level: 2,
    requirements: {
      coinsEarned: 2000,
      presentations: 5,
      debates: 3,
      followers: 100,
      posts: 10,
      comments: 20,
      achievements: 0,
    },
    unlocks: {
      textMaxCharacters: 1500,
      videoMaxSeconds: 180,
      maxImages: 6,
    },
  },

  {
    level: 3,
    requirements: {
      coinsEarned: 10000,
      presentations: 15,
      debates: 8,
      followers: 500,
      posts: 30,
      comments: 100,
      achievements: 1,
    },
    unlocks: {
      textMaxCharacters: 2000,
      videoMaxSeconds: 240,
      maxImages: 6,
    },
  },

  {
    level: 4,
    requirements: {
      coinsEarned: 30000,
      presentations: 30,
      debates: 15,
      followers: 1000,
      posts: 75,
      comments: 250,
      achievements: 3,
    },
    unlocks: {
      textMaxCharacters: 2500,
      videoMaxSeconds: 300,
      maxImages: 6,
    },
  },

  {
    level: 5,
    requirements: {
      coinsEarned: 75000,
      presentations: 50,
      debates: 25,
      followers: 2500,
      posts: 150,
      comments: 500,
      achievements: 5,
    },
    unlocks: {
      textMaxCharacters: 3000,
      videoMaxSeconds: 360,
      maxImages: 6,
    },
  },

  {
    level: 6,
    requirements: {
      coinsEarned: 150000,
      presentations: 75,
      debates: 40,
      followers: 5000,
      posts: 300,
      comments: 1000,
      achievements: 10,
    },
    unlocks: {
      textMaxCharacters: 5000,
      videoMaxSeconds: 600,
      maxImages: 6,
    },
  },
];
