const BaseNotifier = require('./BaseNotifier');

class TelegramNotifier extends BaseNotifier {
    #botToken; // Private field (Encapsulation)

    constructor(tenantConfig) {
        super(tenantConfig); // Inheritance
        this.chatId = tenantConfig.telegram_chat_id;
        this.#botToken = process.env.TELEGRAM_BOT_TOKEN;
    }

    async send(alert) {
        if (!this.chatId || !this.#botToken) {
            console.warn('⚠️ Telegram chat ID atau Bot Token belum dikonfigurasi oleh suki.');
            return;
        }

        const message = this.formatMessage(alert);
        const url = `https://api.telegram.org/bot${this.#botToken}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: this.chatId, text: message, parse_mode: 'Markdown' })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            console.log(`✅ Alert Telegram berhasil dikirim ke ${this.chatId}`);
        } catch (error) {
            console.error('❌ Gagal mengirim alert Telegram, dasar suki liar:', error.message);
        }
    }
}
module.exports = TelegramNotifier;