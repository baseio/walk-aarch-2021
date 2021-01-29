# walk-aarch-2021

## Aarhus School of Architecture - Winter graduation 2021

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/36622290-ab7c-4011-a494-660cef836fa5/deploy-status)](https://app.netlify.com/sites/vibrant-nobel-c7d9ea/deploys)

Demo: <a href="https://vibrant-nobel-c7d9ea.netlify.app/">
	https://vibrant-nobel-c7d9ea.netlify.app
</a>


Analytics:  	
https://analytics.google.com/analytics/web/?authuser=3#/a187911964p259766919/admin/streams/table/

## Team
Exhibition curator, concept: Karen Kjærgaard <kje@aarch.dk>  
Graphic Design: Casper Riis Jensen <casper@walk.agency>  
Interaction Design, development: Jørgen Skogmo <j@dearstudio.dk>  


## General idea

Procedural graphics ala Processing.org  

## Canceled ideas
Let students present their project on a live video-stream  
Let visitors book/invite a student to video-conference  
(COVID-19 times...)  
Reason for cancelation: Weak support with the students, "more work"


## Code architecture 
Settings: Define static props  
Index:  Bootstrap, based on settings  
Routes: Decide what to do (triggered by location.hash changes)  
Action: Decide how to do it (including orchestration of other modules)  


## Thoughts about 'how to reuse this for the next graduation'
A decent strategy whould be to consider this site a 'landing pages' or 'concept site'
for a graduation.
One could swap the "src/lib/animation" (rename to sth like src/fx ?),
keeping the hash-route-scheme.
settings.js could point to the active "fx/effect".
src/data/* can easily be updated (see tools/).  

Making a custom effect for each graduation would be great fun!


## Notes on setting up a dev env

Development versions: node v14.15.1
Tested against: chrome/86.0.4240.198 safari/537.36 opera/72.0.3815.400

### install:
git clone
cd src
npm i

### dev:
npm run watch
cd dist && serve # (can we script this to run in bg? bundle serve as node_module?)

### make release:
cd src/
npm run release

### push to netlify:
git push origin master

### push online:
cd src/
npm run upload

### push just one file:
rsync -avz -e "ssh -i $HOME/.ssh/ds_rsa" mobile.html dearstudio@pa.aarch.dk:/home/dearstudio/www/


---

## Tasks

- Change slugs (wp compat)
- Link to archive website (await apparat)


---

### Tweak notes

- dot radius: see anim/CircleSprite.js @update
- clearTrails: see UserDraw.js @showDrawDemo @pathCreatedCallback(path, false) OR anim/index.js @onPathCreated

---


## Load / Lighthouse 

#### last years site:
https://wda2020.aarch.dk/
41 requests  
65.3 MB transferred  
66.4 MB resources  
Finish: 39.30 s  


#### beta 1: 201125:
17 requests  
341 kB transferred  
1.6 MB resources  
Finish: 947 ms  

#### beta 2: 201216:
6 requests  
268 kB transferred  
979 kB resources  
Finish: 312 ms  

Performance: 99 (varies)  
Accessibility: 100  
Best Practices: 100  
SEO: 100  