---
title: Voice Scheduler
summary: >-
  A real-time German-language booking agent running voice end to end, from VAD through STT
  and the LLM to TTS. One adapter interface serves both a restaurant and a medical
  practice, negotiating capabilities per vertical.
tagline: Real-time voice in a language the model was not primarily trained for.
stack: [TypeScript, Vercel AI SDK, MCP, Whisper, ElevenLabs, Drizzle, SQLite]
period: "2026"
status: shipped
order: 30
featured: true
claims: [proj.voice_scheduler]
---

A caller speaks German. The system detects when they have stopped talking, transcribes,
reasons about what they asked for, checks real availability, books, and answers out loud.
End to end, in the time a person will tolerate waiting.

## The latency problem, and the honest fix

The pipeline is VAD → STT → LLM → TTS, and every stage adds delay. Tool calls add more.
The fix is not a faster model, it is filler-word playback: the agent says the small
conversational noises a human makes while thinking, covering the gap during a tool call.
It is a trick, and it is the difference between a system that feels alive and one that
feels broken.

## One agent, several businesses

The interesting architecture is the `BusinessAdapter` interface. A restaurant and a medical
practice are the same booking problem with different rules: party sizes and table logic
versus patient verification and calendar-backed availability. Rather than two agents, there
is one agent and two adapters, with optional capabilities negotiated per adapter, so the
identity check exists for the practice and simply is not offered for the restaurant.

## MCP as the tool layer

Five booking tools (`get_business_info`, `verify_client`, `get_available_slots`,
`find_next_available`, `book_slot`) are exposed through a Model Context Protocol server and
consumed by a multi-step agent loop with Zod-validated parameters and streaming responses.
A second MCP server writes back to Google Calendar, so a business owner sees bookings
appear in the calendar they already use.

## Shipping it cheaply

The proof of concept runs over Telegram voice messages rather than real telephony: webhook
secret-token validation, per-chat session state, concurrency guards, and a graceful text
fallback when TTS fails. Zero cost to demonstrate, with a Twilio Media Streams path
specified for actual PSTN calls.
