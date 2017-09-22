package com.shengyibao.third.jiguang.push.model.notification;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

public class AndroidNotification extends PlatformNotification {

	private static final Logger logger = LoggerFactory.getLogger(AndroidNotification.class);

	public static final String NOTIFICATION_ANDROID = "android";

	private static final String TITLE = "title";
	private static final String BUILDER_ID = "builder_id";
	private static final String INBOX = "inbox";
	private static final String STYLE = "style";
	private static final String BIG_TEXT = "big_text";
	private static final String BIG_PIC_PATH = "big_pic_path";
	private static final String PRIORITY = "priority";
	private static final String CATEGORY = "category";

	private final String title;
	private final int builderId;
	private int style = 0;
	private String big_text;
	private Object inbox;
	private String big_pic_path;
	private int priority;
	private String category;

	private AndroidNotification(
			Object alert, String title, int builderId, int style, String bigText, Object inbox,
			String bigPicPath, int priority, String category, Map<String, String> extras,
			Map<String, Number> numberExtras, Map<String, Boolean> booleanExtras,
			Map<String, JsonObject> jsonExtras) {
		super(alert, extras, numberExtras, booleanExtras, jsonExtras);

		this.title = title;
		this.builderId = builderId;
		this.style = style;
		this.big_text = bigText;
		this.inbox = inbox;
		this.big_pic_path = bigPicPath;
		this.priority = priority;
		this.category = category;
	}

	public static Builder newBuilder() {
		return new Builder();
	}

	public static AndroidNotification alert(String alert) {
		return newBuilder().setAlert(alert).build();
	}

	@Override
	public String getPlatform() {
		return NOTIFICATION_ANDROID;
	}

	protected Object getInbox() {
		return this.inbox;
	}

	protected void setInbox(Object inbox) {
		this.inbox = inbox;
	}

	@Override
	public JsonElement toJSON() {
		JsonObject json = super.toJSON().getAsJsonObject();

		if (builderId > 0) {
			json.add(BUILDER_ID, new JsonPrimitive(this.builderId));
		}
		if (null != title) {
			json.add(TITLE, new JsonPrimitive(title));
		}

		// 默认是 0
		if (0 != style) {
			json.add(STYLE, new JsonPrimitive(this.style));
		}

		if (null != big_text) {
			json.add(BIG_TEXT, new JsonPrimitive(this.big_text));
		}

		if (null != inbox) {
			if (inbox instanceof JsonObject) {
				json.add(INBOX, (JsonObject) inbox);
			}
		}

		if (null != big_pic_path) {
			json.add(BIG_PIC_PATH, new JsonPrimitive(big_pic_path));
		}

		// 默认为 0
		if (0 != priority) {
			json.add(PRIORITY, new JsonPrimitive(priority));
		}

		if (null != category) {
			json.add(CATEGORY, new JsonPrimitive(category));
		}

		return json;
	}

	public static class Builder extends PlatformNotification.Builder<AndroidNotification, Builder> {
		private String title;
		private int builderId;
		private int style = 0;
		private String big_text;
		private Object inbox;
		private String big_pic_path;
		private int priority;
		private String category;

		protected Builder getThis() {
			return this;
		}

		public Builder setTitle(String title) {
			this.title = title;
			return this;
		}

		public Builder setBuilderId(int builderId) {
			this.builderId = builderId;
			return this;
		}

		public Builder setAlert(Object alert) {
			this.alert = alert;
			return this;
		}

		public Builder setStyle(int style) {
			this.style = style;
			return this;
		}

		public Builder setBigText(String bigText) {
			this.big_text = bigText;
			return this;
		}

		public Builder setBigPicPath(String bigPicPath) {
			this.big_pic_path = bigPicPath;
			return this;
		}

		public Builder setPriority(int priority) {
			this.priority = priority;
			return this;
		}

		public Builder setCategory(String category) {
			this.category = category;
			return this;
		}

		public Builder setInbox(Object inbox) {
			if (null == inbox) {
				logger.warn("Null inbox. Throw away it.");
				return this;
			}
			this.inbox = inbox;
			return this;
		}

		public AndroidNotification build() {
			return new AndroidNotification(
					alert, title, builderId, style, big_text, inbox, big_pic_path, priority,
					category, extrasBuilder, numberExtrasBuilder, booleanExtrasBuilder,
					jsonExtrasBuilder);
		}
	}
}
