// Models & core types
export * from "./models.js";

// Chart of accounts (PCG)
export * from "./chart-of-accounts.js";

// Regime details & thresholds
export * from "./regime/regime-details.js";

// Threshold monitoring
export * from "./threshold/models.js";

// URSSAF
export * from "./urssaf/models.js";
export * from "./urssaf/rates.js";
export { isActivityType } from "./urssaf/rates.js";

// VAT
export * from "./vat/models.js";
export {
  type VatCode,
  isValidVatCode,
  isDomTomVatCode,
  type VatInfo,
  getVatInfo,
  hasVat,
  getVatRatePercentage,
} from "./vat/utils.js";
export * from "./vat/calculations.js";
export * from "./vat/rules.js";
export * from "./vat/formatting.js";
export * from "./vat/annexe-types.js";
export * from "./vat/annexe-a-models.js";
export * from "./vat/ter-models.js";
export * from "./vat/tic-models.js";

// Financial Statements
export * from "./financial-statements/index.js";

// Ports (interfaces for data access)
export * from "./ports/index.js";

// Bespoke (in-memory) data layers
export * from "./bespoke/index.js";

// Services
export {
  ThresholdMonitoringService,
  ThresholdMonitoringServiceLayer,
  type ThresholdMonitoringServiceInterface,
} from "./threshold/service.js";
export {
  UrssafService,
  UrssafServiceLayer,
  NoRevenueDataError,
  type UrssafServiceInterface,
} from "./urssaf/service.js";
export {
  VatService,
  VatServiceLayer,
  InvalidVatCodeError,
  type VatServiceInterface,
} from "./vat/service.js";

// VAT Declaration Generators (CA3/CA12)
export {
  Ca3GeneratorService,
  Ca3GeneratorServiceLayer,
  Ca3GenerationError,
  type Ca3GeneratorServiceInterface,
  type GenerateTerInput,
  type GenerateAnnexeAInput,
  type GenerateTicInput,
  Ca12GeneratorService,
  Ca12GeneratorServiceLayer,
  Ca12GenerationError,
  type Ca12GeneratorServiceInterface,
} from "./vat/declarations/index.js";
