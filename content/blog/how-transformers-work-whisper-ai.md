---
title: "How Transformers Work: A Simple Explanation of Whisper AI"
date: "2024-06-23"
description: "You've heard of Transformers (the AI kind). But how do they actually turn sound waves into text?"
---

The "Transformer" architecture, introduced by Google in 2017, changed AI forever. It powers GPT-4, Claude, and yes, Whisper.

## The Attention Mechanism

The core magic is "Self-Attention."

Imagine listening to a sentence. When you hear the word "bank," you don't know if it means a river bank or a money bank until you hear the rest of the sentence.

Transformers look at the _entire_ sentence at once (or large chunks of it) to understand the context of every word relative to every other word.

## Whisper's Architecture

Whisper takes audio, turns it into a spectrogram (a visual representation of sound), and feeds it into an Encoder-Decoder Transformer.

1.  **Encoder:** Understands the audio features.
2.  **Decoder:** Predicts the next text token based on the audio and previous text.

It's complex math, but the result is magic. Try it at [InternetScribe](/).
