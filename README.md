#  Digital Doubt Diary

> A production-quality mental health journaling and cognitive reframing web application that leverages Natural Language Processing (NLP) and Large Language Models to transform anxious thoughts into balanced perspectives using Cognitive Behavioral Therapy (CBT) principles.

---

##  The Problem It Solves

Anxiety often distorts our thinking through cognitive biases like catastrophizing, mind-reading, and black-and-white thinking. When spiraling, it is difficult to break out of emotional reasoning objectively on your own. 

**Digital Doubt Diary** acts as an intelligent, empathetic companion that uses NLP to parse your raw thoughts, identify underlying cognitive distortions, weigh evidence objectively, and systematically build grounded, evidence-based counter-perspectives in real time.

---

##  What It Does

- **NLP-Powered Cognitive Analysis**: Utilizes advanced natural language processing to semantically analyze unstructured journal text, classify cognitive distortions, and extract structured psychological insights.
- **Real-Time CBT Reframing**: Weighs evidence for and against your thoughts to generate a compassionate, balanced counter-perspective.
- **Integrated Crisis Detection**: Combines text pattern matching and intent recognition *before* API calls to scan for distress or self-harm language, instantly surfacing emergency helpline resources (e.g., 988).
- **Customizable Challenge Levels**: Adjusts the NLP prompt tone dynamically—ranging from *Gentle* (nurturing and empathetic) to *Balanced* or *Rigorous* (direct and intellectually probing).
- **Gamified Streak Tracking**: Encourages daily mental health check-ins with an automatic activity streak counter.
- **Mood Tracking & History**: Logs emotional intensity (1–5) alongside historical journal entries with instant search and filtering.
- **Calm, Responsive Design**: Features a modern, minimalist interface with a full dark/light mode toggle.

---

##  Tech Stack & NLP Architecture

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + Zod Validation
- **NLP & AI Engine**: Groq API powered by open-weights LLMs (Llama) for lightning-fast semantic text understanding and structured JSON extraction
- **Database**: Local JSON storage (`data.json`) for zero-configuration, lightweight persistence
