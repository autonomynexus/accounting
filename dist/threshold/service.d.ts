import { Effect, Layer } from "effect";
import type { UserId } from "../models";
import { AccountingDataPort, type AccountingDataError } from "../ports";
import type { ActivityType } from "../urssaf/rates";
import { type ThresholdStatus } from "./models";
export type ThresholdMonitoringServiceInterface = {
    readonly getThresholdStatus: (userId: UserId, activityType: ActivityType, year: number, activityStartDate: Date) => Effect.Effect<ThresholdStatus, AccountingDataError>;
};
declare const ThresholdMonitoringService_base: import("effect/Context").TagClass<ThresholdMonitoringService, "@accounting/ThresholdMonitoringService", ThresholdMonitoringServiceInterface> & Effect.Tag.Proxy<ThresholdMonitoringService, ThresholdMonitoringServiceInterface> & {
    use: <X>(body: (_: ThresholdMonitoringServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | ThresholdMonitoringService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, ThresholdMonitoringService> : Effect.Effect<X, never, ThresholdMonitoringService>;
};
export declare class ThresholdMonitoringService extends ThresholdMonitoringService_base {
}
export declare const ThresholdMonitoringServiceLayer: Layer.Layer<ThresholdMonitoringService, never, AccountingDataPort>;
export {};
//# sourceMappingURL=service.d.ts.map