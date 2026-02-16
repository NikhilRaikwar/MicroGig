import { describe, it, expect } from "vitest";

// Mocking conversion logic typically found in contract.ts
const xlmToStroops = (xlm: number) => xlm * 10_000_000;
const stroopsToXlm = (stroops: number) => stroops / 10_000_000;

const mapStatus = (status: number) => {
    switch (status) {
        case 0: return "open";
        case 1: return "completed";
        default: return "unknown";
    }
};

describe("MicroGig Utility Tests", () => {
    it("should correctly convert XLM to Stroops", () => {
        expect(xlmToStroops(1)).toBe(10000000);
        expect(xlmToStroops(5.5)).toBe(55000000);
    });

    it("should correctly convert Stroops to XLM", () => {
        expect(stroopsToXlm(10000000)).toBe(1);
        expect(stroopsToXlm(50000000)).toBe(5);
    });

    it("should correctly map contract status integers to strings", () => {
        expect(mapStatus(0)).toBe("open");
        expect(mapStatus(1)).toBe("completed");
        expect(mapStatus(99)).toBe("unknown");
    });
});
