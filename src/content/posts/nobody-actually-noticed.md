---
title: "Nobody Actually Noticed"
description: "53 Fehler, die niemand bemerkt hat, und eine über 25 Jahre alte Testart, die mit Agenten plötzlich fast nichts mehr kostet."
date: 2026-11-26
type: deep-dive
project: matrix
lang: de
image: /writing/nobody-actually-noticed/og.png
tags: [testing, property-based-testing, claude-code, agents, rust, telemetry]
draft: true
---

<!--
Gliederung (abgestimmt 2026-11-26):
1. Treppchen: NaN auf Platz 1, Nobody Actually Noticed
2. glofiish: nicht die großen Funktionen entscheiden, sondern die vielen kleinen Macken
3. Die Wende: Eigenschaftstests, über 25 Jahre alt, mit Agenten plötzlich billig
4. Zahlen
5. Setup und Telemetrie
6. Grenzen, offene Frage
-->

![Ein Siegertreppchen. Auf Platz 1 steht NaN mit Sonnenbrille und Goldmedaille. Die Zahl 0,93 auf Platz 2 ruft: „Ich hab nachgemessen: 0,93!“, die 0,91 auf Platz 3 will den Schiedsrichter sprechen. Darunter: NaN = Nobody Actually Noticed.](/writing/nobody-actually-noticed/treppchen-1600x900.png)

Beim Testen der hybriden Vektorsuche in meiner RAG-App Matrix stand auf Platz 1 ein Treffer mit dem Wert NaN. RAG heißt hier: eine App, die Fragen aus eigenen Dokumenten beantwortet und die Fundstelle dazu nennt. Die Suche verbindet Vektorsuche nach Bedeutung mit einer Suche nach Stichworten, am Ende sortiert ein Reranker die Treffer nach einem Relevanzwert. Wer oben steht, passt am besten. NaN heißt „Not a Number“, also keine Zahl. Die Sortierung kam mit diesem Wert nicht zurecht, und er rutschte nach ganz oben.

Gemerkt hat das niemand. Kein Nutzer, kein Test, ich auch nicht. Darum lese ich NaN seitdem anders: **Nobody Actually Noticed.**

Gefunden hat den Fehler ein Eigenschaftstest. Er war einer von 53 Fehlern, die in kurzer Zeit zusammenkamen, in einer Codebasis mit rund 210.000 Zeilen Code, 94.000 Zeilen Testcode und rund 5.700 automatischen Tests. Darum geht es in diesem Beitrag: um eine alte Testart, die mit Agenten auf einmal fast nichts mehr kostet, und darum, was das für die Frage bedeutet, wie viel Code man noch selbst lesen muss.

## Das glofiish

Vor fast 20 Jahren habe ich mir ein glofiish bestellt, extra aus Taiwan. Ein Handy mit Internet und Webbrowser, das war damals etwas Besonderes. Ich fand es großartig. Im Prinzip war es schon ein Smartphone.

Das Problem war, dass es ständig irgendwo hakte. Nie etwas Großes, aber jeden Tag etwas Kleines. Heute kennt das Gerät kaum noch jemand. Dann kam das iPhone, konnte am Anfang weniger und funktionierte einfach. Als erstes Smartphone ist das iPhone hängen geblieben.

Daran denke ich oft. Nutzer beschreiben selten einen einzelnen Fehler. Sie sagen, dass sich etwas komisch anfühlt. Das sind meist keine großen Abstürze, sondern viele kleine Stellen, an denen die Software ein bisschen falsch liegt.

![Eine übernächtigte Nutzerin sitzt auf einem hohen Stapel Matratzen und denkt: „Irgendwas stimmt hier nicht …“. Unter dem Bett liegen Erbsen mit Fehlernamen wie NaN, CRLF, 80≠90 und 84,5° N. Ein Roboter mit Würfel zieht eine Erbse heraus, daneben ein Glas „gefunden: 53“.](/writing/nobody-actually-noticed/erbse-1600x900.png)

## Eine alte Testart, plötzlich billig

Ein normaler Test prüft ein Beispiel, an das jemand gedacht hat. Eingabe 3, 1, 2, erwartet 1, 2, 3. Was der Entwickler nicht bedacht hat, testet er auch nicht.

Ein Eigenschaftstest prüft eine Regel, die immer gelten muss. Für eine Sortierung zum Beispiel: Danach ist jede Zahl mindestens so groß wie ihre Vorgängerin, und es fehlt keine. Der Computer würfelt dann selbst tausende Eingaben, lange Listen, leere, doppelte Werte, riesige Zahlen. Bricht eine Regel, verkleinert er das Gegenbeispiel, bis der kleinste Fall übrig ist, und speichert ihn. Ab dann läuft dieser Fall bei jedem Test fest mit.

In Matrix heißt so eine Regel zum Beispiel: Wenn man ein Dokument in Abschnitte zerlegt und die Abschnitte wieder zusammensetzt, kommt genau der Originaltext heraus. Kein Zeichen geht verloren.

Die Idee ist nicht neu. QuickCheck für Haskell gibt es seit 2000, heute gibt es so etwas für fast jede Sprache, in Rust heißt die Bibliothek proptest. In Bibliotheken und Infrastruktur ist es verbreitet, im Code der meisten Anwendungen kaum. Der Grund ist aus meiner Sicht der Aufwand. Man muss Regeln finden, realistische Eingaben erzeugen und Gegenbeispiele verstehen. Das kostet Zeit, und die hatte kaum ein Team übrig.

Genau diesen Teil macht jetzt der Agent. Er schlägt die Regeln vor, schreibt die Würfelanweisungen, liest die Gegenbeispiele und baut den Regressionstest. Bei mir bleibt nur das Lesen der Regeln, und das sind kurze Sätze wie „es geht kein Text verloren“. Was jahrzehntelang zu teuer war, kostet auf einmal fast nichts.

Und noch etwas ist wichtig. Ein Agent schreibt Tests gern so, dass sie zu seinem Code passen. Ein Eigenschaftstest lässt sich nicht so leicht zurechtbiegen, weil der Agent die gewürfelten Eingaben nicht kennt. Der Agent prüft seinen eigenen Code also mit Fällen, an die er selbst nicht gedacht hat.

## Was dabei herauskam

In kurzer Zeit fanden sich 53 echte Fehler, jeder mit einem Gegenbeispiel belegt, behoben und mit einem Regressionstest abgesichert:

- 41 direkt aus Eigenschaftstests, in sechs Runden über die Teile der App
- 4 über Mutationstests (dazu unten mehr)
- 3 durch ein lokales Sprachmodell auf meinem Windows-PC
- 5 beim Release-Lauf selbst, als die Eigenschaftstests mit 2.000 statt den üblichen Fällen liefen

Dazu ein paar Beispiele, alle aus dieser Runde:

- **NaN auf Platz 1** in der Suche, siehe oben
- **Nordpol:** Bei 84,5° nördlicher Breite fand die Zeitleiste als nächstgelegenen Ort einen, der 400 km entfernt lag, statt den in 126 km
- **80 % als 90 %:** Eine Prüfung, ob die Abschnitte nach dem Zerlegen den ganzen Text abdecken, zählte Leerzeichen nur bei den Abschnitten mit, beim Text nicht. So galt ein Ergebnis mit nur etwa 80 % des Texts schon als zu 90 % abgedeckt
- **Pfadschutz:** Er verriet, ob eine Datei existiert, auch wenn man sie nicht lesen durfte
- **Versteckte Dateien:** Ein Link auf eine versteckte Datei wurde beim Einlesen mitgelesen
- **Beschädigte PDF- und Excel-Dateien** brachten das Einlesen zum Absturz
- **Chinesisch und Japanisch:** Sätze wurden nicht getrennt, weil „。“ nicht als Satzende galt
- **E-Mails:** Eine Mail, die nur aus einem Zitatzeichen bestand, verlor beim Zerlegen genau dieses Zeichen

Kein einziger dieser Fehler war vorher bekannt. Die meisten sind klein. Zusammen sind sie aber genau die Sorte, an der das glofiish gescheitert ist.

Am meisten beeindruckt hat mich der Release. Vor dem Hochladen zu Apple lässt mein Skript die Eigenschaftstests mit 2.000 Fällen je Regel laufen. Der erste Lauf fand einen Fehler, beim Beheben kamen drei weitere ans Licht. Der zweite Lauf fand wieder einen neuen, an einer ganz anderen Stelle. Erst der dritte ging durch. Das liegt am Würfeln. Jeder Lauf zieht neue Eingaben, und ein seltener Fall taucht erst auf, wenn der Zufall ihn trifft. Bei normalen Tests passiert so etwas nie, die prüfen jeden Tag dasselbe.

Man könnte jetzt sagen, dann lass es doch gleich mit einer Million Fällen laufen. Das geht nur nicht. Schon die 2.000 Fälle je Regel brauchen rund zehn Minuten, eine Million wären mehrere Tage Rechenzeit vor jedem Release. Und auch dann bliebe es eine Stichprobe, nur eine größere. Was ich daraus mitnehme: Ein großer Suchlauf gehört nicht in den Release, sondern davor, z. B. über Nacht auf dem PC, sobald neue Regeln dazukommen. Jeder Fund wird gespeichert und läuft ab dann bei jedem Test fest mit. Der Release-Lauf ist dann nur noch das Netz für den Rest.

## Mutationstests: schwächer als gedacht

Mutationstests gelten als der strenge Maßstab. Ein Werkzeug verändert den Code absichtlich, macht zum Beispiel aus einem Plus ein Minus, und prüft, ob die Tests das merken. Was überlebt, zeigt eine Stelle, an der niemand genau hinschaut.

Ich hatte erwartet, dass sie die Fehler finden. Nach über 13.000 Mutationen waren es 4. Bei denen zeigte eine überlebende Mutation auf die Stelle, und ein Test fand dort den eigentlichen Fehler. Die übrigen 41 Funde aus den Eigenschaftstests brauchten keinen solchen Hinweis.

Daraus ist bei mir eine klare Rolle geworden. Mutationen laufen nur noch vor einem Release über den geänderten Code. Sie prüfen, ob die neuen Tests überhaupt etwas merken. Zur Fehlersuche taugen sie bei mir nicht.

## Das lokale Modell

Nebenbei habe ich ausprobiert, ob ein lokales Modell auf meinem Spiele-PC zusätzliche Fehler findet. Der Agent lief dafür nicht mit Claude, sondern mit zwei offenen Modellen mit 24 und 30 Milliarden Parametern, die ohne Netz auf der Grafikkarte rechneten. Er sollte Tests gegen die Beschreibungen im Code schreiben. In einem Durchgang sah er nur die Beschreibungen, nicht den Code selbst.

In drei Durchgängen über 19 Dateien entstanden 46 Tests, die fehlschlugen. 3 davon zeigten echte Fehler, darunter der mit dem chinesischen Satzende, alle vom kleineren Modell. Der Rest waren Missverständnisse oder kaputte Tests, und jeden davon musste anschließend wieder Claude einordnen. Die drei Durchgänge liefen zusammen rund viereinhalb Stunden. Als gelegentliche Ergänzung vor einem Release halte ich das für sinnvoll, als feste Teststufe nicht.

## Das Setup dahinter

Funktioniert hat das nur, weil der Agent nicht anders kann, als zu testen. Ein paar Dinge, die ich über die letzten Monate eingebaut habe:

- **Stop-Hooks:** Claude Code darf eine Aufgabe nicht beenden, solange der Rust-Code nicht baut, betroffene Tests rot sind oder Prüfungen scheitern
- **Pflicht zum Test:** Jede Nutzerfunktion braucht einen Regressionstest, auch über den ganzen Ablauf. Ein Fehler aus einem Nutzertest bekommt zuerst den Test, der ihn nachstellt
- **Prüfkette:** Dateien über 600 Zeilen oder fehlende Übersetzungen in einer der 16 Sprachen lassen den Lauf scheitern
- **Drei Teststufen:** Stufe 1 läuft automatisch in unter 30 Sekunden. Stufe 2 läuft vor jedem Commit in unter 5 Minuten, die Eigenschaftstests kosten dort ein paar Sekunden. Stufe 3 läuft vor dem Release mit 2.000 Fällen je Regel
- **Eigene CI:** Die GitHub-CI läuft auf meinem Windows-PC, der dafür automatisch hochfährt und danach wieder aus geht

Das Wichtigste ist für mich aber die Übersicht. Ich habe mir ein Dashboard gebaut, das für jeden Teil der App zeigt, wie viele Tests es gibt, welche seit dem letzten Release dazugekommen sind und wie viele Mutationen überleben. Ein Reiter heißt „Wirksamkeit“. Dort steht für jeden Test, wie oft er schon angeschlagen hat und ob das ein echter Fund war oder ein Test, der ohne Codeänderung mal rot und mal grün ist. Tests, die noch nie angeschlagen haben, stehen dort auch.

Das ist meine eigentliche These. Agenten schreiben inzwischen mehr Code, als ich lesen kann. Ganz ohne Code-Review traue ich mich noch nicht. Ich kann mir aber Messwerte bauen, die mir sagen, wann ich dem Code trauen kann: Wie viele Tests schlagen an, wie viele davon finden etwas, und wo schaut niemand hin. Das ist aus meiner Sicht der Weg dahin, irgendwann nicht mehr jede Zeile lesen zu müssen.

Wer kritisch ist, wird jetzt sagen: Wer den Code nicht liest, weiß gar nicht, ob die App überhaupt etwas taugt. Den Einwand verstehe ich. Ich habe aber eine Erfahrung, die mich ruhiger macht. Mein WordPress-Plugin gegen Spam läuft auf über 5.000 Seiten und entsteht auf dieselbe Art, mit dem Agenten, Tests und Prüfungen. Seit Monaten ist es weitgehend fehlerfrei: Früher kam etwa ein Fehler pro Woche, heute vielleicht einer im Monat, und an Funktionen fehlt nichts Wesentliches mehr. Früher hat der Fix eines Fehlers oft eine ganze Reihe neuer Fehler nach sich gezogen, die ich kurzfristig nachbessern musste. Das passiert heute praktisch nicht mehr. Früher wurde es mit jeder Funktion schwerer: mehr Komplexität, mehr Fehler, schwierigere Fixes. Heute ist es umgekehrt. Das Netz aus Regressionstests wird mit jedem Fix dichter, und der Agent kennt die Anwendung. Dadurch werden Änderungen mit der Zeit sicherer statt riskanter. Ehrlich gesagt wusste ich nicht, dass es so einen Zustand bei Software überhaupt gibt.

## Wo es nicht passt

Eigenschaftstests sind kein Allheilmittel. Für Oberflächen, für Abläufe über mehrere Geräte oder für fachliche Vorgaben wie „Kunde X bekommt Rabatt Y“ gibt es oft keine allgemeine Regel, nur Einzelfälle. Dort bleiben normale Tests und Ablauftests richtig.

Auch die Würfelanweisungen können falsch sein. Drei meiner Tests haben den Großteil ihrer Eingaben verworfen und dadurch kaum etwas geprüft. Aufgefallen ist das erst im Release-Lauf. Nach dem Umbau fanden sie sofort einen weiteren Fehler.

Und der Testcode ist Code, den jemand pflegen muss. Für das Zerlegen von Dokumenten stehen 4.367 Zeilen Code 505 Zeilen Eigenschaftstests gegenüber. Das ist nicht nichts. Aber ein Ergebnis zu prüfen ist fast immer einfacher, als es zu berechnen.

## Und bei euch?

Mich würde interessieren, welche Testarten ihr bei Code von Agenten nutzt. Setzt ihr auf Review durch ein zweites Modell, auf Mutationen, auf Eigenschaftstests oder auf etwas ganz anderes? Und wie merkt ihr, ob eure Tests überhaupt etwas finden?
