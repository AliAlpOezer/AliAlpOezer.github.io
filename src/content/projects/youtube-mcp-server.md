---
title: YouTube MCP Server
summary: >-
  A published Model Context Protocol server that reflows fragmented captions into prose
  organised under the video's own chapters, so a model reads authored structure instead of
  a flat wall of text.
tagline: Structure the input and the output improves without touching the model.
stack: [Python, MCP, yt-dlp]
period: "2026"
status: shipped
order: 40
repo: https://github.com/AliAlpOezer/youtube-mcp-server
claims: [proj.youtube_mcp]
---

An open-source MCP server exposing two tools, `get_transcript` and `get_video_info`, to
Claude and any other MCP client. No API key, no quota, no Google Cloud project, because it
is backed by yt-dlp rather than the YouTube Data API.

## Why it is not a transcript dump

Caption data arrives as timed cues of a few words each. Concatenate them and you get an
unbroken wall of text with no paragraphs and no hierarchy, and a model reading it has to
reconstruct the shape of the video from scratch, badly, before it can answer anything about
it.

This server reflows those cues into prose and buckets the prose under the video's **own
chapter headings**, with timestamps. The creator already did the work of dividing the
material into topics. Handing that structure to the model is free, and it is worth more than
any prompt engineering applied downstream.

Videos without chapters fall back to reflowing into paragraphs of roughly 700 characters,
which is the least-bad guess in the absence of authored structure.

## The bug that defines MCP over stdio

The transport is stdio. Which means stdout *is* the JSON-RPC channel. Anything else that
writes a byte to stdout corrupts the protocol, and yt-dlp is a command-line tool whose
default behaviour is to print progress to stdout.

The fix is four layers deep, and every one of them is load-bearing:

```python
_COMMON_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "noprogress": True,
    "logtostderr": True,
    "logger": _NullLogger(),
    "skip_download": True,
}
```

...plus a `contextlib.redirect_stdout(sys.stderr)` wrapped around every call that touches the
library, because configuration flags only silence the paths the library knows about.

This is the thing nobody tells you about writing an MCP server. The protocol work is
trivial; the hazard is that a well-behaved library writing a perfectly reasonable log line
manifests as a client that mysteriously fails to connect, with nothing in any log to explain
it. Worth internalising once, because every stdio server you ever write has the same
exposure.

## Small decisions that made it work

**One metadata call, not three.** A single `extract_info` returns caption track URLs,
chapter list and video metadata together. Only the chosen caption track needs a second
request.

**Prefer `json3`, keep the VTT parser as a fallback.** Both formats appear in the wild. VTT
needs a de-duplication pass that json3 does not: auto-generated captions roll, repeating the
previous line as each new one scrolls in, so a naive parse produces every sentence twice.

**Chapter bucketing in one monotonic pass.** Cues are already time-ordered, so the chapter
index only ever advances. No re-scanning, no sorting per cue.

**Preserve unicode rather than escaping it.** Accents, non-Latin scripts and symbols survive
intact, which matters the moment the video is not in English.

## What it deliberately does not do

Auto-generated captions have no punctuation and contain speech-recognition errors. This
server does not try to repair them. Any cleanup pass is a model guessing at what was said,
and a plausible wrong word is worse than an obviously garbled one. Models read through ASR
noise perfectly well; videos with manual captions come out cleaner for free.
