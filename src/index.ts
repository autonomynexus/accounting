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

// VAT
export * from "./vat/models.js";
export {
  type VatCode,
  isValidVatCode,
  type VatInfo,
  getVatInfo,
  hasVat,
} from "./vat/utils.js";
export * from "./vat/calculations.js";
export * from "./vat/rules.js";

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
