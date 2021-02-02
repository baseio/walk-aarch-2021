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
- [x] fork mobile to separate html file (to avoid document.write)

#### W51: Finalize Phase 1

- [x] Bug fix, and demonstrate all features 
- [x] Reach "all green" on Lighthouse (100,100,100,100!)[https://gitlab.com/dearstudioworks/walk-aarch-2021/-/blob/28d0bfceef27bc1750599bc2d0dc1538d6a4736f/process/grabs/201216-AAA21-beta-lighthouse.mov]

#### W01: Plan production

- [x] student content info
- [x] student hero images
- [x] mobile

*beta 0.0.8 / 210108*  
- [x] new about text (x2)
- [x] new credits section
- [x] new excel data
- [x] new project images (some missing, Anne is on it!)
- [x] mobile site
- [x] images-in-circles (some missing)


#### W02: Production

*beta 0.0.9 / 210112*    
- [x] keep circle-image on dot-hover
- [x] more thematic 'random positions'
- [x] searching from within a graduates/student-view fails
- [ ] permalinks dont establish full views
- [ ] include project texts? (Await Casper / Karen)
- [ ] colors? (Await Casper / Karen)

Uploaded a version to our staging-server (vibrant-nobel-c7d9ea.netlify.app) in orange (just to check how easy it would be to change the main color),
that is using plain circles until you mouse-over a student (where it shows the circular project-image).
Also made the random-positions (used when exiting a theme) slightly more 'thematic' (the circles now enters a randomly choosen shape, not just a random position).
Also fixed a bug where search did not work when a student was already selected.

#### W03: Production

- [ ] hasGL check: pass when mobile
- [ ] banner, mobile
- [ ] banner, new CTA ("visit graduation show")

#### W04: Release

---

#### 210203: Update 1

- [x] Update 5 project-images

**Feature:** Estimate communicated: 6 timer + correspondence  
- [x] Remove link to 'afgang.aarch.dk' from select students (see data/excludes.js)
- [x] On mobile, excluded students will be completely removed (as their only presence is a link...)

**Layout bugfix:** See Casper's 'Webfeedback2.pdf' a 210118
- [x] Collapse sidebar was rendered in RED on small screens
- [x] iPad (Casper gets a black screen)
- [x] Improve scrollbar css 
- [x] Improve layout on wide+low screens
