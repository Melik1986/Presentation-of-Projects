/**
 * Interface for backend skill
 * Describes technology and proficiency level in percentage
 */
export interface BackendSkill {
  skill: string;
  score: number;
}

/**
 * Interface for infrastructure skill
 * Describes infrastructure tool and proficiency level in percentage
 */
export interface InfrastructureSkill {
  name: string;
  value: number;
}

/**
 * Interface for skills data
 * Contains arrays of backend and infrastructure skills
 */
export interface SkillsData {
  backend: BackendSkill[];
  infrastructure: InfrastructureSkill[];
}

/**
 * Interface for responsive breakpoints
 * Defines screen sizes for different devices
 */
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}
