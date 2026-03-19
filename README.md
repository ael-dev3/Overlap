# Overlap

> Discover active people on Farcaster you actually overlap with — by role, interests, ecosystem, collaboration intent, graph context, and reputation.

## Status

**Private internal project.**

This repository is currently the product/vision home for Overlap.
Technical implementation details and build work may be tracked separately.

## Overview

Overlap is a Farcaster mini app focused on **high-signal people discovery**.

The goal is simple:
help users find other **active**, **relevant**, and **collaboration-compatible** people on Farcaster — not random accounts, not dead profiles, and not purely popularity-driven suggestions.

Overlap is not meant to be a dating product.
It is a **social discovery and collaborator discovery layer** for Farcaster.

## Problem

Farcaster has strong social graph data, active communities, and public conversation history, but it is still hard to answer questions like:

- Who on Farcaster is actually relevant to me right now?
- Who shares my interests across ecosystems and topics?
- Who is active, credible, and worth reaching out to?
- Who is looking for the same kind of collaboration I am?
- Who in my extended graph do I already have meaningful overlap with?

Today, discovering the right people is noisy and manual.
Overlap is meant to make that discovery much more intentional.

## Product Thesis

People connect best when there is clear common ground.

Overlap helps surface that common ground by combining:

- **self-selected identity**
- **real Farcaster activity**
- **shared graph and topical context**
- **collaboration intent**
- **Neynar score as a quality/reputation signal**

The result should feel less like generic follower discovery and more like:

> "Here are active people on Farcaster you should probably know — and here is why."

## Core Concept

Each user creates a lightweight discovery profile inside the mini app.
They can select **multiple roles** and **multiple tags across structured categories**.

The app then ranks potential matches using both profile selections and live Farcaster signals.

### Example Roles

Users can choose multiple roles, such as:

- Builder
- Creator
- Trader
- Artist
- Founder
- Researcher
- Marketer
- Collector
- Investor
- DevRel

### Example Tag Categories

#### Blockchain / Ecosystem

- BTC maxi
- ETH mainnet
- Base
- Solana
- Hyperliquid

#### Interests

- AI
- DeFi
- Trading
- Memes
- Agents
- Content
- Mini apps
- NFTs
- Gaming
- SocialFi

#### Collaboration Intent

- Looking to build
- Looking for cofounder
- Want feedback
- Want to collaborate
- Hiring
- Need dev
- Need designer
- Want distribution
- Open to brainstorm
- Just networking

## Matching Inputs

Overlap should use a combination of explicit and implicit signals.

### 1. Self-Selected Profile Signals

What the user says about themselves:

- selected roles
- selected ecosystem tags
- selected interest tags
- selected collaboration intent

### 2. Farcaster Activity Signals

What the user actually does on Farcaster:

- posting recency
- reply activity
- topic consistency
- channels or communities they appear in
- engagement patterns

### 3. Graph Signals

Who the user is socially close to:

- follow relationships
- mutuals
- interaction overlap
- shared audiences
- repeated conversational proximity

### 4. Neynar Score

Neynar score should be used as a **quality and trust weighting signal**.

It can help:

- prioritize higher-signal accounts
- reduce spammy or low-quality recommendations
- improve ranking confidence

It should **not** become the entire product.
Neynar score is useful as a ranking input, but the product should still be driven primarily by:

- overlap in interests
- overlap in roles
- overlap in collaboration intent
- real activity and graph context

## What Users Should See

Overlap should present a clean, explainable match feed.

Each candidate card should make it obvious why the person was surfaced.

### Example Match Card Fields

- name / handle / avatar
- short bio
- selected roles
- selected tags
- collaboration intent
- activity status or recent activity signal
- Neynar score
- mutuals / shared context
- clear call to action

### Example "Why You Overlap" Explanation

- both selected **Builder + Creator**
- both are active on **Base**
- both post about **AI + mini apps**
- both are open to **collaboration**
- both have been active in the last **7 days**
- strong account quality by **Neynar score**

The explanation layer is important.
Users should understand why a match appears instead of feeling like they are looking at an opaque recommendation engine.

## User Experience Direction

### Onboarding

- connect Farcaster account
- pick multiple roles
- pick tags across categories
- choose collaboration intent
- optionally refine preferences later

### Discovery

- browse ranked people with strong overlap
- see concise explanations for each match
- filter by ecosystem, role, or collaboration goal
- prioritize active users over stale accounts

### Action Layer

Potential actions may include:

- view Farcaster profile
- follow
- save for later
- skip
- start a conversation
- export/share match profile internally if needed

## Positioning

Best framing for Overlap:

- **social discovery for Farcaster**
- **collaborator discovery for Farcaster**
- **find active people you genuinely match with**

Less useful framing:

- dating app clone
- popularity leaderboard
- follower vanity tool

The product should feel intentional, credible, and useful for builders, creators, traders, artists, and other active participants in the ecosystem.

## MVP Scope

A strong V1 does not need to do everything.

Suggested MVP scope:

- profile setup with multi-select roles and tags
- collaboration-intent selection
- active-user filtering
- ranked match feed
- match explanation block
- Neynar score integration for ranking quality
- basic filters by role / ecosystem / interest

## Non-Goals (for now)

- building a dating app
- optimizing for pure popularity
- showing inactive or abandoned accounts
- forcing users into a single identity label
- making Neynar score the only decision factor

## Product Standard

If Overlap works, the experience should feel like:

- high-signal
- relevant
- active
- explainable
- useful for real connection and collaboration

The product should help users feel:

> "These are people on Farcaster I actually have something in common with — and a reason to reach out."

## Working One-Liner

**Overlap helps Farcaster users discover active people they genuinely match with based on roles, interests, ecosystem tags, collaboration intent, real social activity, graph overlap, and Neynar score.**
