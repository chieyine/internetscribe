---
title: "Speechmatics vs. OpenAI Whisper: The Tech Behind the Text"
date: "2024-06-08"
description: "A technical deep dive into the two leading ASR engines: Speechmatics' proprietary model and OpenAI's open-source Whisper."
---

Speechmatics has long been the leader in "Any-context Speech Recognition." They pioneered self-supervised learning for speech.

OpenAI's Whisper took a different approach: massive scale weakly supervised learning on 680k hours of web audio.

## The Results

- **Speechmatics:** Incredible at dialects and very low latency streaming.
- **Whisper:** Incredible at robustness. It can handle music, background noise, and mumbling better than anything we've seen.

## Why We Chose Whisper

For **InternetScribe**, we chose Whisper because it can run locally. Speechmatics is a cloud API. By using Whisper, we give you privacy and zero cost.

Read more about the tech in [How Transformers Work](/blog/how-transformers-work-whisper-ai).
