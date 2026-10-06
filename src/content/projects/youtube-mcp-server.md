---
title: YouTube MCP Server
headline: Giving AI assistants YouTube transcripts that keep the video's structure
summary: >-
  An open-source MCP server that lets Claude and other AI assistants read YouTube videos. It
  turns choppy captions into readable paragraphs, grouped under the video's own chapters.
takeaways:
  - Before tuning the prompt, improve the input. Structure the author already created is free and worth more than clever instructions.
  - In a stdio MCP server, standard output is the protocol. Any library that prints to it breaks the connection silently.
  - Do not let a model "repair" source data. A plausible wrong word is worse than an obviously garbled one.
stack: [Python, MCP, yt-dlp]
period: "2026"
status: shipped
order: 40
repo: https://github.com/AliAlpOezer/youtube-mcp-server
claims: [proj.youtube_mcp]
---

I watch a lot of long technical videos and wanted to ask an assistant about them instead of
scrubbing through. So I wrote a small server for the
[Model Context Protocol](https://modelcontextprotocol.io), the standard way to give AI assistants
new tools. It offers two: `get_transcript` and `get_video_info`.

It needs no API key, no quota and no Google Cloud project, because it uses
[yt-dlp](https://github.com/yt-dlp/yt-dlp) instead of the official YouTube API.

## Why not just dump the transcript

Captions arrive as timed snippets of a few words each. Join them and you get one long wall of
text with no paragraphs and no structure. A model reading that has to rebuild the shape of the
video from scratch, badly, before it can answer anything about it.

This server joins the snippets into prose and groups it under the video's **own chapter
headings**, with timestamps. The creator already split the video into topics. Passing that
structure along costs nothing and helps more than any prompt written downstream.

Videos without chapters fall back to paragraphs of about 700 characters, the least bad guess
when there is no structure to follow.

## The bug every stdio MCP server can have

The server talks to the assistant over standard input and output. That means standard output
*is* the protocol channel, and anything else that prints there corrupts it. yt-dlp is a
command-line tool, and printing progress to standard output is exactly what it does by default.

The fix took four layers of settings:

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

On top of that, every call into the library is wrapped in `contextlib.redirect_stdout(sys.stderr)`,
because settings only silence the output paths the library knows about.

Nobody warns you about this. The protocol itself is simple. The danger is that a well-behaved
library writing one ordinary log line shows up as a client that mysteriously fails to connect,
with nothing in any log to explain it. Every stdio server you write has the same risk.

## Small decisions that helped

**One metadata request instead of three.** A single call returns the caption links, the chapter
list and the video details together. Only the chosen caption track needs a second request.

**Prefer the JSON caption format, keep a fallback.** Both JSON and VTT captions show up in
practice. VTT needs an extra cleanup pass: auto-generated captions roll, repeating the previous
line as each new one appears, so a naive parser produces every sentence twice.

**Chapters in one pass.** Captions are already in time order, so the current chapter only ever
moves forward. No sorting, no searching.

**Keep Unicode as it is.** Accents, other scripts and symbols come through intact, which
matters as soon as a video is not in English.

## What it deliberately does not do

Auto-generated captions have no punctuation and contain recognition errors. The server does not
try to fix them. Any cleanup would be a model guessing what was said, and a plausible wrong word
is worse than an obviously garbled one. Models read through caption noise well, and videos with
human-written captions come out clean anyway.
