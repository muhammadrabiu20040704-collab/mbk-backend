export interface ILevelRequirement {
  coinsEarned: number;
  presentations: number;
  debates: number;
  followers: number;
  posts: number;
  comments: number;
  achievements: number;
}

export interface ILevelUnlocks {
  textMaxCharacters: number;
  videoMaxSeconds: number;
  maxImages: number;
}

export interface ILevelConfig {
  level: number;
  requirements: ILevelRequirement;
  unlocks: ILevelUnlocks;
}
