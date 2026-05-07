---
title: "Dincolo de prompt: produse AI fiabile"
excerpt: "De la prototip la producție cu evaluare, retry și guardrails."
date: "2026-02-10"
readingMinutes: 7
imageSeed: "blog-reliable-ai"
tags:
  - AI
  - Inginerie
  - Claude
---

Cea mai grea parte a livrării unui produs AI nu e modelul — e tot ce-l înconjoară. Iată sistemul pe care îl pun în jurul fiecărei funcționalități pe Claude pe care o livrez.

## Eval înainte de product-market fit

O funcționalitate nouă nu ajunge la utilizatori până nu are un set de eval. Chiar și cinci exemple curate manual bat livrarea oarbă. Setul de eval trăiește într-un CSV, e re-rulat la fiecare schimbare de prompt, iar deltele sunt revizuite în PR.

## Retry cu constrângeri de schemă

Modelele returnează ocazional output malformat. Niciodată nu las un singur răspuns prost să ajungă la utilizator. Învelesc fiecare apel către model în:

1. Validare de schemă (zod sau pydantic)
2. Retry pe eșec de validare cu eroarea originală adăugată la prompt
3. Plafon dur de trei încercări; fallback la un șablon determinist

## Guardrails potrivite cu amenințarea

Nu orice produs are nevoie de un pipeline de moderare a conținutului. Întrebarea corectă e: "Care e cel mai rău output plauzibil și care e costul să scape?" Pentru un chat public, ai nevoie de filtrare. Pentru o unealtă internă cu doisprezece utilizatori, nu.

## Observabilitatea nu e opțională

Loghează fiecare input, output, latență și cost al modelului. Etichetează tracele cu user-ul, funcționalitatea și versiunea promptului. Când ceva nu merge bine în săptămâna a șasea, vei ști.

## Ordinea în care livrez

1. Prompt + folosire de unelte care rulează end-to-end
2. Set de eval + verificare automată de regresie
3. Retry-uri și fallback-uri
4. Observabilitate
5. Guardrails de cost (plafoane, alerte)
6. *Apoi* invită utilizatorii

Sari peste pași și-i plătești mai târziu. Întotdeauna.
