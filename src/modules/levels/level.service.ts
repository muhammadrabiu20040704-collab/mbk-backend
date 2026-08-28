import { LEVEL_CONFIG } from "./level.config.js";
import { ILevelConfig, ILevelRequirement } from "./level.types.js";

export interface IUserLevelProgress {
  coinsEarned: number;
  presentations: number;
  debates: number;
  followers: number;
  posts: number;
  comments: number;
  achievements: number;
}

export interface LevelProgressResult {
  currentLevel: number;
  progressPercentage: number;
  nextLevel: number | null;
  requirements: ILevelRequirement;
  progress: IUserLevelProgress;
}

class LevelService {
  calculateProgress(progress: IUserLevelProgress, levelConfig: ILevelConfig): number {
    const requirements = levelConfig.requirements;

    const percentages = Object.keys(requirements).map((key) => {
      const requirement = requirements[key as keyof ILevelRequirement];
      const current = progress[key as keyof IUserLevelProgress];

      // Ba a buƙatar wannan requirement a wannan level
      if (requirement === 0) {
        return 100;
      }

      // Kada percentage ya wuce 100
      return Math.min((current / requirement) * 100, 100);
    });

    const total = percentages.reduce((sum, percentage) => sum + percentage, 0);

    return Math.round(total / percentages.length);
  }
  getLevelProgress(progress: IUserLevelProgress, currentLevel: number): LevelProgressResult {
    const levelConfig = LEVEL_CONFIG.find((config) => config.level === currentLevel);

    if (!levelConfig) {
      throw new Error(`Level ${currentLevel} configuration not found`);
    }

    const progressPercentage = this.calculateProgress(progress, levelConfig);

    const nextLevelConfig = LEVEL_CONFIG.find((config) => config.level === currentLevel + 1);

    return {
      currentLevel,
      progressPercentage,
      nextLevel: nextLevelConfig?.level ?? null,
      requirements: levelConfig.requirements,
      progress,
    };
  }
}

export const levelService = new LevelService();
