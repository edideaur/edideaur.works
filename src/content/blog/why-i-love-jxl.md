---
title: "Why I love JXL"
date: 2026-07-12
image: "/blog-covers/jpeg-xl.png"
excerpt: "JPEG XL is the only modern format designed from the ground up for still pictures. Lossless JPEG recompression, modular encoding, and why it beats AVIF."
---

Image formats on the web have been a mess for as long as I can remember.

PNG is bloated and slow to compress. WebP was hacked out of VP8 video intra-frames and butchers fine red text and UI borders because of forced 4:2:0 chroma subsampling. AVIF came along promising to fix everything, but because it's built on AV1 video, encodes take forever, memory spikes on high-res photos, and fine textures or film grain turn into smeared watercolor washes.

JPEG XL is the only modern format actually designed from the ground up by image engineers for still pictures, not video codecs in disguise.

The most impressive thing about JXL is lossless JPEG recompression. If you have a legacy `.jpg`, you can run it through `cjxl` and shrink the file by ~20% with zero generational loss. It doesn't decode and re-compress the pixels; it repacks the existing DCT coefficients into a more efficient container using ANS entropy coding. And whenever you need the original JPEG back for some piece of legacy software, you can reconstruct the exact bitstream byte-for-byte. No other image format on Earth can do that.

For UI graphics, screenshots, and artwork, JXL's modular mode makes PNG look ancient. It consistently cuts file sizes by 30% to 50% compared to optimized PNGs while decoding much faster on the CPU. It handles alpha transparency, 16-bit float, wide gamuts (DCI-P3, Rec.2020), and CMYK natively without breaking a sweat.

Its progressive decoding is also the only one that actually looks good in practice. Old progressive JPEG gave you scanlines that crawled down the page. JXL gives you an immediate low-frequency preview that sharpens seamlessly as bytes stream in, so pages feel fast on slow connections without needing low-res base64 placeholder hacks.

The politics around it have been infuriating, but the tide is finally turning. Google ripped the experimental flag out of Chromium in 2023 to push AVIF, which caused massive pushback from developers, designers, and companies like Adobe and Intel. Safari called their bluff and shipped full native JPEG XL support in macOS Sonoma and iOS 17. Firefox enabled it in Firefox Labs. Then Chromium brought back a clean, memory-safe Rust decoder in Chrome 145, and now there is an active Intent to Ship (I2S) on Chromium.

Once that I2S lands and it's enabled by default in Blink, the web finally gets the image codec it deserved years ago.
