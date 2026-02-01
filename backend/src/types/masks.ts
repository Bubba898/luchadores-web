

export type partType = "eye" | "mouth" | "nose"

export type Mask = {
  id: number;
  sprite: string;
};

export type Part = {
  id: number;
  sprite: string;
  weight: number;
  type: partType;
};
