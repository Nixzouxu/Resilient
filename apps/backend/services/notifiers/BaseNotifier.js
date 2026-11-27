class BaseNotifier {
  constructor(tenantConfig = {}) {
    if (new.target === BaseNotifier) {
      throw new Error('BaseNotifier adalah abstract class dan tidak bisa diinstansiasi langsung.');
    }

    if (!tenantConfig || typeof tenantConfig !== 'object') {
      throw new Error('tenantConfig harus berupa object.');
    }

    this._tenantConfig = tenantConfig;
  }

  get tenantConfig() {
    return this._tenantConfig;
  }

  async send(_alert) {
    throw new Error("Method 'send(alert)' harus diimplementasikan oleh child class.");
  }
  formatWaktuWIB(rawTime) {
    const date = rawTime ? new Date(rawTime) : new Date();
    if (Number.isNaN(date.getTime())) return String(rawTime || '-');

    const formatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);

    return `${formatted.replace(/\./g, ':')} WIB`;
  }

  formatMessage(alert = {}) {
    const serviceName = alert.serviceName || `Service #${alert.serviceId ?? '-'}`;
    const status = alert.status || 'UNKNOWN';
    const waktu = this.formatWaktuWIB(alert.timestamp || alert.time || new Date().toISOString());
    const tenant = alert.tenantName || alert.tenant || alert.tenantId || '-';

    const lines = [
      `🚨 *ALERTA Penyusupan Suki pada: ${serviceName}*`,
      `• *Status:* ${status}`,
      `• *Waktu:* ${waktu}`,
      `• *Tenant:* ${tenant}`
    ];

    if (alert.action) {
      lines.push(`• *Detail:* ${alert.action}`);
    }

    return lines.join('\n');
  }
}

module.exports = BaseNotifier;