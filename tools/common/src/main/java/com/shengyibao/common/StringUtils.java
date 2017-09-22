package com.shengyibao.common;

public class StringUtils extends org.apache.commons.lang3.StringUtils {

    public static final String BLANK = " ";

    public static final String LEFT_CN_PARENTHESIS = "（";

    public static final String RIGHT_CN_PARENTHESIS = "）";

    public static final String SLASH = "/";

    public static final String COMMA = ",";

    public static final String Q_MARK = "?";

    public static final String AND_MARK = "&";

    public static final String EQUAL_SIGN = "=";

    public static final String DOT = ".";

    public static final char CHAR_DOT = '.';

    public static final String UNDERLINE = "_";

    public static final String HTML_SPACE = "&nbsp;";

    public static final String MINUS_SIGN = "-";

    public static final String removeExtraBlank(String s) {
        return s.replaceAll("\\s{1,}", BLANK);
    }

    public static final String removeBlank(String s) {
        return s.replaceAll("\\s{1,}", EMPTY);
    }
}
