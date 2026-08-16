---
title: YouTube MCP Server
summary: >-
  A published Model Context Protocol server that reflows fragmented captions into prose
  organised under the video's own chapter structure, so models get authored structure
  instead of a flat wall of text.
tagline: Giving a model the shape of a video, not just its words.
stack: [Python, MCP, yt-dlp]
period: "2026"
status: shipped
order: 40
repo: https://github.com/AliAlpOezer/youtube-mcp-server
claims: [proj.youtube_mcp]
---

An open-source Model Context Protocol server exposing two tools, `get_transcript` and
`get_video_info`, to Claude and any other MCP client. No API key required, since it is
backed by yt-dlp rather than the YouTube Data API.

## Why it is not just a transcript dump

Raw caption data is fragmented into timed cues of a few words each. Concatenating them
produces a flat wall of text with no paragraphing and no hierarchy, and a model reading it
has to reconstruct the structure of the video from scratch, badly.

This server reflows those cues into readable prose and organises the prose under the
video's **own chapter structure** - the chapters the creator already wrote. The model gets
authored structure for free instead of inferring it.

That is the entire idea, and it is worth more than any prompt engineering applied
downstream. Structure the input and the output improves without touching the model.
