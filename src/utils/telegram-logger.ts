import { Telegraf } from "telegraf";
import { RateLimiter } from "limiter";

class TelegramLogger {
  private readonly bot: Telegraf;
  private readonly chatId: string;
  private readonly limiter: RateLimiter;
  private readonly sensitiveFields = [
    "password",
    "token",
    "authorization",
    "creditCard",
    "ssn",
    "apiKey",
  ];

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not defined");
    }

    this.chatId = process.env.TELEGRAM_CHAT_ID!;
    this.bot = new Telegraf(token);

    this.limiter = new RateLimiter({
      tokensPerInterval: 30,
      interval: "minute",
    });
  }

  async sendMessage(message: string): Promise<void> {
    try {
      const remainingMessages = await this.limiter.removeTokens(1);

      if (remainingMessages < 0) {
        console.warn("Telegram message rate limit exceeded");
        return;
      }

      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: "MarkdownV2",
      });
    } catch (error) {
      const err = error as Error;
      console.error("Failed to send Telegram message:", {
        error: err.message,
        stack: err.stack,
        originalMessage: message,
      });
    }
  }

  async logCritical(
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    const message = `🚨🚨 *CRITICAL ERROR* 🚨🚨\n\n${this.formatError(
      error,
      context
    )}`;
    await this.sendMessage(message);
  }

  async logError(
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    const message = `⚠️ *ERROR* ⚠️\n\n${this.formatError(error, context)}`;
    await this.sendMessage(message);
  }

  async logWarning(
    warning: string | Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    const message = `🔸 *WARNING* 🔸\n\n${
      typeof warning === "string" ? warning : this.formatError(warning, context)
    }`;
    await this.sendMessage(message);
  }

  async logInfo(
    info: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    let message = `ℹ️ *INFO* ℹ️\n\n${this.escapeMarkdownV2(info)}`;

    if (context) {
      const cleanContext = this.filterSensitiveData(context);
      message += `\n\n📌 *Details*:\n\`\`\`json\n${this.escapeMarkdownV2(
        JSON.stringify(cleanContext, null, 2)
      )}\n\`\`\``;
    }

    await this.sendMessage(message);
  }

  private filterSensitiveData(
    obj: Record<string, unknown>
  ): Record<string, unknown> {
    const cleanObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (
        this.sensitiveFields.some((field) => key.toLowerCase().includes(field))
      ) {
        cleanObj[key] = "***REDACTED***";
      } else if (typeof value === "object" && value !== null) {
        cleanObj[key] = this.filterSensitiveData(
          value as Record<string, unknown>
        );
      } else {
        cleanObj[key] = value;
      }
    }

    return cleanObj;
  }

  private escapeMarkdownV2(text: string): string {
    const escapeChars = "_*[]()~`>#+-=|{}.!";
    const pattern = new RegExp(`[${escapeChars.replace(/./g, "\\$&")}]`, "g");
    return text.replace(pattern, "\\$&");
  }

  private formatError(error: Error, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    let message = `🛑 *${this.escapeMarkdownV2(
      error.name
    )}* \\[${this.escapeMarkdownV2(timestamp)}\\]\n\n`;

    message += `🔹 *Message*: ${this.escapeMarkdownV2(error.message)}\n\n`;

    if (error.stack) {
      const stack = this.escapeMarkdownV2(error.stack)
        .replace(/\\n/g, "\n")
        .substring(0, 1000);
      message += `📋 *Stack Trace*:\n\`\`\`\n${stack}\n\`\`\`\n\n`;
    }

    if (context) {
      const cleanContext = this.filterSensitiveData(context);
      const contextStr = this.escapeMarkdownV2(
        JSON.stringify(cleanContext, null, 2)
      ).substring(0, 1000);
      message += `🌐 *Context*:\n\`\`\`json\n${contextStr}\n\`\`\`\n`;
    }

    return message;
  }
}

export const telegramLogger = new TelegramLogger();
