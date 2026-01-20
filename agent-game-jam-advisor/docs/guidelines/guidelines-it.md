# Guida Completa - Game Jam con Unity 6

## Sommario Esecutivo

Questa guida fornisce tutto il necessario per un team di 4 persone (Game Designer, Programmatore, Modellatore 3D, Animatore) per completare con successo una game jam di 48-72 ore usando Unity 6.

**Principio fondamentale:** Done is better than perfect.

---

## 1. Operazioni del Team

### Struttura del Team

| Ruolo | Responsabilità |
|-------|----------------|
| Game Designer | Concept, GDD, level design, testing, audio |
| Programmatore | Unity, C#, integrazione, build, Git |
| Modellatore 3D | Asset 3D, Blender, esportazione FBX |
| Animatore | Rigging, Mixamo, animazioni, Unity Animator |

### Comunicazione

**Stand-up ogni 6-8 ore:**
1. Cosa hai completato?
2. Su cosa lavorerai ora?
3. C'è qualcosa che ti blocca?

**Canali:**
- Discord/Slack per chat veloce
- GitHub Issues per task formali
- Notion per documentazione

### Pipeline di Lavoro

```
Game Designer → Definisce meccaniche e crea GDD
       ↓
Modellatore → Crea asset 3D
       ↓
Animatore → Rigga e anima
       ↓
Programmatore → Integra in Unity
       ↓
Game Designer → Testing e iterazione
```

---

## 2. Gestione dei Task

### Sistema di Priorità P0-P3

| Priorità | Descrizione | Deadline |
|----------|-------------|----------|
| P0 | Senza questo NON c'è gioco | First Playable (Ora 8) |
| P1 | Migliora significativamente l'esperienza | Feature Complete (Ora 36) |
| P2 | Nice to have | Solo se c'è tempo |
| P3 | Da tagliare per primo | Probabilmente non entrerà |

### Milestone Critiche (Jam 48h)

```
Ora 0-3: Pianificazione e GDD
Ora 8: FIRST PLAYABLE - Gioco base funzionale
Ora 36: FEATURE COMPLETE - Tutte le meccaniche
Ora 45: CODE FREEZE - NON toccare il codice
Ora 48: SUBMISSION - Consegna finale
```

### Regole d'Oro

1. Se non c'è First Playable all'ora 12 → Tagliare scope ORA
2. Dopo Feature Complete → NESSUNA feature nuova
3. Code Freeze è sacro → Usare l'ultima build stabile se ci sono problemi

---

## 3. Game Design Document (GDD)

### Template Minimo

```markdown
# [Nome del Gioco]

## Concept
[1-2 paragrafi]

## Core Loop
1. [Azione]
2. [Risultato]
3. [Loop]

## Meccanica Principale
[Descrizione dettagliata]

## Win/Lose
- Win: [Condizione]
- Lose: [Condizione]

## Scope MVP (P0)
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
```

### Validazione dello Scope

Prima di iniziare, chiediti:
- Posso spiegare il gioco in 1 frase?
- La meccanica principale è tecnicamente fattibile?
- Lo scope è realistico per 48h?
- Ogni feature è davvero necessaria?

---

## 4. Piano Operativo

### Giorno 1 (Ore 0-24)

**Ore 0-3: Setup**
- Creare progetto Unity
- Configurare Git
- Creare GDD e task in GitHub

**Ore 3-8: Core Gameplay**
- Implementare meccanica principale
- Asset placeholder
- → OBIETTIVO: First Playable

**Ore 8-24: Feature P1**
- Implementare feature secondarie
- Integrare asset
- Testing continuo

### Giorno 2 (Ore 24-48)

**Ore 24-36: Contenuto e Polish**
- Level design
- Integrazione audio
- → OBIETTIVO: Feature Complete

**Ore 36-45: Bug Fixing**
- Solo fix, NESSUNA feature nuova
- Polish visivo/audio
- → OBIETTIVO: Code Freeze (Ora 45)

**Ore 45-48: Submission**
- Build finali
- Testing
- Upload sulla piattaforma

---

## 5. Risorse e Strumenti

### Asset Gratuiti

| Risorsa | Contenuto |
|---------|-----------|
| Kenney.nl | Props, UI, audio |
| Mixamo | Personaggi, animazioni |
| Freesound.org | SFX |
| Incompetech | Musica |
| Poly Haven | Texture, HDRI |

### Software

| Strumento | Uso |
|-----------|-----|
| Unity 6 | Motore di gioco |
| Blender | Modellazione e animazione |
| Visual Studio/Rider | Programmazione C# |
| Git + GitHub | Controllo versione |
| Audacity | Editing audio |
| Figma | Design UI |

---

## 6. Troubleshooting Rapido

### Problemi Comuni

| Problema | Soluzione |
|----------|-----------|
| Scala modello incorretta | Blender: Ctrl+A → All Transforms prima di esportare |
| Animazione non si riproduce | Verificare Animator Controller assegnato e parametri |
| Git conflict nelle scene | Dividere in più scene, comunicare prima di modificare |
| Build fallisce | Verificare scene in Build Settings, errori in console |
| Performance bassa | Ridurre poly count, ottimizzare script, usare profiler |

### Gestione delle Crisi

**Se siete in ritardo:**
1. Valutare: Quante ore rimangono?
2. Tagliare: Feature P2/P3 prima
3. Prioritizzare: Solo P0
4. Comunicare: Tutti devono conoscere il nuovo piano

**Se ci sono bug critici vicino alla deadline:**
1. È davvero P0?
2. C'è un workaround?
3. Se non si può risolvere → Usare l'ultima build stabile

---

## 7. Checklist Finale

### Prima della Submission

**Funzionalità:**
- [ ] Il gioco si avvia senza errori
- [ ] I controlli funzionano
- [ ] Le condizioni Win/Lose funzionano
- [ ] Si può giocare dall'inizio alla fine

**Polish:**
- [ ] Menu principale
- [ ] Audio integrato
- [ ] UI leggibile
- [ ] Almeno 1 livello completo

**Submission:**
- [ ] Build funzionante
- [ ] Screenshot
- [ ] Descrizione scritta
- [ ] Controlli documentati
- [ ] Crediti del team
- [ ] Caricato prima della deadline

---

## Filosofia Finale

> **Un gioco semplice finito batte sempre un gioco ambizioso non finito.**

L'unico modo per fallire una game jam è non consegnare. Tutto il resto è apprendimento.

**Done is better than perfect. Sempre.**
