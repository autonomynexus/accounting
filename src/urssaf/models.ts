import type { Monetary } from "monetary";
import type { Period } from "../models.js";
import type { ActivityType } from "./rates.js";

export type DeclarationFrequency = "monthly" | "quarterly";

export type ComputeUrssafDeclarationInput = {
  readonly period: Period;
  readonly activityType: ActivityType;
  readonly hasAcre: boolean;
  readonly hasVersementLiberatoire: boolean;
  readonly regimeCode: "micro" | "reel";
};

export type RevenueBreakdown = {
  readonly revenueTotal: Monetary<number>;
  readonly expenseTotal: Monetary<number>;
};

export type UrssafContributions = {
  readonly baseContribution: Monetary<number>;
  readonly cfpContribution: Monetary<number>;
  readonly versementLiberatoire: Monetary<number> | null;
  readonly totalContribution: Monetary<number>;
};

export type UrssafDeclarationResult = {
  readonly period: Period;
  readonly activityType: ActivityType;
  readonly hasAcre: boolean;
  readonly regimeCode: "micro" | "reel";
  readonly revenue: RevenueBreakdown;
  readonly contributions: UrssafContributions;
  readonly declarationBase: Monetary<number>;
};
