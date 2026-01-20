# Complete Guide - Game Jam with Unity 6

## Executive Summary

This guide provides everything needed for a team of 4 people (Game Designer, Programmer, 3D Modeler, Animator) to successfully complete a 48-72 hour game jam using Unity 6.

**Core principle:** Done is better than perfect.

---

## 1. Team Operations

### Team Structure

| Role | Responsibilities |
|------|------------------|
| Game Designer | Concept, GDD, level design, testing, audio |
| Programmer | Unity, C#, integration, builds, Git |
| 3D Modeler | 3D assets, Blender, FBX export |
| Animator | Rigging, Mixamo, animations, Unity Animator |

### Communication

**Stand-ups every 6-8 hours:**
1. What did you complete?
2. What will you work on now?
3. Is anything blocking you?

**Channels:**
- Discord/Slack for quick chat
- GitHub Issues for formal tasks
- Notion for documentation

### Work Pipeline

```
Game Designer → Defines mechanics and creates GDD
       ↓
Modeler → Creates 3D assets
       ↓
Animator → Rigs and animates
       ↓
Programmer → Integrates in Unity
       ↓
Game Designer → Testing and iteration
```

---

## 2. Task Management

### P0-P3 Priority System

| Priority | Description | Deadline |
|----------|-------------|----------|
| P0 | Without this there's NO game | First Playable (Hour 8) |
| P1 | Significantly improves experience | Feature Complete (Hour 36) |
| P2 | Nice to have | Only if there's time |
| P3 | Cut first | Probably won't make it |

### Critical Milestones (48h Jam)

```
Hour 0-3: Planning and GDD
Hour 8: FIRST PLAYABLE - Basic functional game
Hour 36: FEATURE COMPLETE - All mechanics done
Hour 45: CODE FREEZE - DON'T touch code
Hour 48: SUBMISSION - Final delivery
```

### Golden Rules

1. If no First Playable by hour 12 → Cut scope NOW
2. After Feature Complete → NO new features
3. Code Freeze is sacred → Use last stable build if issues

---

## 3. Game Design Document (GDD)

### Minimal Template

```markdown
# [Game Name]

## Concept
[1-2 paragraphs]

## Core Loop
1. [Action]
2. [Result]
3. [Loop]

## Main Mechanic
[Detailed description]

## Win/Lose
- Win: [Condition]
- Lose: [Condition]

## MVP Scope (P0)
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
```

### Scope Validation

Before starting, ask yourself:
- Can I explain the game in 1 sentence?
- Is the main mechanic technically feasible?
- Is the scope realistic for 48h?
- Is each feature truly necessary?

---

## 4. Operational Plan

### Day 1 (Hours 0-24)

**Hours 0-3: Setup**
- Create Unity project
- Configure Git
- Create GDD and tasks in GitHub

**Hours 3-8: Core Gameplay**
- Implement main mechanic
- Placeholder assets
- → GOAL: First Playable

**Hours 8-24: P1 Features**
- Implement secondary features
- Integrate assets
- Continuous testing

### Day 2 (Hours 24-48)

**Hours 24-36: Content and Polish**
- Level design
- Audio integration
- → GOAL: Feature Complete

**Hours 36-45: Bug Fixing**
- Only fixes, NO new features
- Visual/audio polish
- → GOAL: Code Freeze (Hour 45)

**Hours 45-48: Submission**
- Final builds
- Testing
- Upload to platform

---

## 5. Resources and Tools

### Free Assets

| Resource | Content |
|----------|---------|
| Kenney.nl | Props, UI, audio |
| Mixamo | Characters, animations |
| Freesound.org | SFX |
| Incompetech | Music |
| Poly Haven | Textures, HDRIs |

### Software

| Tool | Use |
|------|-----|
| Unity 6 | Game engine |
| Blender | Modeling and animation |
| Visual Studio/Rider | C# programming |
| Git + GitHub | Version control |
| Audacity | Audio editing |
| Figma | UI design |

---

## 6. Quick Troubleshooting

### Common Problems

| Problem | Solution |
|---------|----------|
| Incorrect model scale | Blender: Ctrl+A → All Transforms before export |
| Animation doesn't play | Verify Animator Controller assigned and parameters |
| Git conflict in scenes | Split into multiple scenes, communicate before editing |
| Build fails | Verify scenes in Build Settings, check console errors |
| Low performance | Reduce poly count, optimize scripts, use profiler |

### Crisis Management

**If you're behind:**
1. Evaluate: How many hours left?
2. Cut: P2/P3 features first
3. Prioritize: P0 only
4. Communicate: Everyone must know the new plan

**If there are critical bugs near deadline:**
1. Is it really P0?
2. Is there a workaround?
3. If can't fix → Use last stable build

---

## 7. Final Checklist

### Before Submission

**Functionality:**
- [ ] Game starts without errors
- [ ] Controls work
- [ ] Win/Lose conditions work
- [ ] Can play from start to finish

**Polish:**
- [ ] Main menu
- [ ] Audio integrated
- [ ] Readable UI
- [ ] At least 1 complete level

**Submission:**
- [ ] Working build
- [ ] Screenshots
- [ ] Written description
- [ ] Controls documented
- [ ] Team credits
- [ ] Uploaded before deadline

---

## Final Philosophy

> **A simple finished game always beats an ambitious unfinished game.**

The only way to fail a game jam is to not submit. Everything else is learning.

**Done is better than perfect. Always.**
