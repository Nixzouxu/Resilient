const TelegramNotifier = require('./notifiers/TelegramNotifier');

class NotificationService {
    getNotifier(tenantConfig) {
        if (tenantConfig.telegram_chat_id) return new TelegramNotifier(tenantConfig);
        return null;
    }

    // Polymorphism: memanggil send() tanpa peduli tipe notifier spesifik
    async dispatch(alert, tenantConfig) {
        const notifier = this.getNotifier(tenantConfig);
        if (notifier) {
            await notifier.send(alert);
        } else {
            console.log('⚠️ Tidak ada channel notifikasi yang aktif untuk tenant ini.');
        }
    }
}

module.exports = new NotificationService(); // Singleton