package com.shengyibao.common;

import java.util.UUID;

public class UUIDUtils {

	public static String getUUID() {
		return UUID.randomUUID().toString().replace("-", "");
	}

	/**
	 * 随机生成UUID
	 */
	public static String getRandomUUID() {
		UUID id = UUID.randomUUID();
		long mostSigBits = id.getMostSignificantBits();
		long leastSigBits = id.getLeastSignificantBits();
		return (digits(mostSigBits >> 32, 8) + digits(mostSigBits >> 16, 4) + digits(mostSigBits, 4)
				+ digits(leastSigBits >> 48, 4) + digits(leastSigBits, 12));
	}

	private static String digits(long val, int digits) {
		long hi = 1L << (digits * 4);
		return Long.toHexString(hi | (val & (hi - 1))).substring(1);
	}
}
