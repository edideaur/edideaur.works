---
title: "Why I love Opus"
date: 2026-07-12
image: "/blog-covers/opus-quality.png"
excerpt: "Why MP3 is dead. A breakdown on 128kbps transparency, ~5ms latency, and why Opus is the only lossy audio codec that matters."
---

I still see people in 2026 exporting 320kbps MP3s and it drives me crazy. MP3 was finalized in 1993. It's over thirty years old. It adds padding silence to the beginning and end of every file so gapless playback and seamless loops break, it smears high-end transients, and it burns three times the bandwidth it needs to.

Opus has been around for over a decade now and it's basically the only lossy audio codec that actually matters.

At 128kbps, Opus is transparent. I produce music and listen on decent studio monitors and planar headphones, and in double-blind ABX tests against 16-bit FLAC, nobody is reliably picking out 128kbps Opus. Drop it down to 96kbps or even 64kbps on mobile data, and it still holds together. Older codecs like MP3 or low-bitrate AAC turn cymbals and high hats into watery, metallic mush when you squeeze them down. Opus doesn't do that.

Part of why it's so good is how it was built. It's a hybrid of Skype's SILK codec (which was built strictly for human voice) and Xiph's CELT (built for full-bandwidth music with virtually zero latency). The encoder switches modes continuously depending on the input. If it detects speech, it compresses it like speech. If a snare or sub-bass hits, it switches gears instantly.

That low latency is also why Discord, TeamSpeak, WhatsApp, and WebRTC all run on Opus. You get an algorithmic delay of around 5ms. MP3 and AAC need chunky frame buffers to analyze frequencies, introducing 100ms+ of lag before you even account for network transit.

And on top of all the technical stuff, there's no patent cartel behind it. Fraunhofer and MPEG made hundreds of millions holding patents over MP3 and AAC, threatening software developers with licensing fees. Opus is an IETF open standard (`libopus` is BSD-licensed), completely royalty-free. Anyone can compile it into their app, stream it, or build hardware around it without paying a dime or signing an NDA.

To be fair, my friend [Binimum](https://binimum.org) pointed out that Fraunhofer's [xHE-AAC](https://www.iis.fraunhofer.de/en/ff/amm/broadcast-streaming/xheaac.html) (which [Meta has widely deployed](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/)) can actually [outperform Opus in some cases](https://www.youtube.com/shorts/xes0ONhdmUw); Fraunhofer's own [comparison page](https://www2.iis.fraunhofer.de/AAC/xhe-aac-compare-tab.html) backs this up at very low bitrates. But I still think Opus wins overall because it's fully open-source, royalty-free, and doesn't come with licensing fees or legal baggage. xHE-AAC is a good codec, but it's still MPEG-owned and patent-encumbered.

If you're storing music, streaming audio on the web, or building anything that moves sound over a network, just use Opus. There's no reason to touch MP3 ever again.
