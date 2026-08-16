/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as anyBills from "../anyBills.js";
import type * as billActions from "../billActions.js";
import type * as billDelivery from "../billDelivery.js";
import type * as bills from "../bills.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as doorBills from "../doorBills.js";
import type * as estimates from "../estimates.js";
import type * as nonGstBills from "../nonGstBills.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as publicBills from "../publicBills.js";
import type * as totals from "../totals.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  anyBills: typeof anyBills;
  billActions: typeof billActions;
  billDelivery: typeof billDelivery;
  bills: typeof bills;
  crons: typeof crons;
  customers: typeof customers;
  doorBills: typeof doorBills;
  estimates: typeof estimates;
  nonGstBills: typeof nonGstBills;
  payments: typeof payments;
  products: typeof products;
  publicBills: typeof publicBills;
  totals: typeof totals;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
