---
title: Streamline
headline: Mapping a factory's water to find what can be reused
summary: >-
  Built with my team at the EIT Water Hackathon in Munich. Streamline lets an engineer draw
  how water moves through a site, spot where used water could be reused, and compare the
  change with how the site runs today.
takeaways:
  - When the answer is a trade-off, show the reasoning, not just a number. People act on what they can inspect.
  - Mark where the data is too thin to decide. Being clear about uncertainty makes the confident parts easier to trust.
  - Put the proposal next to the current state before calling a saving real.
stack: [React, Vite, JavaScript, React Flow]
period: "2026"
status: shipped
order: 5
featured: true
recognition: "EIT Water Hackathon: 2nd place as a team, 3rd place in the individual student award"
media:
  - src: /project-media/streamline/to-be.png
    alt: Streamline's to-be canvas showing water reuse from a bottle washer through a buffer tank to a cooling tower.
    caption: A proposed reuse path, from a bottle washer through a buffer tank to a cooling tower, shown within the rest of a demo site.
  - src: /project-media/streamline/assess.png
    alt: Streamline's assessment view ranking reuse opportunities with quality checks and a measurement plan.
    caption: The assessment view lists possible reuse paths with their quality limits and the measurements still missing.
  - src: /project-media/streamline/focus.png
    alt: Streamline's design canvas focusing on a proposed water reuse path between a bottle washer and cooling tower.
    caption: Focus mode isolates one reuse path while keeping the rest of the site in view.
claims: []
---

Factories use a lot of fresh water for jobs that do not need fresh water. Rinse water from one
machine could often feed another, but nobody can see that while the whole system lives in
spreadsheets and people's heads. Streamline makes it visible.

You start by drawing the site on a canvas: where water comes in, which processes use it, and
where it leaves. The assessment view then pairs outlets that might be reused with inlets that
currently draw fresh water, and it says plainly where the data is still too thin to decide. A
"to-be" scenario lets the team try a change and compare it with the current site before
anyone treats a calculated saving as a real one.

The interface is the point, because the value is not one number. An engineer needs to see which
stream is being reused, why the connection is plausible, which measurements are missing, and how
the proposed site differs from today's. The screenshots show that workflow on a demo brewery,
not a real customer.

At the EIT Water Hackathon in Munich, Streamline took second place in the team ranking, and I
received third place in the separate individual student award. The code is not public, so the
product screens are what I can share here.
