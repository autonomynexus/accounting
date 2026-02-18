import { Effect } from "effect";
import { EUR, monetary } from "monetary";
import { describe, expect, it } from "vitest";
import {
	validateDoubleEntry,
	buildJournalLinesFromTransaction,
	DoubleEntryValidationError,
	InvalidJournalLineError,
} from "../src/journal/index.js";
import { BANK_ACCOUNT, VAT_COLLECTED_ACCOUNT } from "../src/chart-of-accounts.js";

const m = (amount: number) => monetary({ amount, currency: EUR });

describe("validateDoubleEntry", () => {
	it("accepts valid balanced entry", async () => {
		const result = await Effect.runPromise(
			validateDoubleEntry([
				{ accountCode: "512", debitAmount: m(10000) },
				{ accountCode: "706", creditAmount: m(10000) },
			]),
		);
		expect(result).toBe(true);
	});

	it("rejects entry with fewer than 2 lines", async () => {
		const result = await Effect.runPromiseExit(
			validateDoubleEntry([{ accountCode: "512", debitAmount: m(10000) }]),
		);
		expect(result._tag).toBe("Failure");
	});

	it("rejects line with both debit and credit", async () => {
		const result = await Effect.runPromiseExit(
			validateDoubleEntry([
				{ accountCode: "512", debitAmount: m(10000), creditAmount: m(5000) },
				{ accountCode: "706", creditAmount: m(10000) },
			]),
		);
		expect(result._tag).toBe("Failure");
	});

	it("rejects unbalanced entry", async () => {
		const result = await Effect.runPromiseExit(
			validateDoubleEntry([
				{ accountCode: "512", debitAmount: m(10000) },
				{ accountCode: "706", creditAmount: m(8000) },
			]),
		);
		expect(result._tag).toBe("Failure");
	});

	it("rejects zero-total entry", async () => {
		const result = await Effect.runPromiseExit(
			validateDoubleEntry([
				{ accountCode: "512", debitAmount: m(0) },
				{ accountCode: "706", creditAmount: m(0) },
			]),
		);
		expect(result._tag).toBe("Failure");
	});
});

describe("buildJournalLinesFromTransaction", () => {
	it("builds revenue lines without VAT", () => {
		const lines = buildJournalLinesFromTransaction({
			amount: m(10000),
			pcgAccountCode: "706",
			isRevenue: true,
		});

		expect(lines).toHaveLength(2);
		expect(lines[0].accountCode).toBe(BANK_ACCOUNT);
		expect(lines[0].debitAmount?.amount).toBe(10000);
		expect(lines[1].accountCode).toBe("706");
		expect(lines[1].creditAmount?.amount).toBe(10000);
	});

	it("builds revenue lines with VAT", () => {
		const lines = buildJournalLinesFromTransaction({
			amount: m(12000),
			pcgAccountCode: "706",
			taxRate: { amount: 200, scale: 1000 },
			vatAmount: m(2000),
			isRevenue: true,
		});

		expect(lines).toHaveLength(3);
		expect(lines[0].accountCode).toBe(BANK_ACCOUNT);
		expect(lines[0].debitAmount?.amount).toBe(12000);
		expect(lines[1].accountCode).toBe("706");
		expect(lines[1].creditAmount?.amount).toBe(10000); // net
		expect(lines[2].accountCode).toBe(VAT_COLLECTED_ACCOUNT);
		expect(lines[2].creditAmount?.amount).toBe(2000);
	});

	it("builds expense lines without VAT", () => {
		const lines = buildJournalLinesFromTransaction({
			amount: m(5000),
			pcgAccountCode: "6061",
			isRevenue: false,
		});

		expect(lines).toHaveLength(2);
		expect(lines[0].accountCode).toBe("6061");
		expect(lines[0].debitAmount?.amount).toBe(5000);
		expect(lines[1].accountCode).toBe(BANK_ACCOUNT);
		expect(lines[1].creditAmount?.amount).toBe(5000);
	});

	it("builds expense lines with VAT", () => {
		const lines = buildJournalLinesFromTransaction({
			amount: m(12000),
			pcgAccountCode: "6061",
			taxRate: { amount: 200, scale: 1000 },
			vatAmount: m(2000),
			isRevenue: false,
		});

		expect(lines).toHaveLength(3);
		expect(lines[0].accountCode).toBe("6061");
		expect(lines[0].debitAmount?.amount).toBe(10000); // net
		// VAT deductible on ABS
		expect(lines[1].accountCode).toBe("44566");
		expect(lines[1].debitAmount?.amount).toBe(2000);
		expect(lines[2].accountCode).toBe(BANK_ACCOUNT);
		expect(lines[2].creditAmount?.amount).toBe(12000);
	});
});
