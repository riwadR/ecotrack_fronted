import { WasteType } from "./container";

export type Threshold = {
  type: WasteType;
  warningLevel: number;
  criticalLevel: number;
  updatedAt?: string;
};

export type UpdateThresholdPayload = {
  warningLevel: number;
  criticalLevel: number;
};