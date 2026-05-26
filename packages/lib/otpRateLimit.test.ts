import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// checkRateLimitAndThrowError is the sole dependency — mock it before importing the module under test.
vi.mock("./checkRateLimitAndThrowError", () => ({
  checkRateLimitAndThrowError: vi.fn(),
}));

// piiHasher returns a fixed opaque string that does NOT contain the raw input.
// This lets "never logs raw PII" assertions be meaningful.
vi.mock("./server/PiiHasher", () => ({
  piiHasher: { hash: (_v: string) => "aaabbbccc000111222333444555666777888999" },
}));

// Suppress logger output in test output.
vi.mock("./logger", () => ({
  default: {
    getSubLogger: () => ({
      warn: vi.fn(),
    }),
  },
}));

import { checkRateLimitAndThrowError } from "./checkRateLimitAndThrowError";
import { checkOtpSendRateLimit } from "./otpRateLimit";

const mockRateLimit = checkRateLimitAndThrowError as Mock;

const baseOpts = {
  userId: 42,
  email: "user@example.com",
  ip: "1.2.3.4",
  channel: "email" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkOtpSendRateLimit — happy path", () => {
  it("calls all three rate-limit checks in order and resolves when none throw", async () => {
    mockRateLimit.mockResolvedValue(undefined);

    await expect(checkOtpSendRateLimit(baseOpts)).resolves.toBeUndefined();

    expect(mockRateLimit).toHaveBeenCalledTimes(3);
    // 1st: IP hourly
    expect(mockRateLimit).toHaveBeenNthCalledWith(1, {
      rateLimitingType: "otpIpHourly",
      identifier: "otp-ip:email:aaabbbccc000111222333444555666777888999",
    });
    // 2nd: per-user cooldown
    expect(mockRateLimit).toHaveBeenNthCalledWith(2, {
      rateLimitingType: "otpCooldown",
      identifier: `otp-cooldown:email:${baseOpts.userId}`,
    });
    // 3rd: per-user hourly hard lock
    expect(mockRateLimit).toHaveBeenNthCalledWith(3, {
      rateLimitingType: "otpHourly",
      identifier: `otp-hourly:email:${baseOpts.userId}`,
    });
  });
});

describe("checkOtpSendRateLimit — fail-fast order", () => {
  it("stops after the first check when the IP limit is exceeded", async () => {
    const rateLimitError = new Error("Rate limit exceeded");
    mockRateLimit.mockRejectedValueOnce(rateLimitError); // IP check throws

    await expect(checkOtpSendRateLimit(baseOpts)).rejects.toThrow("Rate limit exceeded");

    // Only the IP check should have been called.
    expect(mockRateLimit).toHaveBeenCalledTimes(1);
    expect(mockRateLimit).toHaveBeenCalledWith({
      rateLimitingType: "otpIpHourly",
      identifier: expect.stringContaining("otp-ip:"),
    });
  });

  it("stops after the second check when the per-user cooldown is exceeded", async () => {
    const rateLimitError = new Error("Rate limit exceeded");
    mockRateLimit
      .mockResolvedValueOnce(undefined) // IP passes
      .mockRejectedValueOnce(rateLimitError); // cooldown throws

    await expect(checkOtpSendRateLimit(baseOpts)).rejects.toThrow("Rate limit exceeded");

    expect(mockRateLimit).toHaveBeenCalledTimes(2);
    expect(mockRateLimit).toHaveBeenNthCalledWith(2, {
      rateLimitingType: "otpCooldown",
      identifier: `otp-cooldown:email:${baseOpts.userId}`,
    });
  });

  it("throws on the third check when the per-user hourly hard lock is hit", async () => {
    const rateLimitError = new Error("Rate limit exceeded");
    mockRateLimit
      .mockResolvedValueOnce(undefined) // IP passes
      .mockResolvedValueOnce(undefined) // cooldown passes
      .mockRejectedValueOnce(rateLimitError); // hourly throws

    await expect(checkOtpSendRateLimit(baseOpts)).rejects.toThrow("Rate limit exceeded");

    expect(mockRateLimit).toHaveBeenCalledTimes(3);
    expect(mockRateLimit).toHaveBeenNthCalledWith(3, {
      rateLimitingType: "otpHourly",
      identifier: `otp-hourly:email:${baseOpts.userId}`,
    });
  });
});

describe("checkOtpSendRateLimit — channel differentiation", () => {
  it("embeds channel=email in all identifiers", async () => {
    mockRateLimit.mockResolvedValue(undefined);
    await checkOtpSendRateLimit({ ...baseOpts, channel: "email" });

    for (const call of mockRateLimit.mock.calls) {
      expect((call[0] as { identifier: string }).identifier).toMatch(/email/);
    }
  });

  it("embeds channel=sms in all identifiers", async () => {
    mockRateLimit.mockResolvedValue(undefined);
    await checkOtpSendRateLimit({ ...baseOpts, channel: "sms" });

    for (const call of mockRateLimit.mock.calls) {
      expect((call[0] as { identifier: string }).identifier).toMatch(/sms/);
    }
  });

  it("email and sms produce distinct identifiers for the same user", async () => {
    mockRateLimit.mockResolvedValue(undefined);

    await checkOtpSendRateLimit({ ...baseOpts, channel: "email" });
    const emailIds = mockRateLimit.mock.calls.map((c) => (c[0] as { identifier: string }).identifier);

    vi.clearAllMocks();

    await checkOtpSendRateLimit({ ...baseOpts, channel: "sms" });
    const smsIds = mockRateLimit.mock.calls.map((c) => (c[0] as { identifier: string }).identifier);

    for (let i = 0; i < emailIds.length; i++) {
      expect(emailIds[i]).not.toEqual(smsIds[i]);
    }
  });
});

describe("checkOtpSendRateLimit — PII safety", () => {
  it("never passes raw email to the rate limiter", async () => {
    mockRateLimit.mockResolvedValue(undefined);
    await checkOtpSendRateLimit(baseOpts);

    for (const call of mockRateLimit.mock.calls) {
      const id = (call[0] as { identifier: string }).identifier;
      expect(id).not.toContain(baseOpts.email);
    }
  });

  it("never passes raw IP to the rate limiter", async () => {
    mockRateLimit.mockResolvedValue(undefined);
    await checkOtpSendRateLimit(baseOpts);

    for (const call of mockRateLimit.mock.calls) {
      const id = (call[0] as { identifier: string }).identifier;
      expect(id).not.toContain(baseOpts.ip);
    }
  });

  it("uses hashed IP for the IP-keyed identifier", async () => {
    mockRateLimit.mockResolvedValue(undefined);
    await checkOtpSendRateLimit(baseOpts);

    expect(mockRateLimit).toHaveBeenNthCalledWith(1, {
      rateLimitingType: "otpIpHourly",
      identifier: "otp-ip:email:aaabbbccc000111222333444555666777888999",
    });
  });
});

describe("checkOtpSendRateLimit — concurrent requests", () => {
  it("each concurrent call independently triggers all three checks", async () => {
    mockRateLimit.mockResolvedValue(undefined);

    const N = 5;
    await Promise.all(Array.from({ length: N }, () => checkOtpSendRateLimit(baseOpts)));

    // Each call makes exactly 3 checks → N×3 total.
    expect(mockRateLimit).toHaveBeenCalledTimes(N * 3);
  });
});
