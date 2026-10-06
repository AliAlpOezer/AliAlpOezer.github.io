---
title: Munich Apartment Agent
headline: An agent that hunts for flats in Munich while I sleep
summary: >-
  Good flats in Munich are gone within hours. This agent checks a listing site every three
  hours, keeps only what fits my rules, and messages me on Telegram when something new
  turns up.
takeaways:
  - Let code make the decisions that have to be right, and give the model only the fuzzy part. A rule in code can be tested. A rule in a prompt can drift.
  - Anything that runs unattended needs a heartbeat. From the outside, a silent agent and a dead one look exactly the same.
  - Use the cheap check to narrow things down, then pay for the accurate check only on what is left.
  - Escalate to a stronger model only when a cheaper one fails or is unsure, so the bill follows how hard the work was, not how much of it there was.
stack: [LangGraph, Python, SQLite, FastAPI, systemd, curl-cffi]
period: "2026"
status: live
order: 15
featured: true
repo: https://github.com/AliAlpOezer/munich-apartment-agent
claims: [proj.munich_agent]
---

Looking for a flat in Munich is mostly refreshing a page. The good listings are gone within
hours, so whoever checks most often wins. I did not want that job, so I built something to
do it for me.

Every three hours a timer on a small server at home starts the agent. It fetches the latest
listings, throws out anything that breaks my rules, ignores flats it has already seen, looks
up the real price of what is left, has a language model judge how well each one fits, saves
everything, and sends me a Telegram message if anything is worth a look. I do not touch it
between runs.

It is built as a [LangGraph](https://langchain-ai.github.io/langgraph/) graph, one node per
step, so each step can be tested on its own and a crashed run can resume where it stopped.

## Code decides, the model reads

The most important decision in this project is what the language model is not allowed to
do.

The filter is plain Python: rent, size, move-in date, distance. It has unit tests, makes no
model calls, and gives the same answer for the same listing every time. The model only does
the part code is bad at: reading a free-text description and judging how well a flat
matches what I am looking for.

The model never decides what happens next, either. There is exactly one branch in the
graph, and it is ordinary code: if there are no new listings, the run ends early.

Why be so strict? Because an agent that asks a model whether a flat is within budget is not
smarter, it is just worse at arithmetic. And when it gets it wrong, you cannot tell whether
the rule changed or the model did.

## The price on the card is not the rent

The price shown in search results is usually the cold rent, without utilities. What you
actually pay is the warm rent, and in Munich the gap between them varies too much to guess.

Trusting the card price would be fast and wrong in a consistent direction: the agent would
keep sending me flats I cannot afford. Adding a fixed percentage would be cheap and wrong in
unpredictable ways, which is even harder to debug.

So the card price is treated as a lower bound. Anything that passes the cheap filter gets
its detail page fetched, the real warm rent is read from it, and the filter runs again on
the real number. That costs extra requests, but only for the handful of listings that
survived the first pass.

## Getting the page at all

Ordinary Python HTTP requests get blocked, not because of rate limits but because the site
recognises the network fingerprint of a script. The fetcher uses `curl-cffi` to present the
same fingerprint as Chrome, and falls back to a headless browser if that fails.

I know this is a cat-and-mouse arrangement that will break when the site changes. That is
why fetching sits behind its own interface: when it breaks, only that piece changes, and
adding a second site would be a new class rather than a change to the graph.

## Paying for difficulty, not volume

The model calls go through three tiers: a free model first, a cheap paid one second, a
frontier model last. A call only moves up a tier when the one below fails or returns an
answer below a confidence threshold.

Always using the best model is simple, and it costs money on every run forever. Using only
a free model is free and has no way to recover. With escalation, easy listings cost nothing
and only awkward ones reach the expensive tier. The price is that a tricky listing sometimes
takes a while to get through the queue.

## A heartbeat, and the bug it found

Every run sends me a short heartbeat, even when it found nothing. Something that runs while
you sleep rarely fails by crashing loudly. It fails by quietly stopping, and without a
heartbeat that looks exactly like a quiet week on the housing market.

It paid off. The heartbeats showed the same counts, 18 scraped, 12 matched, 0 new, run after
run for most of a day. Something upstream was serving a stale or cached result. I have not
proved what yet, but I would never have noticed from the notifications alone.

## Smaller decisions that keep it running

**Resumable runs.** The graph saves a checkpoint after each step in SQLite, so an
interrupted run continues from the last finished step instead of fetching everything again.

**Retries only where they help.** A network timeout is worth retrying. A parsing error is not,
and retrying it just sends three more requests for the same broken page.

**One SQLite file, not a hosted database.** The first version used Supabase. For one machine
and one user, that was a network dependency and a set of credentials that bought nothing, so
it came out.

**Feedback in one tap.** A thumbs up or down on a Telegram message is saved as a preference
for future ranking. Giving feedback only works if it is easier than ignoring the message.
