---
title: Voice Scheduler
headline: A voice agent that books appointments in German, fast enough to feel like a conversation
summary: >-
  You send a voice message in German, and it checks real availability, books the slot, and
  answers out loud. One agent serves a GP practice, a dentist and a restaurant.
takeaways:
  - In a voice interface, latency is the product. Where you cannot make a step faster, cover the wait with something useful, like a short filler phrase.
  - Stream everything you can, and split the output into speakable phrases instead of waiting for whole sentences.
  - When several customers share one problem, write one agent and give each customer an adapter. Let missing features be absent, not errors.
  - Keep a text-only path into the same agent loop, so you can work on its reasoning without paying for voice on every try.
stack: [TypeScript, Vercel AI SDK, MCP, Whisper, ElevenLabs, Drizzle, SQLite]
period: "2026"
status: shipped
order: 30
featured: true
claims: [proj.voice_scheduler]
---

Small businesses lose bookings because nobody can pick up the phone. I wanted to see how
close I could get to a receptionist that answers by voice, in German, and actually books.

You speak. The system notices you have stopped talking, turns your speech into text, works
out what you want, checks real availability in a database, books it, and answers out loud.
All of that has to fit into roughly a second, because that is about how long people wait
before a pause starts to feel like something is broken.

The pipeline is voice detection, then speech-to-text, then a language model with tools, then
text-to-speech. Each step adds delay, and tool calls add more. No model in that chain is fast
enough to hide the gap on its own, so the design has to.

## The trick that makes it feel alive

The timing plan is written as a comment at the top of the pipeline:

```
T=0ms     VAD fires end-of-speech
T=~50ms   Filler audio starts emitting from cache
T=~600ms  STT result arrives
```

The moment you stop speaking, before transcription has even started, the agent plays one of
six short German filler phrases recorded in advance. Starting that playback is the very first
thing the pipeline does, and it deliberately does not wait for it to finish. Transcription
runs underneath.

One filler lasts 1.1 to 1.4 seconds, but reaching the first real word after a tool call takes
about 1.5. One is not enough, so up to two are chained, picked at random but never the same
one twice in a row. The real answer is queued and starts as soon as the filler ends.

It is a trick, and it is the difference between a system that feels alive and one that feels
broken. No choice of model buys back the same second.

It is also easy to break. Move that filler call behind any `await` during a refactor and
everything still works, every test still passes, and it no longer feels instant.

## Latency decisions, all the way down

**Text-to-speech tuned for the first sound, not the best sound.** The speech provider has a
setting that trades a little audio quality for about 200ms off the first chunk. In a live
conversation that is an easy call.

**A splitter between the model and the voice.** The model's output is cut into phrases that
sound natural spoken aloud: always at `.?!`, and at a comma once at least six words have
built up. Sending tiny fragments produces audio glitches. Waiting for full sentences makes
the agent sound like it is reading. The comma rule sits in between.

**Simple voice detection.** Deciding when you have stopped talking uses plain loudness
thresholds tuned for phone-quality audio. No model, no dependencies, close to zero cost. It
will need replacing the day noisy input matters, and that is a fair trade for now.

**A text-only door into the same agent.** The voice path streams word by word so speech can
start early. A command-line harness runs the same agent loop with text only. Being able to
work on the agent's reasoning without paying for voice on every attempt is worth more than it
sounds.

## One agent, three businesses

A GP practice, a dental practice and a restaurant have the same booking problem with
different rules: party sizes and tables on one side, patient checks and calendar slots on the
other.

Instead of three agents, there is one agent and three adapters behind a shared interface,
each with its own SQLite database and schema. The restaurant has no patient list and no
column for one.

What makes this work is that capabilities are optional. The medical adapters can verify a
patient; the restaurant adapter simply does not have that ability. The agent checks whether
a capability exists instead of calling it and handling a failure, so an identity check is
offered where it makes sense and does not exist where it does not. Business rules never leak
into the pipeline or the agent loop.

## Tools over MCP

The five booking tools live on a [Model Context Protocol](https://modelcontextprotocol.io)
server with validated parameters. A second MCP server writes each booking into Google
Calendar, so the business owner sees it in a tool they already use instead of a dashboard
they would have to remember to open.

All of it runs on a free tool-calling model. Scheduling is not the hard part of this system,
and paying for a frontier model would not have bought anything.

## Shipping without a phone bill

The working version runs over Telegram voice messages rather than real phone calls. It checks
a secret token on every request, keeps session state per chat, guards against overlapping
messages, and falls back to text if speech generation fails. That made it free to
demonstrate. Real phone calls are specified but not built.

For a project whose whole point is how it feels to talk to, a complete system people can try
was worth more than half of a real phone integration.
