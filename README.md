# walk-aarch-2021

AARCH Winter 2021, Graduation website.

## Dev

[![Netlify Status](https://api.netlify.com/api/v1/badges/36622290-ab7c-4011-a494-660cef836fa5/deploy-status)](https://app.netlify.com/sites/vibrant-nobel-c7d9ea/deploys)

Demo: <a href="https://vibrant-nobel-c7d9ea.netlify.app/">
	https://vibrant-nobel-c7d9ea.netlify.app
</a>

## Team
Casper Riis Jensen <casper@walk.agency>  
Karen Kjærgaard <kje@aarch.dk>


## General idea

Procedural graphics ala Processing.org
Let students present their project on a live video-stream
Let visitors book/invite a student to video-conference
(COVID-19 times...)


## Thoughts about 'how to reuse this for the next graduation'

A decent strategy whould be to consider this site a 'landing pages' or 'concept site'
for a graduation.
One could swap the "src/lib/animation" (rename to sth like src/fx ?),
keeping the hash-route-scheme.
settins.js could point to the active "fx/effect".
src/data/* can easily be updated (see tools/).

Making a custom effect for each graduation would be great fun!


## Code architecture 

Settings: Define static props
Index:  Bootstrap, based on settings
Routes: Decide what to do (triggered by location.hash changes)
Action: Decide how to do it (including orchestration of other modules)


## Notes on setting up a dev env

Development versions: node v14.15.1
Tested against: chrome/86.0.4240.198 safari/537.36 opera/72.0.3815.400

git clone
npm i
npm run watch
cd dist/ && serve (can we script this to run in bg? bundle serve as node_module?)

Netlify is linked to the above repo


## Tasks


- Get OK for: Code License
- Get OK for: HTML Meta description
- Hosting
- Can we Host live-stream with Vimeo (instead of Twitch)
- WP content workflow
- Sort students

- test show icon/image/animation when hovering a ball (SLOW!!)
- setup server (when it lands)

+ let search affect the balls
+ add Categories and Draw here labels
+ about text max width
- ball-hover when entering via direct link (Safari?)


## [draft] wp integration

Hej Lars,

Hyggeligt at ses den anden dag.

Med henblik på "how to link from the pa.aarch.dk site to a student-page at afgang.aarch.dk",
tænker jeg at "slugs" nok er den bedste vej fremad:

- jeg bruger en slug (autogenereret fra afgængerens navn) på PA sitet, e.g. https://vibrant-nobel-c7d9ea.netlify.app/#daniel-nielsen
- link hos jer kunne måske så være afgang.aarch.dk/winter2020/daniel-nielsen eller lignende?

j.



## Worklog

#### W46: Kickoff
- [x] prepare for meeting
- [x] kickoff with client thursday @ 12.00

#### W47: Sketching and Prototypes
- [x] sketch circle animations:
- - [x] fizzy
- - [x] wraparound
- - [x] boids
- - [x] motion
- - [x] sine
- - [x] wave
- [x] test "go live" -> twitch
- [x] netlify twitch test
- [ ] figure out how to schedule this
- [ ] test "book zoom" -> ?
- [x] sketch index
- [x] colorize subtitles (nlp)
- [x] play youtube movie in custom player
- [x] students data: get from karen
- [x] students data: build parser and stub-generator
- [x] present and get feedback: meeting friday @ 09

#### W48: Style + Tone

- [x] more 'arcitectural' sketches
- [x] webshell
- [x] subtitles with vimeo-player
- [x] search
- [ ] update subtitles to use VTT
- [ ] send subtitles spec (VTT)
- [ ] present and get feedback: meeting thursday @ 09: Meeting was canceled by Karen.
- [ ] agree on menu, text-deliveries, integrations

#### W49: Concept approval

- [ ] test twitch or vimeo for the live feature: Await AARCH
- [ ] test twitch or vimeo schedule api: Await decision on platform
- [x] focus-node / student-page
- [x] text page
- [x] filtering
- [x] plan WP integration (slug/stub)

#### W50: Concept lock

- [x] Solve color theme
- [x] Static layouts
- [x] project layout flex
- [x] hash-router directly to student view
- [x] complete navigation
- [x] student pill-layout (searchable)
- [-] student contact info (await Karen)
- [-] server (await Tony)
- [x] verify fonts (and minimize selection)
- [ ] fork mobile to separate html file (to avoid document.write)

#### W51: Finalize Phase 1

- [x] Bug fix, and demonstrate all features 
- [x] Reach "all green" on Lighthouse

#### W01: Plan production

- [ ] student content info
- [ ] student hero images
- [ ] mobile

#### W02: Production
#### W03: Production
#### W04: Release

---
https://wda2020.aarch.dk/
41 requests
65.3 MB transferred
66.4 MB resources
Finish: 39.30 s


AAA-21 / 201125:
17 requests
341 kB transferred
1.6 MB resources
Finish: 947 ms


