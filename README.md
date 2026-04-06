# Deja Vu Playground

An interactive visual builder for composing complex recurring schedules using the [Deja Vu](https://www.npmjs.com/package/@rutaks/deja-vu) library.

Drag-and-drop simple scheduling expressions onto a canvas, combine them with set operations (union, intersection, difference), and see the results in a real-time calendar preview.

## Features

- **Drag-and-drop builder**: compose schedules from leaf expressions (Day in Week, Day in Month, Range/Year) and composite operations (Union, Intersection, Difference)
- **Move existing expressions**: rearrange nodes within the tree using drag handles
- **Calendar preview**: see which dates match your schedule in a 3-month rolling view
- **API Explorer**: interactively test schedule methods (isOccurring, slots, datesInRange, nextOccurrence, previousOccurrence) against your built schedule
- **JSON output**: view the generated schedule configuration with syntax highlighting, copy, and share
- **Validation**: inline error messages, drop hints for composite expressions, and runtime detection of logically empty schedules
- **Info popovers**: click the (i) icon on any expression to learn what it does and when to use it
- **Presets**: load common schedule patterns with one click
- **URL sharing**: encode your schedule into a shareable link
- **Dark/light theme**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Links

- **Deja Vu library**: [github.com/rutaks/deja-vu](https://github.com/rutaks/deja-vu)
- **npm package**: [npmjs.com/package/@rutaks/deja-vu](https://www.npmjs.com/package/@rutaks/deja-vu)

## Tech Stack

- [Next.js](https://nextjs.org) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn](https://ui.shadcn.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop
- [@rutaks/deja-vu](https://www.npmjs.com/package/@rutaks/deja-vu) for schedule parsing and evaluation
