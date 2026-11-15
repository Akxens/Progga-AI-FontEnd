// Innovation Lab: API shapes (see backend modules/lab).

type Text = { en: string; bn: string };

export interface LabProject {
  id: string;
  emoji: string;
  color: string;
  subject: string;
  minGrade: number;
  minutes: number;
  title: Text;
  skill: Text;
  pitch: Text;
  learn: { en: string[]; bn: string[] };
}

export interface MyLabProject {
  id: string;
  title: string;
  subject: string;
  status: "active" | "solved" | "abandoned";
  currentStep: number;
  totalSteps: number;
  xpEarned: number;
  updatedAt: string;
}

export interface LabHome {
  projects: LabProject[];
  mine: MyLabProject[];
}
