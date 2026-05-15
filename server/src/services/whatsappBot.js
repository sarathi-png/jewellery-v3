const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { toDataURL } = require('qrcode');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const { Writable } = require('stream');

const logFilter = new Writable({
  write(chunk, enc, cb) {
    try {
      const line = chunk.toString();
      if (
        line.includes('"msg":"failed to decrypt') ||
        line.includes('"msg":"transaction failed')
      ) {
        return cb();
      }
      process.stdout.write(chunk);
    } catch {
      process.stdout.write(chunk);
    }
    cb();
  }
});

const AUTH_DIR = path.join(__dirname, '..', '..', 'auth_info');
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

class WhatsAppBot {
  constructor() {
    this.sock = null;
    this.status = 'disconnected';
    this.qrCode = null;
    this.isConnecting = false;
    this.lastError = null;
    this.lastErrorAt = null;
    this.retryCount = 0;
    this.reconnectTimer = null;
    this._listeners = [];
    this._logger = pino({ level: 'error', name: 'whatsapp-bot' }, logFilter);
  }

  _setStatus(status, qrCode) {
    this.status = status;
    this.qrCode = qrCode || null;
  }

  _notify() {
    const data = { status: this.status, qrCode: this.qrCode };
    this._listeners.forEach(l => l(data));
  }

  onStatusChange(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  _resetRetries() {
    this.retryCount = 0;
  }

  async connect() {
    if (this.isConnecting) {
      console.log('[WhatsApp Bot] Already connecting, skipping');
      return;
    }
    this.isConnecting = true;
    this._setStatus('connecting');
    console.log('[WhatsApp Bot] Connecting...');

    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

      const { version } = await fetchLatestBaileysVersion();
      console.log('[WhatsApp Bot] Using WA version:', version.join('.'));

      this.sock = makeWASocket({
        auth: state,
        version,
        logger: this._logger,
        printQRInTerminal: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        shouldSyncHistoryMessage: () => false,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !this.sock?.authState?.creds?.registered) {
          toDataURL(qr, { scale: 6, margin: 1 }).then((url) => {
            this._setStatus('qr_ready', url);
            this._notify();
          }).catch((err) => {
            console.error('[WhatsApp Bot] QR generation error:', err);
          });
        }

        if (connection === 'open') {
          console.log('[WhatsApp Bot] Connected successfully');
          this._setStatus('connected');
          this.isConnecting = false;
          this._resetRetries();
          this._notify();
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;
          const isBadSession = statusCode === DisconnectReason.badSession;
          const isRestartRequired = statusCode === DisconnectReason.restartRequired;

          console.log('[WhatsApp Bot] Connection closed, reason:', {
            statusCode,
            isLoggedOut,
            isBadSession,
            isRestartRequired,
            error: lastDisconnect?.error?.message?.substring(0, 200),
          });

          this.sock = null;
          this._setStatus('disconnected');
          this.isConnecting = false;
          this._notify();

          if (isRestartRequired) {
            console.log('[WhatsApp Bot] Restart required, reconnecting...');
            this.reconnectTimer = setTimeout(() => this.connect(), 1000);
            return;
          }

          if (isLoggedOut || isBadSession) {
            console.log('[WhatsApp Bot] Auth invalid, clearing session.');
            if (this.reconnectTimer) {
              clearTimeout(this.reconnectTimer);
              this.reconnectTimer = null;
            }
            this.lastError = 'Session expired. Scan QR to reconnect.';
            this.lastErrorAt = new Date().toISOString();
            try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch {}
            return;
          }

          this.retryCount++;
          if (this.retryCount <= MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.min(this.retryCount, 3);
            console.log(`[WhatsApp Bot] Reconnecting in ${delay}ms (attempt ${this.retryCount}/${MAX_RETRIES})...`);
            this.reconnectTimer = setTimeout(() => this.connect(), delay);
          } else {
            console.log(`[WhatsApp Bot] Max retries (${MAX_RETRIES}) reached. Will not auto-reconnect. Click "Start Bot" to try again.`);
            this._setStatus('disconnected');
            this._notify();
          }
        }
      });

      this.sock.ev.on('messages.upsert', () => {});
    } catch (err) {
      const msg = err?.message || String(err);
      console.error('[WhatsApp Bot] Connection setup error:', msg);
      this.lastError = msg;
      this.lastErrorAt = new Date().toISOString();
      this._setStatus('error');
      this.isConnecting = false;
      this._notify();

      this.retryCount++;
      if (this.retryCount <= MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.min(this.retryCount, 3);
        console.log(`[WhatsApp Bot] Retrying in ${delay}ms (attempt ${this.retryCount}/${MAX_RETRIES})...`);
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
      }
    }
  }

  async sendMessage(to, message) {
    if (!this.sock || this.status !== 'connected') {
      throw new Error('WhatsApp bot not connected');
    }
    const clean = to.replace(/[^0-9]/g, '');
    if (!clean) throw new Error('Invalid phone number');
    const jid = `${clean}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text: message });
    return true;
  }

  async sendMessageToOwner(message, customerPhone) {
    try {
      const SiteSettings = require('../models/SiteSettings');
      const settings = await SiteSettings.findOne();
      if (!settings?.whatsappNumber) return;
      if (this.status !== 'connected') {
        console.log('[WhatsApp Bot] Not connected, skipping message to owner');
        return;
      }
      await this.sendMessage(settings.whatsappNumber, message);
      console.log('[WhatsApp Bot] Message sent to owner');
    } catch (err) {
      console.error('[WhatsApp Bot] Failed to send to owner:', err.message);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this._setStatus('disconnected');
    this.isConnecting = false;
    this._resetRetries();
    this._notify();
  }

  getStatus() {
    return {
      status: this.status,
      qrCode: this.status === 'qr_ready' ? this.qrCode : null,
      hasAuth: this.hasAuth(),
      lastError: this.lastError,
      lastErrorAt: this.lastErrorAt,
      retryCount: this.retryCount,
    };
  }

  hasAuth() {
    try {
      return fs.existsSync(path.join(AUTH_DIR, 'creds.json'));
    } catch {
      return false;
    }
  }

  async clearAuth() {
    this.disconnect();
    this.lastError = null;
    this.lastErrorAt = null;
    this._setStatus('disconnected');
    this._notify();
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    } catch {}
  }

  async init() {
    if (this.hasAuth()) {
      console.log('[WhatsApp Bot] Auth found, connecting...');
      await this.connect();
    } else {
      console.log('[WhatsApp Bot] No auth found. Start bot from admin panel to scan QR.');
    }
  }
}

const bot = new WhatsAppBot();
module.exports = bot;
