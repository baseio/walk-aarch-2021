`201112` Walk-AARCH: Meeting notes

# AARCH Winter 2021, Graduation website.

Working title: "// Processing Architecture"

## Timeframe:
W46: Kick off
W47: Sketches
W48: Visual Style
W49: Proof of concept
W50: Concept lock
W51: Buffer
W52: Vacation
W01: Phase 2: Production, planning
W02: Production
W03: Production
W04: Release

## Overview:

Walk is to develop a visual identity / design for a graduation-specific sub-site under aarch.dk.  
Referencing the below site-map, we are primarily concerned with
- 0. Develop a HTML wrapper for the various components (Box: A+B)
- 1. Develop the Student "List" view (Box: A)
- 2. Develop template for the static-page(s) (Box: B)
- 3. Ensure robust links to the WP-platform (Box: D) and collaboration with Lars/Apparat  
- 4. Research pricing and availability of "nice to have" Service features (Box: C)


## Draft sitemap:
```
                                              ┌─────────┐                                                
                                              │  Entry  │                                                
                                              └─────────┘                                                
                                                    │                                                     
                                                    │                                                     
                                                    ▼                                                     
┌───┬───────────────────┐┌───┬──────────────────────────────────────────────────┐ ┌───┬───────────────────┐
│ B │ Static pages      ││ A │                     Main                         │ │ C │   Services        │
├───┘                   │├───┘                                                  │ ├───┘                   │
│                       ││                                                      │ │                       │
│                       ││                                                      │ │                       │
│                       ││                                                      │ │                       │
│    ┌──────────────┐   ││              ┌────────────────────────┐              │ │    ┌─────────────┐    │
│    │    About     │   ││              │    Students "List"     │              │ │    │ "Book ZOOM" │    │
│    └──────────────┘   ││              └────────────────────────┘              │ │    └─────────────┘    │
│                       ││              ┌────────────────────────┐              │ │                       │
│                       ││              │   Student-pair Video   │              │ │    ┌─────────────┐    │
│                       ││              └────────────────────────┘              │ │    │  "Go Live"  │    │
│                       │└──────────────────────────────────────────────────────┘ │    └─────────────┘    │
│                       │┌───┬──────────────────────────────────────────────────┐ │                       │
│                       ││ D │              Platform (WP/Lars)                  │ │                       │
│                       │├───┘                                                  │ │                       │
│                       ││┌────────────────────────┐  ┌────────────────────────┐│ │                       │
│                       │││ (PDF) Project Download │  │   (WP) Project pages   ││ │                       │
│                       ││└────────────────────────┘  └────────────────────────┘│ │                       │
└───────────────────────┘└──────────────────────────────────────────────────────┘ └───────────────────────┘

```



## Tasks for W47/Sketches:

- Develop draft visual style (Casper)
- Develop draft list-methods (Jørgen)
- Research Services (Jørgen)
- Communicate timeline and budget (Klaus)
- Deliver student-data (Karen)
- Book meeting (Wednesday OR Friday)

## Notes on Visual style

Karen would like us to explore a "Turquoise + White + Black" colorscheme


## Notes on Student "List" view

Karen would like us to explore ways to dynamically animate circles (representing each student),
inspired by a Processing.js workshop Casper has shown her.
The (working) title "// Processing Architecture" is also highly inspired by this.
We proposed a strategy where a procedural animation algorithm is to be developed,
that can move the circles in various shapes - but also "reconfigure" the circles into
lists, groups, relations - or other.


## Team
Casper Riis Jensen <casper@walk.agency>  
Karen Kjærgaard <kje@aarch.dk>
Jørgen Skogmo <js@dearstudio.dk>
