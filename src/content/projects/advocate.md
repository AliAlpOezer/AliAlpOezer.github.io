---
title: Advocate
headline: An agent that drafts job applications without making things up
summary: >-
  It turns a job posting into a tailored CV and German cover letter, but every factual
  sentence has to trace back to evidence I approved. Nothing gets sent until I press a
  button.
takeaways:
  - Never let a step report its own success. Check what it produced, with code that did not produce it.
  - Keep facts and prose apart. Let the model choose from approved claims and write only the sentences around them.
  - If a model keeps stopping halfway through a long task, make the task shorter. Several short stages, each writing one file, beat one long conversation.
  - Turn taste into a check. If a defect is obvious the moment you see it, you can usually measure it.
stack: [LangGraph, Python, Postgres, pgvector, Pydantic, Telegram]
period: "2026"
status: building
order: 10
featured: true
repo: https://github.com/AliAlpOezer/advocate
claims: [proj.advocate]
---

Writing applications is slow, and the obvious shortcut, asking a model to write one, has an
obvious problem: models are happy to invent experience you do not have. I wanted the speed
without the invention.

Advocate is three separate loops that never call each other. A search loop collects job
postings on a timer. A drafting loop turns a shortlisted posting into a CV and a German cover
letter. A submission loop runs only after I approve a draft. The only thing they share is
the database between them.

Two rules hold the whole thing up.

## The model is not allowed to write facts

Every factual sentence in a draft has to trace back to an entry in a claim store: a database
of things about me that are true and that I have approved. The model picks claim IDs and
writes the connecting sentences. It cannot state anything else.

The interesting part was what my real evidence did to that design. I first sketched the
schema the obvious way: German text, English text, a strength grade, and a "never claim"
flag. Then I went through my actual records and found four things the sketch could not
express.

Some true claims still come with wording rules, like *say "familiar with", not "read"*. A flag
cannot hold that, and a free-text note just invites the model to paraphrase around it, so
required, preferred and forbidden phrasings became their own table, checked against every
draft. Some evidence only applies to one audience. Some claims can only be made together with
at least two of three specific pieces of proof. And *how strong* the evidence is turned out to
be separate from *where it came from*: a self-reported fact can be usable, while
well-documented coursework must never read as job experience.

A claim now spans two tables, and every read needs a join. That is the cost of a schema that
fits the data instead of the sketch.

## Nothing gets to report its own success

The first drafting step called an agent command-line tool. Twice, the model call died inside
the first request, after 206 and 310 seconds, having written nothing. **The process exited
with code 0 both times.** My driver logged success. The whole fallback chain underneath it,
key rotation and two backup providers, only triggered on a non-zero exit, which this kind of
failure never produces.

The only thing that caught it was a separate checker noticing that the output files were
still identical to the template.

That lesson arrived four more times. A provider returned an error inside an HTTP 200, with
2,464 tokens of reasoning and no content, which looks exactly like a model refusing the
work. A PDF renderer printed "image not found" and exited 0. A search loop marked postings as
seen before it had actually evaluated them.

So it is now a rule: **a stage has succeeded when its output is right, as checked by code that
did not produce it.** There is no "I'm done" tool for the model to call. A stage ends when its
file is on disk and the checker finds no problems. A failure then names a stage instead of a
turn count, a retry skips every stage that is already correct, and the hint on a retry comes
from what is actually wrong with the file, not a request to try harder.

## Shorter tasks, not a smarter loop

Asked to produce a whole application in one conversation, the model read the posting and both
templates, wrote a good plan, and then simply stopped calling tools. Three turns, four tool
calls. With an extra step that nudged it to continue: six turns and the *same* four tool calls.

The loop was fine. The task was too long.

Now it is five short stages, each a fresh conversation with the same background material,
each writing exactly one file: analyse the posting, draft the CV, draft the letter, map the
claims, render. Rendering is not a model step at all. Each stage only has a tool for its own
file, so the CV stage cannot touch the cover letter.

The background material, all 85,587 characters of it, is put straight into the system prompt
instead of being fetched with tools. When reading it was optional, the model could skip it,
and a draft written without the evidence looks the same as one written with it until you check
every sentence.

## Taste, turned into a check

Two drafts reached my review that were true, grounded, correct, and impossible to send. A
one-page cover letter that spilled onto a second page holding only the signature. A CV that
put nothing in bold except the marathons.

Neither needs a model to catch, and neither is a matter of opinion. A layout checker now reads
the *rendered PDF*, because a page break exists in the rendering, not in the source. If the
last page is less than 12% full and holds under 220 characters, it is an orphan. A second check
looks at how much of the text is bold and how long the profile is.

I did not pick those thresholds. I measured them on the two applications I had written by hand,
which both pass cleanly. The check paid for itself right away by catching my own
over-correction: the next draft bolded 66% of its bullet points, where my hand-written ones sit
at 40 to 43%.

## Public engine, private evidence

The code and the evidence live in two separate repositories. This one is public and contains no
personal data by design. My records, master CVs and sent applications live in a private one.
Credentials go in a database on a private network, never in the project folder, because that
folder is in git and a password committed there stays in the history forever.

## Status

The search loop, the drafter, the checker and the approval step are built and running. The
submitter, the one part that takes an action I cannot undo, is not built yet. That order is on
purpose.
