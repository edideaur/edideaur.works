import { Sun, Moon, Copy, Check } from 'lucide';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 20000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function initHighlightable() {
    document.querySelectorAll('.highlightable').forEach(bindHighlightCopy);
}

function bindHighlightCopy(codeBlock: Element) {
    if ((codeBlock as any).dataset.copyBound) return;
    (codeBlock as any).dataset.copyBound = '1';
    codeBlock.addEventListener('click', onHighlightClick);
}

function onHighlightClick(e: Event) {
    const el = e.currentTarget as HTMLElement;
    const text = resolveCopyText(el);
    navigator.clipboard.writeText(text).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1500);
    });
}

function resolveCopyText(el: HTMLElement): string {
    if (el.dataset.copy) return el.dataset.copy;
    const clone = el.cloneNode(true) as HTMLElement;
    const feedback = clone.querySelector('.copy-feedback');
    if (feedback) feedback.remove();
    return clone.innerText.trim();
}

document.addEventListener('click', onDocumentClick);

function onDocumentClick(e: Event) {
    const target = e.target as Element;
    const qrBtn = target.closest('.crypto-qr-btn');
    if (qrBtn) { toggleQr(qrBtn as HTMLElement); return; }

    const qrCopyBtn = target.closest('.crypto-qr-copy-btn');
    if (qrCopyBtn) { handleQrCopyClick(qrCopyBtn as HTMLElement); return; }

    const walletBtn = target.closest('.crypto-wallet');
    if (walletBtn) { handleWalletClick(walletBtn as HTMLElement); return; }
}

async function toggleQr(qrBtn: HTMLElement) {
    const address = qrBtn.dataset.address;
    const card = qrBtn.closest('.crypto-card');
    if (!card || !address) return;
    const drawer = card.querySelector('.crypto-qr-drawer') as HTMLElement | null;
    const holder = card.querySelector('.crypto-qr-canvas-holder') as HTMLElement | null;
    if (!drawer || !holder) return;

    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        qrBtn.setAttribute('aria-expanded', 'false');
        qrBtn.classList.remove('active');
    } else {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        qrBtn.setAttribute('aria-expanded', 'true');
        qrBtn.classList.add('active');

        if (!holder.hasChildNodes()) {
            if (!(window as any).QRCode) {
                try {
                    await loadScript('/js/qrcode.min.js');
                } catch {
                    holder.textContent = 'Failed to load QR generator.';
                    return;
                }
            }
            if ((window as any).QRCode) {
                new (window as any).QRCode(holder, {
                    text: address,
                    width: 160,
                    height: 160,
                    colorDark: '#0a0a0a',
                    colorLight: '#ffffff',
                    correctLevel: 2,
                });
            }
        }
    }
}

function copyToClipboard(text: string, onCopied: () => void) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopy(text, onCopied));
    } else {
        fallbackCopy(text, onCopied);
    }
}

function fallbackCopy(text: string, onCopied: () => void) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); onCopied(); } catch {}
    document.body.removeChild(ta);
}

function handleWalletClick(walletBtn: HTMLElement) {
    const address = (walletBtn as any).dataset.address;
    if (!address) return;
    copyToClipboard(address, () => {
        walletBtn.classList.add('copied');
        const textEl = walletBtn.querySelector('.crypto-copy-text');
        if (textEl) textEl.textContent = 'Copied!';
        const morphEl = walletBtn.querySelector('morph-icon') as any;
        if (morphEl && typeof morphEl.morphTo === 'function') {
            morphEl.morphTo(Check, 'bouncy');
        }
        setTimeout(() => {
            walletBtn.classList.remove('copied');
            if (textEl) textEl.textContent = 'Copy';
            if (morphEl && typeof morphEl.morphTo === 'function') {
                morphEl.morphTo(Copy, 'snappy');
            }
        }, 1500);
    });
}

function handleQrCopyClick(copyBtn: HTMLElement) {
    const address = (copyBtn as any).dataset.address;
    if (!address) return;
    copyToClipboard(address, () => {
        copyBtn.classList.add('copied');
        const span = copyBtn.querySelector('span');
        if (span) span.textContent = 'Copied!';
        const morphEl = copyBtn.querySelector('morph-icon') as any;
        if (morphEl && typeof morphEl.morphTo === 'function') {
            morphEl.morphTo(Check, 'bouncy');
        }
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            if (span) span.textContent = 'Copy Address';
            if (morphEl && typeof morphEl.morphTo === 'function') {
                morphEl.morphTo(Copy, 'snappy');
            }
        }, 1500);
    });
}

let cachedVisitorCount: string | null = null;

async function fetchVisitorCount() {
    const countElement = document.getElementById('visitor-count');
    if (!countElement) return;

    if (cachedVisitorCount !== null) {
        countElement.textContent = cachedVisitorCount;
        return;
    }

    const data = await fetchVisitorData();
    cachedVisitorCount = data ? `VISITORS: ${new Intl.NumberFormat().format(data.count)}` : 'VISITORS: --';
    countElement.textContent = cachedVisitorCount;
}

async function fetchVisitorData(): Promise<any | null> {
    try {
        const response = await fetchWithTimeout('https://121124.edideaur.works/edideaur.works/');
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

const LASTFM_USER = 'edideaur';
const LASTFM_API_KEY = '816cfe50ddeeb73c9987b85de5c19e71';
const LASTFM_CACHE_KEY = 'lastfm-track-cache';
const LASTFM_CACHE_TTL = 5 * 60 * 1000;
let lfmCurrentTrackInfo: any = {};
let lfmLastTrackKey: string | null = null;
let lfmLastTrackData: any = null;
let lfmPollingStarted = false;

function lfmUrl(method: string, extra = '') {
    return `https://ws.audioscrobbler.com/2.0/?method=${method}&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json${extra}`;
}
function rewriteLastfm(url: string) {
    if (!url) return url;
    return url.replace(/lastfm\.freetls\.fastly\.net\/i\/u\/[^/]+\/([a-f0-9]+)\.(?:png|jpe?g)/i, 'lastfm.freetls.fastly.net/i/u/111300x111300/$1.png');
}
function lfmFormatTimeAgo(uts: number | undefined): string {
    if (!uts) return 'Now playing';
    const diffSeconds = Math.floor((Date.now() / 1000) - uts);
    if (diffSeconds < 60) return 'Just now';
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
function lfmPickImage(imgs: any[]): string {
    const chosen = imgs.find((i: any) => i.size === 'extralarge') || imgs.at(-1);
    return chosen ? (chosen["#text"] || '') : '';
}
function lfmResolveImage(track: any): string {
    return rewriteLastfm(lfmPickImage(track.image || []));
}
function lfmMakeKey(track: any): string {
    return `${track.artist['#text']} ${track.name}`.replace(/\s+/g, '+');
}
function lfmTrackUts(track: any): any {
    const isNow = track['@attr'] && track['@attr'].nowplaying === 'true';
    return isNow ? null : (track.date ? track.date.uts : null);
}
function lfmHandleTrack(track: any) {
    const uts = lfmTrackUts(track);
    const key = lfmMakeKey(track);
    if (key === lfmLastTrackKey) {
        lfmCurrentTrackInfo.uts = uts;
        window.dispatchEvent(new CustomEvent('lfm:time-updated', { detail: { uts } }));
        return;
    }
    lfmLastTrackKey = key;
    lfmLastTrackData = track;
    lfmCurrentTrackInfo = {
        name: track.name,
        artist: track.artist['#text'],
        album: track.album['#text'],
        image: lfmResolveImage(track),
        url: track.url,
        uts,
    };
    window.dispatchEvent(new CustomEvent('lfm:track-changed', { detail: lfmCurrentTrackInfo }));
}
function lfmFetchNowPlaying() {
    fetchWithTimeout(lfmUrl('User.getrecenttracks', '&limit=1'))
        .then((res) => res.json())
        .then((data) => {
            const tracks = data.recenttracks?.track || [];
            if (!tracks.length) return;
            try { sessionStorage.setItem(LASTFM_CACHE_KEY, JSON.stringify({ track: tracks[0], ts: Date.now() })); } catch {}
            lfmHandleTrack(tracks[0]);
        })
        .catch((err) => console.warn('Failed to fetch now playing:', (err as Error).message));
}
function lfmLoadCache() {
    try {
        const raw = sessionStorage.getItem(LASTFM_CACHE_KEY);
        if (!raw) return;
        const { track, ts } = JSON.parse(raw);
        if (Date.now() - ts < LASTFM_CACHE_TTL) lfmHandleTrack(track);
    } catch {}
}
function lfmStartPolling() {
    if (lfmPollingStarted) return;
    lfmPollingStarted = true;
    lfmLoadCache();
    lfmFetchNowPlaying();
    setInterval(() => lfmFetchNowPlaying(), 15000);
}

let npArtCrossfadeTimer: number | null = null;

function crossfadeArtwork(newSrc: string) {
    const elArt = document.getElementById('np-art') as HTMLImageElement | null;
    if (!elArt) return;
    if (elArt.src === newSrc) return;

    if (!elArt.src || !elArt.complete || elArt.naturalWidth === 0) {
        elArt.src = newSrc;
        return;
    }

    let overlay = document.getElementById('np-art-overlay') as HTMLImageElement | null;
    if (!overlay) {
        const parent = elArt.parentElement;
        if (parent) {
            overlay = document.createElement('img');
            overlay.id = 'np-art-overlay';
            overlay.className = 'player-art-overlay';
            overlay.alt = '';
            overlay.crossOrigin = 'anonymous';
            parent.appendChild(overlay);
        }
    }

    if (!overlay) {
        elArt.src = newSrc;
        return;
    }

    if (npArtCrossfadeTimer !== null) {
        clearTimeout(npArtCrossfadeTimer);
        npArtCrossfadeTimer = null;
    }

    overlay.src = newSrc;
    const onLoaded = () => {
        if (!overlay) return;
        overlay.style.opacity = '1';
        npArtCrossfadeTimer = window.setTimeout(() => {
            elArt.src = newSrc;
            (elArt as any)._refreshTiltFaces?.();
            overlay.style.transition = 'none';
            overlay.style.opacity = '0';
            void overlay.offsetWidth;
            overlay.style.transition = '';
            npArtCrossfadeTimer = null;
        }, 850);
    };

    if (overlay.complete && overlay.naturalWidth > 0) {
        onLoaded();
    } else {
        overlay.onload = onLoaded;
        overlay.onerror = () => {
            elArt.src = newSrc;
        };
    }
}

function initMusic() {
    const container = document.getElementById('now-playing');
    if (!container) return;
    const elArt = document.getElementById('np-art') as HTMLImageElement | null;
    const elTrack = document.getElementById('np-track') as HTMLAnchorElement | null;
    const elArtist = document.getElementById('np-artist') as HTMLAnchorElement | null;
    const elAlbum = document.getElementById('np-album') as HTMLAnchorElement | null;
    const elTime = document.getElementById('np-time');
    if (!elArt) return;

    const textEls = [elTrack, elArtist, elAlbum, elTime];
    let renderedTrackKey: string | null = null;

    lfmStartPolling();

    function applyText(info: any) {
        if (elTrack) { elTrack.textContent = info.name; elTrack.href = info.url; }
        if (elArtist) { elArtist.textContent = info.artist; elArtist.href = `https://www.last.fm/music/${encodeURIComponent(info.artist)}`; }
        if (elAlbum) { elAlbum.textContent = info.album; elAlbum.href = `https://www.last.fm/music/${encodeURIComponent(info.artist)}/${encodeURIComponent(info.album)}`; }
        if (elTime) elTime.textContent = lfmFormatTimeAgo(info.uts);
    }

    function updateTrackUI(info: any, skipAnim: boolean) {
        container?.classList.remove('skeleton');

        if (skipAnim || !renderedTrackKey) {
            elArt!.src = info.image;
            applyText(info);
            return;
        }

        crossfadeArtwork(info.image);

        textEls.forEach((el) => {
            if (!el) return;
            el.classList.add('fade-out');
        });
        setTimeout(() => {
            applyText(info);
            textEls.forEach((el) => {
                if (!el) return;
                el.classList.remove('fade-out');
            });
        }, 350);
    }

    if (lfmCurrentTrackInfo.name) {
        renderedTrackKey = lfmLastTrackKey;
        updateTrackUI(lfmCurrentTrackInfo, true);
    }

    const onTrackChanged = (e: any) => {
        const info = e.detail;
        if (!info || !info.name) return;
        const key = lfmLastTrackKey;
        if (key === renderedTrackKey && !container.classList.contains('skeleton')) {
            if (elTime) elTime.textContent = lfmFormatTimeAgo(info.uts);
            return;
        }
        const isFirst = !renderedTrackKey;
        renderedTrackKey = key;
        updateTrackUI(info, isFirst);
    };

    const onTimeUpdated = (e: any) => {
        if (elTime && e.detail) elTime.textContent = lfmFormatTimeAgo(e.detail.uts);
    };

    window.addEventListener('lfm:track-changed', onTrackChanged);
    window.addEventListener('lfm:time-updated', onTimeUpdated);

    const musicTimerId = setInterval(() => {
        if (!document.getElementById('now-playing')) {
            clearInterval(musicTimerId);
            window.removeEventListener('lfm:track-changed', onTrackChanged);
            window.removeEventListener('lfm:time-updated', onTimeUpdated);
            return;
        }
        if (!lfmCurrentTrackInfo.name) return;
        const key = lfmLastTrackKey;
        if (key !== renderedTrackKey) {
            const isFirst = !renderedTrackKey;
            renderedTrackKey = key;
            updateTrackUI(lfmCurrentTrackInfo, isFirst);
        } else {
            if (elTime) elTime.textContent = lfmFormatTimeAgo(lfmCurrentTrackInfo.uts);
        }
    }, 4000);
}

function initChat() {
    const form = document.getElementById('chat-form') as HTMLFormElement | null;
    if (!form) return;
    const f = {
        form,
        name: form.querySelector('#chat-name') as HTMLInputElement,
        message: form.querySelector('#chat-message') as HTMLTextAreaElement,
        contact: form.querySelector('#chat-contact') as HTMLInputElement,
        avatar: form.querySelector('#chat-avatar') as HTMLInputElement,
        submit: form.querySelector('button[type="submit"]') as HTMLButtonElement,
    };
    restoreChatFields(f);
    form.addEventListener('submit', (e) => onChatSubmit(e, f));
    fetchMessages();
}

function restoreChatFields(f: any) {
    const name = localStorage.getItem('chat-name');
    const contact = localStorage.getItem('chat-contact');
    const avatar = localStorage.getItem('chat-avatar');
    if (name) f.name.value = name;
    if (contact) f.contact.value = contact;
    if (avatar) f.avatar.value = avatar;
}

function onChatSubmit(e: Event, f: any) {
    e.preventDefault();
    const name = f.name.value.trim();
    const message = f.message.value.trim();
    const contact = f.contact.value.trim();
    const avatar = f.avatar.value.trim();
    if (!validateChatInput(name, message, f.submit)) return;
    persistChatFields(name, contact, avatar);
    sendChatMessage(f, name, message, contact, avatar);
}

function validateChatInput(name: string, message: string, _submitBtn: HTMLButtonElement): boolean {
    const error = chatInputError(name, message);
    if (error) { alert(error); return false; }
    return true;
}

function chatInputError(name: string, message: string): string | null {
    if (!hasNameAndMessage(name, message)) return 'Name and message are required';
    if (!isValidName(name)) return 'Name must be between 2 and 100 characters';
    if (!isValidMessage(message)) return 'Message must be between 1 and 1000 characters';
    return null;
}

function hasNameAndMessage(name: string, message: string): boolean {
    return !!name && !!message;
}

function isValidName(name: string): boolean {
    return name.length >= 2 && name.length <= 100;
}

function isValidMessage(message: string): boolean {
    return message.length >= 1 && message.length <= 1000;
}

function persistChatFields(name: string, contact: string, avatar: string) {
    localStorage.setItem('chat-name', name);
    if (contact) localStorage.setItem('chat-contact', contact);
    if (avatar) localStorage.setItem('chat-avatar', avatar);
}

async function sendChatMessage(f: any, name: string, message: string, contact: string, avatar: string) {
    f.submit.disabled = true;
    f.submit.textContent = 'SENDING...';
    try {
        await postChatMessage(name, message, contact, avatar);
        f.message.value = '';
        await fetchMessages();
        scrollChatToTop();
    } catch (error) {
        alert('Error: ' + (error as Error).message);
    } finally {
        f.submit.disabled = false;
        f.submit.textContent = 'SEND';
    }
}

function scrollChatToTop() {
    const c = document.getElementById('chat-messages');
    if (c) c.scrollTop = 0;
}

function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = decodeEntities(text);
    return div.innerHTML;
}

function avatarPicture(url: string): string {
    return `<img class="chat-avatar" alt="" src="${escapeHtml(url)}" loading="lazy" decoding="async">`;
}

function renderMessage(msg: any): string {
    const avatarHtml = buildAvatarHtml(msg.avatar);
    const contactHtml = buildContactHtml(msg.contact);
    return `
        <div class="chat-message">
            <div class="chat-header">
                ${avatarHtml}
                <span class="chat-name">${escapeHtml(msg.name)}</span>
                <span class="chat-time">${formatChatTimeAgo(msg.sent_at)}</span>
            </div>
            <div class="chat-text">${escapeHtml(msg.message)}</div>
            ${contactHtml}
        </div>`;
}

function buildAvatarHtml(avatar?: string): string {
    if (!avatar || avatar.trim() === '') return '';
    return avatarPicture(avatar);
}

function buildContactHtml(contact?: string): string {
    if (!contact || contact.trim() === '') return '';
    const href = isEmail(contact) ? 'mailto:' + contact : contact;
    return `<div class="chat-contact">→ <a href="${href}" target="_blank" rel="noopener">${escapeHtml(contact)}</a></div>`;
}

function isEmail(contact: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
}

function formatChatTimeAgo(timestamp: any): string {
    if (!timestamp) return '';
    const sentMs = parseChatTimestamp(timestamp);
    if (isNaN(sentMs)) return '';
    return bucketChatTime(sentMs);
}

function parseChatTimestamp(timestamp: any): number {
    const normalized = String(timestamp).replace(/(\.\d{3})\d+/, '$1');
    return new Date(normalized).getTime();
}

function bucketChatTime(sentMs: number): string {
    const diffMs = Date.now() - sentMs;
    const parts = [
        { max: 60000, fn: () => 'now' },
        { max: 3600000, fn: () => `${Math.floor(diffMs / 60000)}m` },
        { max: 86400000, fn: () => `${Math.floor(diffMs / 3600000)}h` },
        { max: 604800000, fn: () => `${Math.floor(diffMs / 86400000)}d` },
    ];
    for (const p of parts) {
        if (diffMs < p.max) return p.fn();
    }
    return new Date(sentMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function fetchMessages() {
    const containerEl = document.getElementById('chat-messages');
    if (!containerEl) return;
    const messages = await fetchChatMessages();
    if (!messages) { containerEl.innerHTML = '<div class="chat-error">Failed to load messages</div>'; return; }
    if (messages.length === 0) containerEl.innerHTML = '<div class="chat-empty">No messages yet...</div>';
    else containerEl.innerHTML = messages.map(renderMessage).join('');
}

async function fetchChatMessages(): Promise<any[] | null> {
    try {
        const response = await fetchWithTimeout('https://chatbox.edideaur.works/api/messages');
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

async function postChatMessage(name: string, message: string, contact = '', avatar = '') {
    const response = await fetchWithTimeout('https://chatbox.edideaur.works/api/messages/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), contact: contact.trim(), avatar: avatar.trim() }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to post message');
    }
    return response.json();
}

function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
}

function syncImageSquareState(img: HTMLImageElement) {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        if (img.naturalWidth === img.naturalHeight) {
            img.style.aspectRatio = '1 / 1';
            img.style.objectFit = 'cover';
        }
    }
}

interface TiltFaces {
    top: HTMLCanvasElement;
    bottom: HTMLCanvasElement;
    left: HTMLCanvasElement;
    right: HTMLCanvasElement;
}

function updateSideFaceCanvases(img: HTMLImageElement, faces: TiltFaces, depth: number) {
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;

    try {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const D = Math.max(6, depth);
        const d1 = Math.round(D / 3);
        const d2 = Math.round(D / 3);
        const d3 = D - d1 - d2;

        faces.top.width = nw;
        faces.top.height = D;
        const ctxT = faces.top.getContext('2d');
        if (ctxT) {
            ctxT.imageSmoothingEnabled = false;
            ctxT.drawImage(img, 0, 0, nw, 1, 0, D - d1, nw, d1);
            ctxT.drawImage(img, 0, 0, nw, 1, 0, d3, nw, d2);
            ctxT.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctxT.fillRect(0, d3, nw, d2);
            ctxT.drawImage(img, 0, 0, nw, 1, 0, 0, nw, d3);
            ctxT.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctxT.fillRect(0, 0, nw, d3);
        }

        faces.bottom.width = nw;
        faces.bottom.height = D;
        const ctxB = faces.bottom.getContext('2d');
        if (ctxB) {
            ctxB.imageSmoothingEnabled = false;
            ctxB.drawImage(img, 0, nh - 1, nw, 1, 0, 0, nw, d1);
            ctxB.drawImage(img, 0, nh - 1, nw, 1, 0, d1, nw, d2);
            ctxB.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctxB.fillRect(0, d1, nw, d2);
            ctxB.drawImage(img, 0, nh - 1, nw, 1, 0, d1 + d2, nw, d3);
            ctxB.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctxB.fillRect(0, d1 + d2, nw, d3);
        }

        faces.left.width = D;
        faces.left.height = nh;
        const ctxL = faces.left.getContext('2d');
        if (ctxL) {
            ctxL.imageSmoothingEnabled = false;
            ctxL.drawImage(img, 0, 0, 1, nh, D - d1, 0, d1, nh);
            ctxL.drawImage(img, 0, 0, 1, nh, d3, 0, d2, nh);
            ctxL.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctxL.fillRect(d3, 0, d2, nh);
            ctxL.drawImage(img, 0, 0, 1, nh, 0, 0, d3, nh);
            ctxL.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctxL.fillRect(0, 0, d3, nh);
        }

        faces.right.width = D;
        faces.right.height = nh;
        const ctxR = faces.right.getContext('2d');
        if (ctxR) {
            ctxR.imageSmoothingEnabled = false;
            ctxR.drawImage(img, nw - 1, 0, 1, nh, 0, 0, d1, nh);
            ctxR.drawImage(img, nw - 1, 0, 1, nh, d1, 0, d2, nh);
            ctxR.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctxR.fillRect(d1, 0, d2, nh);
            ctxR.drawImage(img, nw - 1, 0, 1, nh, d1 + d2, 0, d3, nh);
            ctxR.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctxR.fillRect(d1 + d2, 0, d3, nh);
        }
    } catch {
        [faces.top, faces.bottom, faces.left, faces.right].forEach((cvs) => {
            const ctx = cvs.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#333';
                ctx.fillRect(0, 0, cvs.width, cvs.height);
            }
        });
    }
}

function setSlabDepth(slab: HTMLElement, depth: number) {
    const back = slab.querySelector('.tilt-slab-back') as HTMLElement;
    if (back) back.style.transform = depth > 0 ? `translateZ(-${depth}px)` : 'translateZ(0)';
    const top = slab.querySelector('.tilt-face-top') as HTMLElement;
    if (top) top.style.height = `${depth}px`;
    const bottom = slab.querySelector('.tilt-face-bottom') as HTMLElement;
    if (bottom) bottom.style.height = `${depth}px`;
    const left = slab.querySelector('.tilt-face-left') as HTMLElement;
    if (left) left.style.width = `${depth}px`;
    const right = slab.querySelector('.tilt-face-right') as HTMLElement;
    if (right) right.style.width = `${depth}px`;
}

function setupTiltSlab(img: HTMLImageElement, depth: number): HTMLElement | null {
    if (img.parentElement?.classList.contains('tilt-slab') || img.parentElement?.classList.contains('player-art-front')) {
        const slab = (img.closest('.tilt-slab') || img.parentElement) as HTMLElement;
        const faces = (slab as any)._tiltFaces as TiltFaces | undefined;
        if (faces) updateSideFaceCanvases(img, faces, depth);
        return slab;
    }

    const parent = img.parentElement;
    if (!parent) return null;

    const slab = document.createElement('div');
    slab.className = 'tilt-slab';

    const isAvatar = img.classList.contains('hero-avatar');
    const isPlayer = img.classList.contains('player-art');
    const isBadge = img.closest('.badge-grid') !== null;

    if (isAvatar) {
        slab.classList.add('tilt-slab-avatar');
    } else if (isPlayer) {
        slab.classList.add('tilt-slab-player');
    } else {
        slab.classList.add('tilt-slab-badge');
    }

    const back = document.createElement('div');
    back.className = 'tilt-slab-back';

    const faceTop = document.createElement('canvas');
    faceTop.className = 'tilt-face tilt-face-top';

    const faceBottom = document.createElement('canvas');
    faceBottom.className = 'tilt-face tilt-face-bottom';

    const faceLeft = document.createElement('canvas');
    faceLeft.className = 'tilt-face tilt-face-left';

    const faceRight = document.createElement('canvas');
    faceRight.className = 'tilt-face tilt-face-right';

    parent.insertBefore(slab, img);
    slab.appendChild(back);
    slab.appendChild(faceTop);
    slab.appendChild(faceBottom);
    slab.appendChild(faceLeft);
    slab.appendChild(faceRight);

    if (isPlayer) {
        const frontWrap = document.createElement('div');
        frontWrap.className = 'tilt-slab-front player-art-front';
        frontWrap.appendChild(img);
        img.classList.add('player-art-base');

        let overlay = document.getElementById('np-art-overlay') as HTMLImageElement | null;
        if (!overlay) {
            overlay = document.createElement('img');
            overlay.id = 'np-art-overlay';
            overlay.className = 'player-art-overlay';
            overlay.alt = '';
            overlay.crossOrigin = 'anonymous';
        }
        frontWrap.appendChild(overlay);
        slab.appendChild(frontWrap);
    } else {
        slab.appendChild(img);
        img.classList.add('tilt-slab-front');
    }

    const faces: TiltFaces = { top: faceTop, bottom: faceBottom, left: faceLeft, right: faceRight };
    (slab as any)._tiltFaces = faces;

    const refresh = () => updateSideFaceCanvases(img, faces, depth);
    (img as any)._refreshTiltFaces = refresh;

    if (img.complete && img.naturalWidth > 0) {
        refresh();
    }
    img.addEventListener('load', refresh);

    setSlabDepth(slab, 0);

    return slab;
}

function initTilt() {
    if (!(window as any).VanillaTilt) return;
    const imgs = Array.from(
        document.querySelectorAll('.hero-avatar, .player-art, .badge-grid img')
    ) as HTMLImageElement[];

    for (const img of imgs) {
        syncImageSquareState(img);
        const isBadge = img.closest('.badge-grid') !== null;
        const maxDepth = isBadge ? 12 : 22;
        const maxTilt = 18;

        const slab = setupTiltSlab(img, maxDepth);
        if (!slab) continue;

        if ((slab as any).vanillaTilt) continue;

        (window as any).VanillaTilt.init(slab, {
            max: maxTilt,
            speed: 400,
            perspective: 800,
            scale: isBadge ? 1.05 : 1.03,
            reverse: true,
        });

        slab.addEventListener('mouseenter', () => {
            setSlabDepth(slab, maxDepth);
        });

        slab.addEventListener('mouseleave', () => {
            setSlabDepth(slab, 0);
        });
    }
}

const MUSIC_CDN = 'https://music.edideaur.works/';
const MUSIC_INDEX_URL = MUSIC_CDN + 'index.json';
const CROSSFADE_DURATION_MS = 5000;
const MUSIC_TARGET_VOLUME = 0.7;

interface MusicManifest {
    paths: {
        waveforms?: { dir: string; ext: string };
        audio: Record<string, { dir: string; ext: string; avg_mb?: number }>;
        images: Record<string, { dir: string; ext: string }>;
    };
    albums: {
        name: string;
        artist: string;
        cover: string;
        year: string;
        tracks: {
            name: string;
            title: string;
            artist: string;
            duration: number;
            track: number;
        }[];
    }[];
}

interface MusicTrack {
    audioUrl: string;
    artUrl: string;
    title: string;
    artist: string;
    album: string;
    duration?: number;
}

let mbTracks: MusicTrack[] = [];
let mbIndex = -1;
let mbAudio: HTMLAudioElement | null = null;
let mbFadingAudio: HTMLAudioElement | null = null;
let mbFadeTimer: number | null = null;
let mbShuffleOrder: number[] = [];

function selectAudioFormat(audioPaths: Record<string, { dir: string; ext: string }>): { dir: string; ext: string } | null {
    const testAudio = document.createElement('audio');
    const preferences = [
        { key: 'opus', mime: 'audio/ogg; codecs="opus"' },
        { key: 'aac', mime: 'audio/mp4; codecs="mp4a.40.2"' },
        { key: 'mp3', mime: 'audio/mpeg' },
        { key: 'flac', mime: 'audio/flac' },
    ];
    for (const pref of preferences) {
        if (audioPaths[pref.key] && testAudio.canPlayType(pref.mime) !== '') {
            return audioPaths[pref.key];
        }
    }
    return audioPaths.opus || audioPaths.aac || audioPaths.mp3 || Object.values(audioPaths)[0] || null;
}

function selectImageFormat(imagePaths: Record<string, { dir: string; ext: string }>): { dir: string; ext: string } | null {
    return imagePaths.webp || imagePaths.jpg || Object.values(imagePaths)[0] || null;
}

async function mbLoadIndex() {
    if (mbTracks.length) return;
    try {
        const res = await fetchWithTimeout(MUSIC_INDEX_URL);
        const data: MusicManifest = await res.json();

        const audioFmt = selectAudioFormat(data.paths.audio);
        const imgFmt = selectImageFormat(data.paths.images);
        if (!audioFmt || !imgFmt) return;

        const tracks: MusicTrack[] = [];
        for (const album of data.albums) {
            const artUrl = `${MUSIC_CDN}${imgFmt.dir}/${encodeURIComponent(album.cover)}.${imgFmt.ext}`;
            for (const track of album.tracks) {
                tracks.push({
                    audioUrl: `${MUSIC_CDN}${audioFmt.dir}/${encodeURIComponent(track.name)}.${audioFmt.ext}`,
                    artUrl,
                    title: track.title,
                    artist: track.artist || album.artist,
                    album: album.name,
                    duration: track.duration,
                });
            }
        }

        mbTracks = tracks;
        mbShuffleOrder = Array.from({ length: mbTracks.length }, (_, i) => i);
        for (let i = mbShuffleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mbShuffleOrder[i], mbShuffleOrder[j]] = [mbShuffleOrder[j], mbShuffleOrder[i]];
        }
    } catch (e) {
        console.warn('Music bar: failed to load index', e);
    }
}

let mbArtCrossfadeTimer: number | null = null;

function applyMusicBarArt(imageUrl: string, smooth: boolean) {
    const elCurr = document.getElementById('mb-art-curr') as HTMLImageElement | null;
    const elNext = document.getElementById('mb-art-next') as HTMLImageElement | null;
    if (!elCurr || !elNext) return;
    if (elCurr.src === imageUrl) return;

    if (mbArtCrossfadeTimer !== null) {
        clearTimeout(mbArtCrossfadeTimer);
        mbArtCrossfadeTimer = null;
    }

    if (!smooth || !elCurr.src || !elCurr.complete || elCurr.naturalWidth === 0) {
        elCurr.src = imageUrl;
        elNext.style.transition = 'none';
        elNext.style.opacity = '0';
        void elNext.offsetWidth;
        elNext.style.transition = '';
        return;
    }

    elNext.src = imageUrl;
    const onLoaded = () => {
        elNext.style.opacity = '1';
        mbArtCrossfadeTimer = window.setTimeout(() => {
            elCurr.src = imageUrl;
            elNext.style.transition = 'none';
            elNext.style.opacity = '0';
            void elNext.offsetWidth;
            elNext.style.transition = '';
            mbArtCrossfadeTimer = null;
        }, 850);
    };

    if (elNext.complete && elNext.naturalWidth > 0) {
        onLoaded();
    } else {
        elNext.onload = onLoaded;
        elNext.onerror = () => {
            elCurr.src = imageUrl;
        };
    }
}

function applyMusicBarTrack(track: MusicTrack, smooth: boolean) {
    applyMusicBarArt(track.artUrl, smooth);
    const label = `${track.artist} - ${track.title}`;
    const artWrap = document.getElementById('mb-art-wrap');
    if (artWrap) {
        artWrap.setAttribute('title', label);
        artWrap.setAttribute('aria-label', `Play / Pause: ${label}`);
    }
    const elCurr = document.getElementById('mb-art-curr') as HTMLImageElement | null;
    if (elCurr) {
        elCurr.alt = label;
    }
    if ('mediaSession' in navigator) {
        try {
            const isWebp = track.artUrl.endsWith('.webp');
            const type = isWebp ? 'image/webp' : 'image/jpeg';
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: [
                    { src: track.artUrl, sizes: '96x96', type },
                    { src: track.artUrl, sizes: '128x128', type },
                    { src: track.artUrl, sizes: '192x192', type },
                    { src: track.artUrl, sizes: '256x256', type },
                    { src: track.artUrl, sizes: '384x384', type },
                    { src: track.artUrl, sizes: '512x512', type },
                ],
            });
        } catch {}
    }
}

function updateMediaSessionPositionState(audio: HTMLAudioElement) {
    if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;
    const dur = audio.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    try {
        navigator.mediaSession.setPositionState({
            duration: Math.max(0, dur),
            playbackRate: audio.playbackRate || 1,
            position: Math.min(Math.max(0, audio.currentTime), dur),
        });
    } catch {}
}

function stopFadingAudio() {
    if (mbFadeTimer !== null) {
        clearInterval(mbFadeTimer);
        mbFadeTimer = null;
    }
    if (mbFadingAudio) {
        try {
            mbFadingAudio.pause();
            mbFadingAudio.src = '';
            mbFadingAudio.removeAttribute('src');
        } catch {}
        mbFadingAudio = null;
    }
}

function attachTrackListeners(audio: HTMLAudioElement) {
    let triggeredAutoCrossfade = false;
    let lastPositionUpdate = 0;

    audio.addEventListener('play', () => {
        if (audio === mbAudio && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
            updateMediaSessionPositionState(audio);
        }
    });

    audio.addEventListener('pause', () => {
        if (audio === mbAudio && !mbFadingAudio && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
            updateMediaSessionPositionState(audio);
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (audio === mbAudio) {
            updateMediaSessionPositionState(audio);
        }
    });

    audio.addEventListener('seeked', () => {
        if (audio === mbAudio) {
            updateMediaSessionPositionState(audio);
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (audio === mbAudio && !mbFadingAudio) {
            const now = performance.now();
            if (now - lastPositionUpdate > 1000) {
                lastPositionUpdate = now;
                updateMediaSessionPositionState(audio);
            }
            if (!triggeredAutoCrossfade && audio.duration > 15 && audio.currentTime >= audio.duration - 5) {
                triggeredAutoCrossfade = true;
                skipTrack(1);
            }
        }
    });

    audio.addEventListener('ended', () => {
        if (audio === mbAudio && !mbFadingAudio) {
            skipTrack(1);
        }
    });
}

function switchTrackWithCrossfade(newSrc: string, wasPlaying: boolean) {
    stopFadingAudio();

    if (wasPlaying && mbAudio && !mbAudio.paused) {
        const outgoing = mbAudio;
        mbFadingAudio = outgoing;

        const incoming = new Audio();
        incoming.preload = 'auto';
        incoming.src = newSrc;
        incoming.volume = 0;
        attachTrackListeners(incoming);
        mbAudio = incoming;
        incoming.play().catch(() => {});

        const startTime = performance.now();
        const startOutVol = outgoing.volume;

        mbFadeTimer = window.setInterval(() => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(1, elapsed / CROSSFADE_DURATION_MS);

            if (mbFadingAudio) {
                mbFadingAudio.volume = Math.max(0, startOutVol * (1 - progress));
            }
            if (mbAudio) {
                mbAudio.volume = Math.min(MUSIC_TARGET_VOLUME, MUSIC_TARGET_VOLUME * progress);
            }

            if (progress >= 1) {
                stopFadingAudio();
                if (mbAudio) mbAudio.volume = MUSIC_TARGET_VOLUME;
            }
        }, 40);
    } else {
        if (!mbAudio) {
            mbAudio = new Audio();
            attachTrackListeners(mbAudio);
        }
        mbAudio.src = newSrc;
        mbAudio.load();
        mbAudio.volume = MUSIC_TARGET_VOLUME;
        mbAudio.play().catch(() => {});
    }
}

function skipTrack(dir: number) {
    if (!mbTracks.length) return;
    const wasPlaying = Boolean(mbAudio && !mbAudio.paused);
    mbIndex = (mbIndex + dir + mbShuffleOrder.length) % mbShuffleOrder.length;

    const track = mbTracks[mbShuffleOrder[mbIndex]];
    if (!track) return;

    applyMusicBarTrack(track, true);
    switchTrackWithCrossfade(track.audioUrl, wasPlaying);
}

function initMusicBar() {
    const bar = document.getElementById('music-bar');
    if (!bar) return;

    const artWrap = document.getElementById('mb-art-wrap');
    const elCurr = document.getElementById('mb-art-curr') as HTMLImageElement | null;
    const btnPrev = document.getElementById('mb-prev');
    const btnNext = document.getElementById('mb-next');

    if (!artWrap || !elCurr || !btnPrev || !btnNext) return;
    if ((bar as any)._mbBound) return;
    (bar as any)._mbBound = true;

    mbLoadIndex().then(() => {
        if (!mbTracks.length) return;
        bar.style.display = '';
        if (mbIndex < 0) {
            mbIndex = 0;
            const track = mbTracks[mbShuffleOrder[mbIndex]];
            if (track) {
                applyMusicBarTrack(track, false);
                if (!mbAudio) {
                    mbAudio = new Audio();
                    attachTrackListeners(mbAudio);
                    mbAudio.preload = 'auto';
                    mbAudio.volume = MUSIC_TARGET_VOLUME;
                    mbAudio.src = track.audioUrl;
                }
            }
        } else {
            const track = mbTracks[mbShuffleOrder[mbIndex]];
            if (track) applyMusicBarTrack(track, false);
        }
    });

    artWrap.addEventListener('click', () => {
        if (!mbAudio) {
            const track = mbTracks[mbShuffleOrder[mbIndex]];
            if (track) switchTrackWithCrossfade(track.audioUrl, false);
            return;
        }
        if (mbAudio.paused) {
            mbAudio.volume = MUSIC_TARGET_VOLUME;
            mbAudio.play().catch(() => {});
        } else {
            stopFadingAudio();
            mbAudio.pause();
        }
    });

    artWrap.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            artWrap.click();
        }
    });

    btnPrev.addEventListener('click', () => skipTrack(-1));
    btnNext.addEventListener('click', () => skipTrack(1));

    const setMediaAction = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        if (!('mediaSession' in navigator)) return;
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch {}
    };

    setMediaAction('play', () => {
        if (!mbAudio) {
            const track = mbTracks[mbShuffleOrder[mbIndex]];
            if (track) switchTrackWithCrossfade(track.audioUrl, false);
            return;
        }
        if (mbAudio.paused) {
            mbAudio.volume = MUSIC_TARGET_VOLUME;
            mbAudio.play().catch(() => {});
        }
    });

    setMediaAction('pause', () => {
        if (mbAudio && !mbAudio.paused) {
            stopFadingAudio();
            mbAudio.pause();
        }
    });

    setMediaAction('stop', () => {
        if (mbAudio) {
            stopFadingAudio();
            mbAudio.pause();
            mbAudio.currentTime = 0;
        }
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none';
        }
    });

    setMediaAction('previoustrack', () => skipTrack(-1));
    setMediaAction('nexttrack', () => skipTrack(1));

    setMediaAction('seekto', (details) => {
        if (details.seekTime !== undefined && mbAudio && Number.isFinite(mbAudio.duration)) {
            mbAudio.currentTime = Math.min(Math.max(0, details.seekTime), mbAudio.duration);
            updateMediaSessionPositionState(mbAudio);
        }
    });

    setMediaAction('seekbackward', (details) => {
        if (mbAudio) {
            const offset = details.seekOffset || 10;
            mbAudio.currentTime = Math.max(0, mbAudio.currentTime - offset);
            updateMediaSessionPositionState(mbAudio);
        }
    });

    setMediaAction('seekforward', (details) => {
        if (mbAudio && Number.isFinite(mbAudio.duration)) {
            const offset = details.seekOffset || 10;
            mbAudio.currentTime = Math.min(mbAudio.duration, mbAudio.currentTime + offset);
            updateMediaSessionPositionState(mbAudio);
        }
    });
}

function runAll() {
    initMusicBar();
    initHighlightable();
    fetchVisitorCount();
    initMusic();
    initChat();
    initScrollReveal();
    initTilt();
    initTheme();
}

function effectiveTheme(): 'light' | 'dark' {
    const t = document.documentElement.dataset.theme;
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function updateThemeMeta(theme: 'light' | 'dark') {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
    }
}

function updateThemeIcon(animate = false) {
    const morph = document.getElementById('theme-morph') as any;
    if (!morph) return;
    const isLight = effectiveTheme() === 'light';
    const targetIcon = isLight ? Sun : Moon;
    if (animate && typeof morph.morphTo === 'function') {
        morph.morphTo(targetIcon, 'snappy');
    } else if (typeof morph.set === 'function') {
        morph.set(targetIcon);
    } else {
        customElements.whenDefined('morph-icon').then(() => {
            const m = document.getElementById('theme-morph') as any;
            if (m && typeof m.set === 'function') {
                m.set(isLight ? Sun : Moon);
            }
        });
    }
}

function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const t = effectiveTheme();
    const next = t === 'light' ? 'dark' : 'light';
    btn.setAttribute('aria-label', `Switch to ${next} theme`);
    btn.setAttribute('title', `Switch to ${next} theme`);
    updateThemeMeta(t);
    updateThemeIcon(false);
}

function toggleTheme() {
    const next = effectiveTheme() === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateThemeButton();
    updateThemeIcon(true);
}

function applyStoredTheme(doc: Document = document) {
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
            doc.documentElement.dataset.theme = stored;
            const meta = doc.querySelector('meta[name="theme-color"]');
            if (meta) {
                meta.setAttribute('content', stored === 'light' ? '#ffffff' : '#0a0a0a');
            }
        }
    } catch (e) {}
}

function initTheme() {
    applyStoredTheme(document);
    const btn = document.getElementById('theme-toggle');
    if (btn && !btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', toggleTheme);
    }
    updateThemeButton();
}

document.addEventListener('astro:before-swap', (ev: any) => {
    if (ev.newDocument) {
        applyStoredTheme(ev.newDocument);
    }
});

document.addEventListener('astro:page-load', runAll);
